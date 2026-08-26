# Revenue Splitter

An immutable on-chain revenue splitter for teams: define who gets what once, then let
anyone pay a single address and let every member withdraw their own share.

> **Status : work in progress.** Contracts are complete, tested and running locally.
> The indexer and the web interface are next. No public deployment yet.

---

## What it does

A team creates a splitter and assigns each member a fixed percentage. From then on,
anyone can send any ERC-20 token to that address (a client, a marketplace, a payment
processor) with no integration, no approval, and no awareness that the address is
anything special. Each member withdraws their own share whenever they want.

There is no treasurer, no spreadsheet, and nobody who has to remember to forward money.
There is also no admin: the allocation is fixed at creation and **no one can ever change
it**, including the team that created it. A splitter can hold any number of different
tokens, each accounted for independently.

## How it works

Two design decisions carry most of the system.

**Pull, not push.** The contract never sends money on its own. Distributing to N members
on every incoming payment would cost unbounded gas, and a single recipient whose address
reverts on receive would freeze everyone else's income. Instead, each incoming payment
only increments a single global counter (the amount received *per share*) and each
member holds a checkpoint on that counter. What a member is owed is the gap between the
counter and their own checkpoint, multiplied by their shares. Adding a fiftieth member
costs a deposit exactly nothing.

**Deposits are detected by balance difference.** There is no `deposit()` function to
call. The contract infers incoming funds by comparing its actual token balance against
what it has already attributed. A plain ERC-20 `transfer` to a splitter therefore
executes no code in the contract at all. The money simply sits there until the next
claim absorbs it, correctly and in full, however many unrecorded deposits piled up in the
meantime. This is what lets a splitter be used as an ordinary payment address, and it
also handles fee-on-transfer tokens correctly for free, since only what actually arrived
is ever distributed.

## Repository structure

```
revenue-splitter/
├── contracts/        Foundry project — Solidity sources, tests, deploy scripts
├── indexer/          Ponder indexer                (not started)
├── web/              Next.js frontend              (not started)
├── SPEC.md           Design document: actions, data model, invariants, rationale
└── IDEAS.md          Deferred scope and future work
```

## Contracts

| Contract | Role |
|---|---|
| `Splitter.sol` | Holds the member list, the share allocation and the per-token accounting. Handles claims. |
| `SplitterFactory.sol` | Deploys splitters as EIP-1167 minimal proxy clones of a single locked implementation, and records which addresses it created. |

Cloning rather than deploying a full contract each time brings creation from roughly a
million gas down to about fifty thousand. The implementation is initialized in its own
constructor so that nobody can ever claim it, and each clone is initialized in the same
transaction it is created in, so a clone is never observable in an uninitialized state.

Shares are expressed in basis points and always sum to 10,000. Everything else,
actions, revert conditions, invariants and the reasoning behind each design decision,
is in [SPEC.md](./SPEC.md).

## Testing

42 tests across three levels:

- **Unit** : nominal paths, every revert condition, and the edge cases that matter:
  indivisible deposits, amounts that truncate to zero for small shareholders, batch
  claims where some tokens have nothing to give.
- **Fuzz** : conservation of value, agreement between what the UI would display and what
  a claim actually transfers, proportionality to shares, and the equivalence between two
  successive deposits and a single deposit of their sum.
- **Invariant** : five properties asserted through a handler that fuzzes sequences of
  deposits, claims and batch claims across five members and two tokens:

  | | Property |
  |---|---|
  | INV-1 | Shares always sum to 10,000 |
  | INV-2 | The sum of everyone's claimable amounts never exceeds the contract balance |
  | INV-3 | Nothing appears from nowhere, and what disappears is bounded truncation dust |
  | INV-5 | The accumulator and the bookkeeping counters never decrease |
  | INV-6 | A member's entitlement only ever goes down through their own claim |

  INV-4 (no double claim) is a single-sequence property and is covered by unit tests
  instead.

Two Foundry profiles: the default one for fast feedback, and a `deep` profile with a much
higher run count for pre-commit and CI.

```bash
cd contracts
forge test
FOUNDRY_PROFILE=deep forge test
```

## Run locally

Requires [Foundry](https://book.getfoundry.sh/).

```bash
# terminal 1
anvil

# terminal 2
cd contracts
make deploy-seed-anvil
```

The seed script deploys the factory, two mock ERC-20 tokens, and two splitters : a simple
two-member 60/40 split and a five-member split with uneven shares where some members
have already claimed and others have not. It prints every deployed address along with
each member's shares and current claimable balance.

## Design notes

**Token discovery is off-chain by design.** A splitter keeps no on-chain list of the
tokens it holds — it never loops over tokens, so nothing needs to enumerate them. The
cost is that neither the contract nor a member can answer "what have I been paid in?"
from on-chain state alone. That question belongs to the indexing layer, which watches
ERC-20 `Transfer` events addressed to known splitters, backed by a manual
"add a token by address" input in the UI for anything it does not track.

**A residual amount is permanently stranded in every splitter.** Each claim truncates a
member's amount downward, so a member receives at most one atomic unit less than their
exact entitlement. Those units stay in the contract and no future operation redistributes
them. This is inherent to integer accumulator accounting; the bound is small enough
(under 1e-14 of a token in normal use) that mitigating it would cost far more gas than
it recovers.

**There is no escape hatch.** No admin withdrawal, no recovery function, no way to close
a splitter or drain it. Every recovery path is also a theft path, and the absence of one
is the point of the product rather than an omission.

## Prior art

[0xSplits](https://splits.org/) is the reference implementation of on-chain payment
splitting, and has grown into a full platform covering far more ground than this project
does. What you will find here is a deliberately minimal take on the same core idea:
immutable allocations, pull-based claims, no admin, small enough to read end to end in
one sitting. It is a portfolio project rather than a production protocol, and it has not
been audited.

## Roadmap

- [x] Contracts, test suite, deployment and local seeding scripts
- [ ] Ponder indexer — deposit history, per-splitter token discovery
- [ ] Web interface — create a splitter, view balances, claim, batch claim
- [ ] Sepolia deployment with verified contracts and a live demo
- [ ] v2: native ETH, mutable allocations with a settlement path, claiming on behalf of
      others

## License

MIT
