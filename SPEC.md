# SPEC.md

Design document. Pre-development. Will be updated along project advancement. 

## The product 

A team creates a shared account. Each member is assigned a percentage of it. Anyone can send money to that account, and every member can withdraw their percentage any time, withour asking anyone's permission. 

There is non treasurer, no spreadsheet, and no one who has to remember to forward money. The split is defined once, publicly and enforced automatically. If the team's composition changes, the percentage can be updated, and money that arrived before the change stays split according to the old percentages. 

Members are never paid automatically. They withdraw when they choose to. This is a deliberate design decision. 

Use cases : 
- A collective of freelances invoicing a client as on entity
- Music band sharing royalty income
- A small working team splitting a shared revenue stream (agency, side project, ...)


## Scope

### In v1
- Create a splitter with a member list and their shares
- Receive ETH and any ERC-20, from anyone, with no prior registration
- Members withdraw their own balance (pull model)
- Update the share allocation during the splitter's lifetime
- Full history of deposits and withdrawals, indexed off-chain

### Explicitly out of v1
- Continuous streaming of payments (v2)
- Claiming on behalf of others (v2)
- Governance or voting on share changes
- Protocol fees
- Transferable share ownership
- Vesting, lockups or time-based conditions
- Any off-chain component other than the indexer


## Actors and roles 

| Role | Can | Cannot |
|---|---|---|
| Member | Withdraw their own accrued balance, for any token, at any time. Read all splitter state | Change shares allocation. Withdraw on behalf of others. Prevent others from withdrawing. Leave on their own. |
| Admin (1 per splitter set at creation) | Update the share allocation. Transfer Admin rights. Renounce admin rights permanently | Withdraw the contract's funds or any other member's balance. Access member balances. Remove a member's already-accrued balance |
| Payer (anyone) | Send ETH or any ERC-20 to the splitter address. Trigger `sync` for any token | Anything else |
| Factory owner | Nothing operational (factory is ownerless after deployment) | - |

**Deliberate limit of the admin role :** The admin can change future distribution but cannot touch already earned funds. The worst he can do is set a member's future share to 0 (which is not retroactively applied). 



## Actions

#### `SplitterFactory.createSplitter(address[] members, uint16[] shares, address admin)`

Caller : anyone

Preconditions : 
- `members.length == shares.length`
- `1 <= members.length <= MAX_MEMBERS`
- no duplicate
- no zero address
- every share `>0`
- `sum(shares) == TOTAL_SHARES`

Effects : deploys a minimal proxy (EIP-1167) pointing at the Splitter implementation. Initialize members, shares and admin.

Event : `SplitterCreated(address splitter, address admin, address[] members, uint16[] shares)`

Note : the implementation contract is deployed once and initialized immediately so it cannot be initialized by anyone else. 

#### `receive()` / plain ERC-20 transfer
Caller: anyone

Effects: none on contract state. Funds simply sit in the contract until a `sync` attributes them. This is what makes the splitter usable as a plain payment address: a payer needs no integration, no approval, and no knowledge that it's a splitter.

Event: none for ERC-20 (impossible to detect); `Received(address from, uint256 amount)` for ETH.


#### `sync(address token)`
Caller: anyone (permissionless, and called internally before any state-sensitive operation)

Preconditions: none

Effects: computes `delta = currentBalance - lastKnownBalance[token]`. increases `accPerShare[token]` by `delta * PRECISION / TOTAL_SHARES`. increases `lastKnownBalance[token]` by the exactly attributable portion only (see Q1 on dust); registers the token in `registeredTokens` on first sight

Reverts: if `registeredTokens.length == MAX_TOKENS` and the token is new

Event: `Synced(address token, uint256 amount, uint256 newAccPerShare)`


#### `claim(address token)`
Caller: a member, or a former member with a non-zero balance

Effects: `sync(token)` first; computes the member's pending amount; adds any stored credit (§5); zeroes both; transfers the total; decreases `lastKnownBalance[token]`

Reverts: amount is zero; ETH transfer fails

Event: `Claimed(address token, address member, uint256 amount)`

Reentrancy: `nonReentrant` + strict checks-effects-interactions. This is the only function that makes an external call to an arbitrary address.


#### `claimMany(address[] tokens)`
Same as `claim(address token)` but for an array of tokens


#### `updateShares(ShareChange[] changes)`
The most delicate action in the system.
Caller: admin only

Preconditions: `sum(shares)` still equals `TOTAL_SHARES` after applying the changes; no duplicates in `changes`; member count stays within `MAX_MEMBERS`

Effects, strictly in this order:
- `sync()` every registered token, so that all funds already received are attributed under the current allocation
- for each member appearing in `changes`, and for each registered token, settle their pending amount into `credit[token][member]` and reset their accumulator checkpoint
only then, write the new share values

Event: `SharesUpdated(ShareChange[] changes, uint16 newTotal)`


#### `renounceAdmin()`
Caller: admin

Effects: sets admin to the zero address. Irreversible. The allocation can never change again; claims are unaffected.

Event:`AdminRenounced()`


**Why step 2 only covers changed members.** Because `accPerShare` is expressed per share and each increment already used the `TOTAL_SHARES` in force at that moment, a member whose share value doesn't change needs no settlement — their pending amount stays correct across the update. Only members whose share value actually changes must be settled, which bounds the loop to the caller's own calldata rather than the full member list. Setting a member's share to `0` removes them from future distributions while leaving their accrued credit fully claimable.

**"Removing someone** means setting their share to `0`. They stop accruing. Everything already accrued stays available.



## Data model

