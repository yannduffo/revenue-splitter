# SPEC.md

Design document. Pre-development. Will be updated along project advancement. 

## 1. The product 

A team creates a shared account. Each member is assigned a percentage of it. Anyone can send money to that account, and every member can withdraw their percentage any time, withour asking anyone's permission. 

There is non treasurer, no spreadsheet, and no one who has to remember to forward money. The split is defined once, publicly and enforced automatically. It is also final : the allocation is fixed at creation and nobody can ever change it, not even the team that created it.

Members are never paid automatically. They withdraw when they choose to. This is a deliberate design decision. 

Use cases : 
- A collective of freelances invoicing a client as on entity
- Music band sharing royalty income
- A small working team splitting a shared revenue stream (agency, side project, ...)


## 2. Scope

### In v1
- Create a splitter with a member list and their shares, fixed once and for all at creation
- Receive any ERC-20 (-> multi-token), from anyone, with no prior registration
- Members withdraw their own balance (pull model)
- Full history of deposits and withdrawals, indexed off-chain

### Explicitly out of v1
- Native ETH (v2). Wrap to WETH and use it like any other ERC-20
- Mutable share allocation and the admin role that goes with it (v2)
- Continuous streaming of payments (v2)
- Claiming on behalf of others (v2)
- Governance or voting on share changes
- Protocol fees
- Transferable share ownership
- Vesting, lockups or time-based conditions
- Any off-chain component other than the indexer


## 3. Actors and roles 

| Role | Can | Cannot |
|---|---|---|
| Member | Withdraw their own accrued balance, for any token, at any time. Read all splitter state. | Change shares allocation. Withdraw on behalf of others. Prevent others from withdrawing. Leave on their own. |
| Payer (anyone) | Send any ERC-20 to the splitter address. | Anything else. The splitter has no entry point for a payer at all. |
| Factory owner | Nothing operational (factory is ownerless after deployment) | - |

**What immutability guarantees :** no role can change the distribution. There is no privileged address in a splitter : the allocation agreed at creation is the only one the contract will ever apply, and the only funds movement the contract can perform is a member claiming their own share. 



## 4. Actions

#### `SplitterFactory.createSplitter(address[] members, uint256[] shares)`

Caller : anyone

Preconditions : 
- `members.length == shares.length`
- `1 <= members.length <= MAX_MEMBERS`
- no duplicate
- no zero address
- every share `>0`
- `sum(shares) == TOTAL_SHARES`

Effects : deploys a minimal proxy (EIP-1167) pointing at the Splitter implementation. Initialize members and shares.

Event : `SplitterCreated(address splitter, address[] members, uint256[] shares)`

Note : the implementation contract (EIP1167 model) is deployed once and initialized immediately so it cannot be initialized by anyone else. 


#### plain ERC-20 transfer
Caller: anyone

Effects: none on contract state. Funds simply sit in the contract until the next internal `sync` attributes them. This is what makes the splitter usable as a plain payment address: a payer needs no integration, no approval, and no knowledge that it's a splitter.

Event: none (impossible to detect).


#### `_sync(address token)` — internal
Caller: the contract itself, at the start of every `claim`. Not exposed in v1.

Preconditions: none

Effects: computes `delta = currentBalance - lastKnownBalance[token]`. increases `accPerShare[token]` by `delta * PRECISION / TOTAL_SHARES`. increases `lastKnownBalance[token]` and `totalAttributed[token]`

Event: `Synced(address token, uint256 amount, uint256 newAccPerShare)`

Note: with no public entry point, a token is attributed only when a member claims it. Nothing is lost in the meantime : the delta is read from the balance, so any number of unsynced deposits is absorbed at once by the next claim. A public `sync` may come back if the indexer needs `Synced` events independently of claims.


#### `_claim(address token, address member) returns (uint256)` — internal
Caller: `claim` and `claimMany` only. The whole claiming logic lives here; the two entry points only decide when a zero result is an error.

Effects: `_sync(token)` first; computes the member's pending amount (§5), truncated down to the atomic unit (D3); resets their accumulator checkpoint. If the amount is non-zero : transfers it, decreases `lastKnownBalance[token]`, increases `totalClaimed[token]`, emits `Claimed`. Returns the amount transferred, zero included.

Reverts: never on its own account — a member with nothing pending is not an error here. Only the token transfer itself can revert.

Event: `Claimed(address token, address member, uint256 amount)`, **only when `amount > 0`**. A zero amount does nothing at all : no transfer, no event. Some ERC-20 revert on a zero-value transfer, and a zero `Claimed` would pollute the indexer for no information.


