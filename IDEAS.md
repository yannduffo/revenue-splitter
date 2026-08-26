# IDEAS

### V1 improvment : 
- Reentrency test with ERC777 mock token
- `createSplitterDeterministic` to be predictible and optimise front-end UX
 
### V2 : 
- Continuous payment streaming : instead of distributing  founds upon receipt, the treasury pays them out continuonsly. Use cases : team payroll, service providers on a monthly retainer, ...
- Claim token on behalf of another : UX improvment, not essential for v1
- Mutable share allocation with an admin role (updateShares, transferAdmin, renounceAdmin) : cut from v1 because it carries almost all of the accounting complexity and a blocking point to resolve (see SPEC §9).
- Native ETH support : cut from v1 to keep a single code path. Wrapping to WETH covers the use case in the meantime.

### Functional : 
- Reclaiming member slot

### Others :
- Governance and voting for share allocation changes
- Protocol fees