```solidity
uint16 constant TOTAL_SHARES = 10_000; //basis points
uint256 constant PRECISION = 1e18;
uint8 constant MAX_MEMBERS = 50;
uint8 constant MAX_TOKENS = 16;
address constant ETH = 0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE;

mapping(address member => uint16) shares; //basis points, sum = TOTAL_SHARES
address[] memberList; //for enumeration off-chain only
address admin;

address[] registeredTokens; //capped at MAX_TOKENS
mapping(address token => uint256) accPerShare; //scaled by PRECISION
mapping(address token => uint256) lastKnownBalance; //attributed balance
mapping(address token => mapping(address member => uint256)) lastAccPerShare;
mapping(address token => mapping(address member => uint256 credit)) //unclaimed

//bookkepping (for invariant & UI)
mapping(address token => uint256) totalReceived;
mapping(address token => uint256) totalClaimed;

```

**Pending amount for a member:**
```
pending(token, member) = credit[token][member] + (accPerShare[token] - lastAccPerShare[token][member]) * shares[member] / PRECISION
```


**Explained with words :** Instead of pushing money to N members on every deposit (which cost unbounded gas and lets a single reverting recipient block everyone), the contract only ever increments a single global coiunter, and each member computes qhat they are owned from the difference between that counter and their own last checkpoint. This is an usual pattern us by staking and reward in DeFi. 

**Deposit detection by balance difference :** The contract does not require a `deposit()` call. It infers incoming funds by comparing its actual token balance to what it has already attricuted. Consequeces, all deliberate : 
- a payer can use the splitter as a plain address
- funds sent by any means (transfer, another contract, airdrop) are aptured
- fee-on-transfer tokens work correctly for free : only what actually arrived is distributed
- the contract must never assume its balance can only grow

## Invariants

To be enforced as Foundry invariant tests with a handler : 
- **INV1 : Share conservation** : `sum(shares) == TOTAL_SHARES` at all times, for any sequence of calls.
- **INV2 : Solvency** : For every token, the sum over all members of `pending(token,m)` is less than or equal to the contract's balance of that token. Not an equality : unattributed dust and just-received unsynced funds sit above it. 
- **INV3 : Conservation of value** : For every token, `totalReceived == totalClaimed + sum(pending) + unattributedDust`. Nothing appears, nothing disappears.
- **INV4 : No double claim** : Calling `claim` twice in a row transfers zero the second time, and any two interleaved sequences of claims yield the same total per member. 
- **INV5 : Monotonicity** : `accPerShare`, `totalReceived` and `totalClaimed` are non-decreasing. `accPerShare` never decreases even when the token balance does.
- **INV6 : No retroactive theft** : A member's pending amount never decreases except throught their own `claim`. In particular, `updateShares` cannot reduce it.


## 7. Design decisions
 
| # | Decision | Rationale |
|---|---|---|
| D1 | **Pull, not push.** Members withdraw; the contract never sends unprompted. | Unbounded gas on N members, and a single recipient that reverts would freeze everyone's income. |
| D2 | **Deposits detected by balance difference**, not an explicit `deposit()`. | The splitter works as a plain address: no integration for the payer, funds captured however they arrive, and fee-on-transfer tokens handled correctly for free since only what actually landed is distributed. |
| D3 | **Integer-division dust is left unattributed and rolls into the next sync.** | Never destroyed, never arbitrarily assigned. It accrues until divisible, and INV-3 holds exactly. |
| D4 | **Members cannot leave on their own; the admin sets their share to zero.** | Self-removal invites accidental permanent loss of income and opens a second path into the settlement logic for no product gain. |
| D5 | **A removed member keeps their accrued balance forever.** | Direct consequence of INV-6, and the reason the admin role is safe to hand out. |
| D6 | **Any ERC-20 accepted, capped at 16 registered tokens.** | An allowlist would break D2's promise. The cap exists only to bound the `updateShares` loop. |
| D7 | **Native ETH via the `0xEee…EEeE` sentinel.** | Established convention (1inch, Aave); one code path, one accumulator mapping. |
| D8 | **50 members maximum.** | Not required by the accumulator, which never loops over members. Bounds the creation loop and keeps off-chain enumeration and the UI sane. |
| D9 | **Shares can change while funds are unclaimed.** | Forbidding it would make the feature useless, since an active splitter almost always holds unclaimed funds. Safety comes from the ordering in §4, not from a restriction. |
| D10 | **Rebasing tokens must not brick the contract.** A balance below `lastKnownBalance` yields a zero delta instead of an underflow; positive rebases distribute like any other income. | Correct accounting for such tokens is out of scope, but a stuck `sync` would take the whole splitter down. |
| D11 | **No close, no drain, no admin withdrawal, no recovery, no selfdestruct.** | Every recovery path is also a theft path. The absence of an escape hatch is the product. |
| D12 | **Admin rights can be renounced permanently.** | The mechanism by which a team that doesn't trust anyone gets an immutable split. |


## Assumed hypothesis

- The admin is trusted for *future* allocation only. Renouncing removes even that.
- Exotic tokens (rebasing, ERC-777 hooks, malicious) are out of the safety guarantees.
  They cannot corrupt other tokens' accounting, since each has an independent
  accumulator, but their own may be meaningless.
- Funds sent to the wrong splitter are irreversibly lost (see D11)
- Members are not protected against losing their own keys.
- A member whose share reaches zero keeps their slot in `memberList`, so departures still
  count against `MAX_MEMBERS`. A known limitation on high-churn teams; reclaiming slots would require proving a zero balance across every token.
- No protection against a member contract that reverts on receive: they simply cannot
  claim, and nobody else is affected. That containment is the point of the pull model.
- Front-running is not a concern: no price, no ordering advantage, no MEV in a claim.


## Open questions

- `MAX_TOKENS = 16` is an aritrary choice. The real constraint is the gas cost of `updateShares`, which scales with registered tokens * changed members. To be calibrated with `forge snapshot` against realistic worst case.