#### `claim(address token)`
Caller: a member

Effects: `_claim(token, msg.sender)`

Reverts: the returned amount is zero (nothing to claim); token transfer fails

Reentrancy: `nonReentrant` + strict checks-effects-interactions. `_claim` is where the only external call to an arbitrary address happens, and it is never reachable outside a guarded entry point.


#### `claimMany(address[] tokens)`
Caller: a member

Preconditions: `1 <= tokens.length <= MAX_CLAIM_BATCH`

Effects: loops over `tokens`, calling `_claim(token, msg.sender)` and summing the returned amounts.

Reverts: only if the **total** is zero. A single token with nothing pending must not take the whole batch down — that is the entire reason `_claim` returns instead of reverting.

Note: duplicates in `tokens` are allowed and need no check. The first pass moves the member's checkpoint up, so every later pass on the same token returns zero and does nothing.

Reentrancy: `nonReentrant`, one guard for the whole batch.



## 5. Data model

```solidity
uint256 constant TOTAL_SHARES = 10_000; //basis points
uint256 constant PRECISION = 1e18;
uint256 constant MAX_MEMBERS = 50;
uint256 constant MAX_CLAIM_BATCH = 20; //max tokens per claimMany call

mapping(address member => uint256) shares; //basis points, sum = TOTAL_SHARES, never modified after creation
address[] memberList; //for enumeration off-chain only

mapping(address token => uint256) accPerShare; //scaled by PRECISION
mapping(address token => uint256) lastKnownBalance; //attributed balance
mapping(address token => mapping(address member => uint256)) lastAccPerShare;

//bookkepping (for invariant & UI)
mapping(address token => uint256) totalAttributed; //what a sync has actually attributed, not what has landed on the contract
mapping(address token => uint256) totalClaimed;

```

**Pending amount for a member:**
```bash
pending(token, member) = (accPerShare[token] - lastAccPerShare[token][member]) * shares[member] / PRECISION
```

`accPerShare[token]` is a global counter of everything the contract has ever received for that token, expressed per share. `lastAccPerShare[token][member]` is the member's own bookmark on that counter : the value it had the last time they claimed. Everything the counter has accumulated past that bookmark is income the member has not been paid yet. Since `shares[member]` never changes, nothing has ever to be settled outside of a claim : the accumulator gap alone always describes exactly what a member is owed.


**Explained with words :** Instead of pushing money to N members on every deposit (which cost unbounded gas and lets a single reverting recipient block everyone), the contract only ever increments a single global counter (`accPerShare`), and each member computes that they are owned from the difference between that counter and their own last checkpoint (`lastAccPerShare`). This is an usual pattern us by staking and reward in DeFi. 

**Deposit detection by balance difference :** The contract does not require a `deposit()` call. It infers incoming funds by comparing its actual token balance to what it has already attricuted. Consequeces, all deliberate : 
- a payer can use the splitter as a plain address
- funds sent by any means (transfer, another contract, airdrop) are aptured
- fee-on-transfer tokens work correctly for free : only what actually arrived is distributed
- the contract must never assume its balance can only grow

## 6. Invariants

To be enforced as Foundry invariant tests with a handler : 
- **INV1 : Share conservation** : `sum(shares) == TOTAL_SHARES` at all times, for any sequence of calls.
- **INV2 : Solvency** : For every token, the sum over all members of `pending(token,member)` is less than or equal to the contract's balance of that token. Not an equality : unattributed dust and just-received unsynced funds sit above it. 
- **INV3 : Conservation of value** : For every token, `totalAttributed == totalClaimed + sum(pending) + strandedDust`, where `strandedDust` is the amount lost to per-member truncation in `claim` and is monotonically non-decreasing. Separately, `balance >= lastKnownBalance` always holds, the gap being the not-yet-attributed deposit remainder that a futur sunc will absorb. Nothing appears, the only disappearance is bounded and accounted for.
- **INV4 : No double claim** : Calling `claim` twice in a row transfers zero the second time, and any two interleaved sequences of claims yield the same total per member. 
- **INV5 : Monotonicity** : `accPerShare`, `totalAttributed` and `totalClaimed` are non-decreasing. `accPerShare` never decreases even when the token balance does.
- **INV6 : No retroactive theft** : A member's pending amount never decreases except throught their own `claim`. With immutable shares this now holds by construction : no function can touch `shares`, and the only write to a member's checkpoint happens in their own claim (it stays asserted in tests because it is the property the whole accounting exists to protect, and because it is the first thing a future mutable-shares version would break).


## 7. Design decisions
 
