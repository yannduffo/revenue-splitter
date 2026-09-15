# IDEAS

Deferred scope and future work.

## Contracts

### v1 improvements
- Reentrancy test with an ERC-777 mock token
- `createSplitterDeterministic` — predictable addresses, simpler frontend UX
- Calibrate `MAX_CLAIM_BATCH` with gas snapshots instead of a round number

### v2
- **Mutable share allocation** with an admin role (`updateShares`, `transferAdmin`,
  `renounceAdmin`) — cut from v1 because it carries almost all of the accounting
  complexity, and one blocking point is still open (see SPEC §9)
- **Native ETH support** — cut from v1 to keep a single code path. Wrapping to
  WETH covers the use case in the meantime.
- **Claiming on behalf of another member** — UX improvement, not essential
- **Continuous streaming** — pay out over time rather than on claim. Use cases:
  team payroll, monthly retainers.
- Reclaiming a member slot

### Later
- Governance and voting over allocation changes
- Protocol fees

## Frontend

### Performance
- **Indexer** — the real fix. Direct log queries make first loads slow and would
  not hold under traffic. The data access layer in `lib/chain/` is isolated so the
  swap stays contained.
- Cache logs more aggressively in the meantime, to cut API calls
- Confirm Multicall3 is actually used through Infura

### Features
- **WalletConnect connector** — mobile browsers are read-only without it
- **Guided tour** — interactive walkthrough of a splitter, replacing the current
  text-only explanations in the demo panel
- **Demo mode with account abstraction** — let visitors interact without a wallet,
  via a relayer or the demo member keys held server-side
- Dynamic page titles per splitter