| # | Decision | Rationale |
|---|---|---|
| D1 | **Pull, not push.** Members withdraw; the contract never sends unprompted. | Unbounded gas on N members, and a single recipient that reverts would freeze everyone's income. |
| D2 | **Deposits detected by balance difference**, not an explicit `deposit()`. | The splitter works as a plain address: no integration for the payer, funds captured however they arrive, and fee-on-transfer tokens handled correctly for free since only what actually landed is distributed. |
| D3 | **Integer-division dust exists in two distinct places.** | In `sync`, the deposit-to-accumulator conversion may leave a remainder outside `lastKnownBalance`. That remainder is never destriyed and is picked up by a later sync once it becomes divisible. In `claim`, the accumulator-to-amount conversion truncates the member's amount downward, and that remainder is permanently stranded in the contract. The accumulator has already conunted it as distributed, so no future sync can reclaim it. The first kind is recyclable, the second is not (bounded at one atomic unit per member per claim (see **8 Assumed hypothesis**)) |
| D4 | **Members cannot leave.** | Nobody can alter the allocation, so a departure could only mean forfeiting a share to the others which is not implemented in v1. |
| D6 | **Any ERC-20 accepted, no registration and no cap on the number of tokens.** | An allowlist would break D2's promise. Nothing on-chain ever loops over tokens, so nothing has to enumerate or bound them; the indexer covers off-chain enumeration. |
| D8 | **50 members maximum.** | Not required by the accumulator, which never loops over members. Bounds the creation loop and keeps off-chain enumeration and the UI sane. |
| D10 | **Rebasing tokens must not brick the contract.** A balance below `lastKnownBalance` yields a zero delta instead of an underflow; positive rebases distribute like any other income. | Correct accounting for such tokens is out of scope, but a stuck `sync` would take the whole splitter down. |
| D11 | **No close, no drain, no admin withdrawal, no recovery, no selfdestruct.** | Every recovery path is also a theft path. The absence of an escape hatch is the product. |
| D12 | **Every splitter is immutable. Shares are set at creation and no function can ever change them.** | There is no admin to trust, to transfer or to renounce : a team that trusts nobody gets that by default, and so does a team that trusts each other today but cannot promise anything about tomorrow. |
| D13 | **A batch claim never reverts on an empty token, only on an empty batch.** Capped at `MAX_CLAIM_BATCH` tokens. | Reverting the whole batch because one token happens to be at zero would make `claimMany` unusable in practice, since a member rarely has income on every token at once. The cap bounds a loop whose length is caller-supplied. |


## 8. Assumed hypothesis

- No trust assumption on any allocation authority : there is none. Nothing about future distribution has to be trusted, since distribution is fixed.
- Exotic tokens (rebasing, ERC-777 hooks, malicious) are out of the safety guarantees. They cannot corrupt other tokens accounting, since each has an independent accumulator, but their own may be meaningless.
- Funds sent to the wrong splitter are irreversibly lost (see D11)
- Members are not protected against losing their own keys.
- No protection against a member contract that reverts on receive: they simply cannot claim, and nobody else is affected. That containment is the point of the pull model.
- Front-running is not a concern: no price, no ordering advantage, no MEV in a claim.
- **A residual amount is permanetly stranded in every splitter**. Each `claim` truncates the member's share downward, so a member receives at most one atomic unit less than their exact entitlement, per claim. Those units stay in the contract balance but sit aboce `lastKnownBalance`, meaning no subsequent sync will ever redistribute them and no function can withdraw them. The upper bound (inherent to these integer accumulator type of contract) is `members * claims` atomic units : in usual use cases it will strands under 1e-14 of a token. Deliberately not mitigated.


## 9. Open questions

- **`MAX_CLAIM_BATCH = 20` is an arbitrary choice.** The real constraint is the gas cost of `claimMany`, which scales with the number of tokens in the batch and depends on how expensive each token's `transfer` is. To be calibrated with `forge snapshot` against a realistic worst case, so the cap sits comfortably under the block gas limit without being needlessly restrictive for a team invoicing in a dozen stablecoins.
- **Unsynced tokens and any future share change.** A token can be transferred to a splitter and stay unsynced for an arbitrarily long time : until someone calls `sync` for it, the contract has no way to know that token even exists, so it cannot sync it on its own before applying an allocation change. If shares ever become mutable, funds received *before* the change would therefore be distributed under the *new* allocation as soon as someone finally syncs. Harmless in v1, where no allocation can change, but any mutable-shares work must resolve it before shipping (candidates: a caller-supplied token list synced as part of the change, a delay/attestation on the change, or making the change itself token-scoped).
