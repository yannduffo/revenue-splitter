# Contracts addresses on Sepolia :

### Tokens

|Name|Symbol|Decimals|Address|
|:--|:--|:--|:--|
|`Demo Euro`|`dEUR`|`18`|`0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b`|
|`Demo Dollar`|`dUSD`|`6`|`0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f`|

### Splitter Factory

|Name|Address|BlockNumber|
|:--|:--|:--|
|Factory|`0x2A8B524C1fe5ff0687E642A5611BE907cfe902e0`|`11667295`|
|Implementation|`0x8371833b4Ac9aff2BEF24B3964015B2C209C8cDa`||

### Sample accounts addresses

|id|Address|SepoliaETH (for gas)|
|:--|:--|:--|
|0 |`0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0`|Sent 0.05 SepoliaETH|
|1 |`0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d`|Sent 0.05 SepoliaETH|
|2 |`0xf6697AA5e6322EaAC6cEd381B506C753F1425390`|Sent 0.05 SepoliaETH|
|3 |`0x2A9d16899c4a60780d08449c5268b5483b847455`|Sent 0.05 SepoliaETH|

### Demo Splitter A

Demo splitter caracteristics :
- 2 members (shares respectively are [6_000, 4_000])
- 1 tokens ("Demo Euro")
- State : 10 dEUR received, no one claimed

|Name|Address|
|:--|:--|
|Demo Splitter A |`0xDdbea380B9340978F7Cac49fd050A5A85a1672FA`|

### Demo Splitter B

Demo splitter caracteristics :
- 4 members (shares respectively are [3_500, 2_777, 2_500, 1_223])
- 2 tokens ("Demo Euro" & "Demo Dollar")
- State : 
  - member0 : claimed dUSD one time
  - member1 : claimed dEUR early and dUSD lately
  - member2 : claimed everything before last deposit
  - member3 : claimed early on dEUR and dUSD and nothing after

|Name|Address|
|:--|:--|
|Demo Splitter B |`0xA95331F3E3CB06BBd4D379f3140ab268f13F9761`|

### Log seeding : 
```bash
No files changed, compilation skipped
Traces:
  [3254603] SeedSepolia::run()
    ├─ [1497406] → new HelperConfig@0xC7f2Cf4845C6db0e1a1e91ED41Bcd0FcC1b0E141
    │   └─ ← [Return] 7144 bytes of code
    ├─ [1078] HelperConfig::getConfig() [staticcall]
    │   └─ ← [Return] NetworkConfig({ token1: 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b, token2: 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f })
    ├─ [0] VM::envAddress("SEPOLIA_FACTORY_ADDRESS") [staticcall]
    │   └─ ← [Return] <env var value>
    ├─ [0] VM::envString("SEPOLIA_DEMO_MNEMONIC") [staticcall]
    │   └─ ← [Return] <env var value>
    ├─ [0] VM::deriveKey(<pk>) [staticcall]
    │   └─ ← [Return] <pk>
    ├─ [0] VM::addr(<pk>) [staticcall]
    │   └─ ← [Return] 0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0
    ├─ [0] console::log("member", 0, 0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] VM::deriveKey(<pk>) [staticcall]
    │   └─ ← [Return] <pk>
    ├─ [0] VM::addr(<pk>) [staticcall]
    │   └─ ← [Return] 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d
    ├─ [0] console::log("member", 1, 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] VM::deriveKey(<pk>) [staticcall]
    │   └─ ← [Return] <pk>
    ├─ [0] VM::addr(<pk>) [staticcall]
    │   └─ ← [Return] 0xf6697AA5e6322EaAC6cEd381B506C753F1425390
    ├─ [0] console::log("member", 2, 0xf6697AA5e6322EaAC6cEd381B506C753F1425390) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] VM::deriveKey(<pk>) [staticcall]
    │   └─ ← [Return] <pk>
    ├─ [0] VM::addr(<pk>) [staticcall]
    │   └─ ← [Return] 0x2A9d16899c4a60780d08449c5268b5483b847455
    ├─ [0] console::log("member", 3, 0x2A9d16899c4a60780d08449c5268b5483b847455) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] VM::startBroadcast()
    │   └─ ← [Return]
    ├─ [217365] SplitterFactory::createSplitter([0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d], [6000, 4000])
    │   ├─ [9031] → new <unknown>@0xDdbea380B9340978F7Cac49fd050A5A85a1672FA
    │   │   └─ ← [Return] 45 bytes of code
    │   ├─ [145612] 0xDdbea380B9340978F7Cac49fd050A5A85a1672FA::initialize([0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d], [6000, 4000])
    │   │   ├─ [142901] 0x8371833b4Ac9aff2BEF24B3964015B2C209C8cDa::initialize([0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d], [6000, 4000]) [delegatecall]
    │   │   │   ├─ emit SplitterInitialized(members: [0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d], sharesDistribution: [6000, 4000])
    │   │   │   └─ ← [Stop]
    │   │   └─ ← [Return]
    │   ├─ emit SplitterCreated(splitter: 0xDdbea380B9340978F7Cac49fd050A5A85a1672FA, creator: 0x36845aEC25a40263d918aD52eA3426215A216E3A, members: [0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d], shareDistribution: [6000, 4000])
    │   └─ ← [Return] 0xDdbea380B9340978F7Cac49fd050A5A85a1672FA
    ├─ [313499] SplitterFactory::createSplitter([0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d, 0xf6697AA5e6322EaAC6cEd381B506C753F1425390, 0x2A9d16899c4a60780d08449c5268b5483b847455], [3500, 2777, 2500, 1223])
    │   ├─ [9031] → new <unknown>@0xA95331F3E3CB06BBd4D379f3140ab268f13F9761
    │   │   └─ ← [Return] 45 bytes of code
    │   ├─ [238494] 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761::initialize([0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d, 0xf6697AA5e6322EaAC6cEd381B506C753F1425390, 0x2A9d16899c4a60780d08449c5268b5483b847455], [3500, 2777, 2500, 1223])
    │   │   ├─ [238259] 0x8371833b4Ac9aff2BEF24B3964015B2C209C8cDa::initialize([0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d, 0xf6697AA5e6322EaAC6cEd381B506C753F1425390, 0x2A9d16899c4a60780d08449c5268b5483b847455], [3500, 2777, 2500, 1223]) [delegatecall]
    │   │   │   ├─ emit SplitterInitialized(members: [0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d, 0xf6697AA5e6322EaAC6cEd381B506C753F1425390, 0x2A9d16899c4a60780d08449c5268b5483b847455], sharesDistribution: [3500, 2777, 2500, 1223])
    │   │   │   └─ ← [Stop]
    │   │   └─ ← [Return]
    │   ├─ emit SplitterCreated(splitter: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, creator: 0x36845aEC25a40263d918aD52eA3426215A216E3A, members: [0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d, 0xf6697AA5e6322EaAC6cEd381B506C753F1425390, 0x2A9d16899c4a60780d08449c5268b5483b847455], shareDistribution: [3500, 2777, 2500, 1223])
    │   └─ ← [Return] 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761
    ├─ [0] VM::stopBroadcast()
    │   └─ ← [Return]
    ├─ [427] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::decimals() [staticcall]
    │   └─ ← [Return] 18
    ├─ [427] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::decimals() [staticcall]
    │   └─ ← [Return] 6
    ├─ [0] VM::startBroadcast()
    │   └─ ← [Return]
    ├─ [47317] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::mint(0x36845aEC25a40263d918aD52eA3426215A216E3A, 5000000000000000000000 [5e21])
    │   ├─ emit Transfer(from: 0x0000000000000000000000000000000000000000, to: 0x36845aEC25a40263d918aD52eA3426215A216E3A, amount: 5000000000000000000000 [5e21])
    │   └─ ← [Stop]
    ├─ [47317] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::mint(0x36845aEC25a40263d918aD52eA3426215A216E3A, 5000000000 [5e9])
    │   ├─ emit Transfer(from: 0x0000000000000000000000000000000000000000, to: 0x36845aEC25a40263d918aD52eA3426215A216E3A, amount: 5000000000 [5e9])
    │   └─ ← [Stop]
    ├─ [25745] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::transfer(0xDdbea380B9340978F7Cac49fd050A5A85a1672FA, 10000000000000000000 [1e19])
    │   ├─ emit Transfer(from: 0x36845aEC25a40263d918aD52eA3426215A216E3A, to: 0xDdbea380B9340978F7Cac49fd050A5A85a1672FA, amount: 10000000000000000000 [1e19])
    │   └─ ← [Return] true
    ├─ [3845] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::transfer(0xDdbea380B9340978F7Cac49fd050A5A85a1672FA, 25000000000000000000 [2.5e19])
    │   ├─ emit Transfer(from: 0x36845aEC25a40263d918aD52eA3426215A216E3A, to: 0xDdbea380B9340978F7Cac49fd050A5A85a1672FA, amount: 25000000000000000000 [2.5e19])
    │   └─ ← [Return] true
    ├─ [25745] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::transfer(0xDdbea380B9340978F7Cac49fd050A5A85a1672FA, 40000000 [4e7])
    │   ├─ emit Transfer(from: 0x36845aEC25a40263d918aD52eA3426215A216E3A, to: 0xDdbea380B9340978F7Cac49fd050A5A85a1672FA, amount: 40000000 [4e7])
    │   └─ ← [Return] true
    ├─ [25745] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::transfer(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, 100000000000000000000 [1e20])
    │   ├─ emit Transfer(from: 0x36845aEC25a40263d918aD52eA3426215A216E3A, to: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, amount: 100000000000000000000 [1e20])
    │   └─ ← [Return] true
    ├─ [25745] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::transfer(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, 250000000 [2.5e8])
    │   ├─ emit Transfer(from: 0x36845aEC25a40263d918aD52eA3426215A216E3A, to: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, amount: 250000000 [2.5e8])
    │   └─ ← [Return] true
    ├─ [0] VM::stopBroadcast()
    │   └─ ← [Return]
    ├─ [0] VM::startBroadcast(<pk>)
    │   └─ ← [Return]
    ├─ [170733] 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761::claim(0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b)
    │   ├─ [170564] 0x8371833b4Ac9aff2BEF24B3964015B2C209C8cDa::claim(0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b) [delegatecall]
    │   │   ├─ [850] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::balanceOf(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761) [staticcall]
    │   │   │   └─ ← [Return] 100000000000000000000 [1e20]
    │   │   ├─ emit Synced(token: 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b, amount: 100000000000000000000 [1e20], newAccPerShare: 10000000000000000000000000000000000 [1e34])
    │   │   ├─ emit Claimed(token: 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b, member: 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d, amount: 27770000000000000000 [2.777e19])
    │   │   ├─ [25745] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::transfer(0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d, 27770000000000000000 [2.777e19])
    │   │   │   ├─ emit Transfer(from: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, to: 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d, amount: 27770000000000000000 [2.777e19])
    │   │   │   └─ ← [Return] true
    │   │   └─ ← [Stop]
    │   └─ ← [Return]
    ├─ [0] VM::stopBroadcast()
    │   └─ ← [Return]
    ├─ [0] VM::startBroadcast(<pk>)
    │   └─ ← [Return]
    ├─ [205451] 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761::claimMany([0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b, 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f])
    │   ├─ [205264] 0x8371833b4Ac9aff2BEF24B3964015B2C209C8cDa::claimMany([0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b, 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f]) [delegatecall]
    │   │   ├─ [850] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::balanceOf(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761) [staticcall]
    │   │   │   └─ ← [Return] 72230000000000000000 [7.223e19]
    │   │   ├─ emit Claimed(token: 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b, member: 0x2A9d16899c4a60780d08449c5268b5483b847455, amount: 12230000000000000000 [1.223e19])
    │   │   ├─ [25745] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::transfer(0x2A9d16899c4a60780d08449c5268b5483b847455, 12230000000000000000 [1.223e19])
    │   │   │   ├─ emit Transfer(from: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, to: 0x2A9d16899c4a60780d08449c5268b5483b847455, amount: 12230000000000000000 [1.223e19])
    │   │   │   └─ ← [Return] true
    │   │   ├─ [850] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::balanceOf(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761) [staticcall]
    │   │   │   └─ ← [Return] 250000000 [2.5e8]
    │   │   ├─ emit Synced(token: 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f, amount: 250000000 [2.5e8], newAccPerShare: 25000000000000000000000 [2.5e22])
    │   │   ├─ emit Claimed(token: 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f, member: 0x2A9d16899c4a60780d08449c5268b5483b847455, amount: 30575000 [3.057e7])
    │   │   ├─ [25745] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::transfer(0x2A9d16899c4a60780d08449c5268b5483b847455, 30575000 [3.057e7])
    │   │   │   ├─ emit Transfer(from: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, to: 0x2A9d16899c4a60780d08449c5268b5483b847455, amount: 30575000 [3.057e7])
    │   │   │   └─ ← [Return] true
    │   │   └─ ← [Stop]
    │   └─ ← [Return]
    ├─ [0] VM::stopBroadcast()
    │   └─ ← [Return]
    ├─ [427] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::decimals() [staticcall]
    │   └─ ← [Return] 18
    ├─ [427] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::decimals() [staticcall]
    │   └─ ← [Return] 6
    ├─ [0] VM::startBroadcast()
    │   └─ ← [Return]
    ├─ [3845] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::transfer(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, 60000000000000000000 [6e19])
    │   ├─ emit Transfer(from: 0x36845aEC25a40263d918aD52eA3426215A216E3A, to: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, amount: 60000000000000000000 [6e19])
    │   └─ ← [Return] true
    ├─ [3845] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::transfer(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, 90000000 [9e7])
    │   ├─ emit Transfer(from: 0x36845aEC25a40263d918aD52eA3426215A216E3A, to: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, amount: 90000000 [9e7])
    │   └─ ← [Return] true
    ├─ [3845] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::transfer(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, 35000000 [3.5e7])
    │   ├─ emit Transfer(from: 0x36845aEC25a40263d918aD52eA3426215A216E3A, to: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, amount: 35000000 [3.5e7])
    │   └─ ← [Return] true
    ├─ [0] VM::stopBroadcast()
    │   └─ ← [Return]
    ├─ [0] VM::startBroadcast(<pk>)
    │   └─ ← [Return]
    ├─ [61233] 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761::claim(0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f)
    │   ├─ [61064] 0x8371833b4Ac9aff2BEF24B3964015B2C209C8cDa::claim(0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f) [delegatecall]
    │   │   ├─ [850] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::balanceOf(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761) [staticcall]
    │   │   │   └─ ← [Return] 344425000 [3.444e8]
    │   │   ├─ emit Synced(token: 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f, amount: 125000000 [1.25e8], newAccPerShare: 37500000000000000000000 [3.75e22])
    │   │   ├─ emit Claimed(token: 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f, member: 0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, amount: 131250000 [1.312e8])
    │   │   ├─ [25745] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::transfer(0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, 131250000 [1.312e8])
    │   │   │   ├─ emit Transfer(from: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, to: 0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, amount: 131250000 [1.312e8])
    │   │   │   └─ ← [Return] true
    │   │   └─ ← [Stop]
    │   └─ ← [Return]
    ├─ [0] VM::stopBroadcast()
    │   └─ ← [Return]
    ├─ [0] VM::startBroadcast(<pk>)
    │   └─ ← [Return]
    ├─ [117848] 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761::claimMany([0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b, 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f])
    │   ├─ [117661] 0x8371833b4Ac9aff2BEF24B3964015B2C209C8cDa::claimMany([0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b, 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f]) [delegatecall]
    │   │   ├─ [850] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::balanceOf(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761) [staticcall]
    │   │   │   └─ ← [Return] 120000000000000000000 [1.2e20]
    │   │   ├─ emit Synced(token: 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b, amount: 60000000000000000000 [6e19], newAccPerShare: 16000000000000000000000000000000000 [1.6e34])
    │   │   ├─ emit Claimed(token: 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b, member: 0xf6697AA5e6322EaAC6cEd381B506C753F1425390, amount: 40000000000000000000 [4e19])
    │   │   ├─ [25745] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::transfer(0xf6697AA5e6322EaAC6cEd381B506C753F1425390, 40000000000000000000 [4e19])
    │   │   │   ├─ emit Transfer(from: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, to: 0xf6697AA5e6322EaAC6cEd381B506C753F1425390, amount: 40000000000000000000 [4e19])
    │   │   │   └─ ← [Return] true
    │   │   ├─ [850] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::balanceOf(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761) [staticcall]
    │   │   │   └─ ← [Return] 213175000 [2.131e8]
    │   │   ├─ emit Claimed(token: 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f, member: 0xf6697AA5e6322EaAC6cEd381B506C753F1425390, amount: 93750000 [9.375e7])
    │   │   ├─ [25745] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::transfer(0xf6697AA5e6322EaAC6cEd381B506C753F1425390, 93750000 [9.375e7])
    │   │   │   ├─ emit Transfer(from: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, to: 0xf6697AA5e6322EaAC6cEd381B506C753F1425390, amount: 93750000 [9.375e7])
    │   │   │   └─ ← [Return] true
    │   │   └─ ← [Stop]
    │   └─ ← [Return]
    ├─ [0] VM::stopBroadcast()
    │   └─ ← [Return]
    ├─ [427] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::decimals() [staticcall]
    │   └─ ← [Return] 18
    ├─ [427] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::decimals() [staticcall]
    │   └─ ← [Return] 6
    ├─ [0] VM::startBroadcast()
    │   └─ ← [Return]
    ├─ [3845] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::transfer(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, 45000000000000000000 [4.5e19])
    │   ├─ emit Transfer(from: 0x36845aEC25a40263d918aD52eA3426215A216E3A, to: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, amount: 45000000000000000000 [4.5e19])
    │   └─ ← [Return] true
    ├─ [3845] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::transfer(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, 20000000 [2e7])
    │   ├─ emit Transfer(from: 0x36845aEC25a40263d918aD52eA3426215A216E3A, to: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, amount: 20000000 [2e7])
    │   └─ ← [Return] true
    ├─ [0] VM::stopBroadcast()
    │   └─ ← [Return]
    ├─ [0] VM::startBroadcast(<pk>)
    │   └─ ← [Return]
    ├─ [61233] 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761::claim(0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f)
    │   ├─ [61064] 0x8371833b4Ac9aff2BEF24B3964015B2C209C8cDa::claim(0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f) [delegatecall]
    │   │   ├─ [850] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::balanceOf(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761) [staticcall]
    │   │   │   └─ ← [Return] 139425000 [1.394e8]
    │   │   ├─ emit Synced(token: 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f, amount: 20000000 [2e7], newAccPerShare: 39500000000000000000000 [3.95e22])
    │   │   ├─ emit Claimed(token: 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f, member: 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d, amount: 109691500 [1.096e8])
    │   │   ├─ [25745] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::transfer(0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d, 109691500 [1.096e8])
    │   │   │   ├─ emit Transfer(from: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, to: 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d, amount: 109691500 [1.096e8])
    │   │   │   └─ ← [Return] true
    │   │   └─ ← [Stop]
    │   └─ ← [Return]
    ├─ [0] VM::stopBroadcast()
    │   └─ ← [Return]
    ├─ [0] console::log("SPLITTER_A", 0xDdbea380B9340978F7Cac49fd050A5A85a1672FA) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] console::log("SPLITTER_B", 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] console::log("TOKEN_1", 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] console::log("TOKEN_2", 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f) [staticcall]
    │   └─ ← [Stop]
    ├─ [0] console::log("FACTORY", SplitterFactory: [0x2A8B524C1fe5ff0687E642A5611BE907cfe902e0]) [staticcall]
    │   └─ ← [Stop]
    └─ ← [Stop]


Script ran successfully.

== Logs ==
  member 0 0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0
  member 1 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d
  member 2 0xf6697AA5e6322EaAC6cEd381B506C753F1425390
  member 3 0x2A9d16899c4a60780d08449c5268b5483b847455
  SPLITTER_A 0xDdbea380B9340978F7Cac49fd050A5A85a1672FA
  SPLITTER_B 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761
  TOKEN_1 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b
  TOKEN_2 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f
  FACTORY 0x2A8B524C1fe5ff0687E642A5611BE907cfe902e0

## Setting up 1 EVM.
==========================
Simulated On-chain Traces:

  [217365] SplitterFactory::createSplitter([0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d], [6000, 4000])
    ├─ [9031] → new <unknown>@0xDdbea380B9340978F7Cac49fd050A5A85a1672FA
    │   └─ ← [Return] 45 bytes of code
    ├─ [145612] 0xDdbea380B9340978F7Cac49fd050A5A85a1672FA::initialize([0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d], [6000, 4000])
    │   ├─ [142901] 0x8371833b4Ac9aff2BEF24B3964015B2C209C8cDa::initialize([0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d], [6000, 4000]) [delegatecall]
    │   │   ├─ emit SplitterInitialized(members: [0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d], sharesDistribution: [6000, 4000])
    │   │   └─ ← [Stop]
    │   └─ ← [Return]
    ├─ emit SplitterCreated(splitter: 0xDdbea380B9340978F7Cac49fd050A5A85a1672FA, creator: 0x36845aEC25a40263d918aD52eA3426215A216E3A, members: [0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d], shareDistribution: [6000, 4000])
    └─ ← [Return] 0xDdbea380B9340978F7Cac49fd050A5A85a1672FA

  [315999] SplitterFactory::createSplitter([0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d, 0xf6697AA5e6322EaAC6cEd381B506C753F1425390, 0x2A9d16899c4a60780d08449c5268b5483b847455], [3500, 2777, 2500, 1223])
    ├─ [9031] → new <unknown>@0xA95331F3E3CB06BBd4D379f3140ab268f13F9761
    │   └─ ← [Return] 45 bytes of code
    ├─ [240994] 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761::initialize([0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d, 0xf6697AA5e6322EaAC6cEd381B506C753F1425390, 0x2A9d16899c4a60780d08449c5268b5483b847455], [3500, 2777, 2500, 1223])
    │   ├─ [238259] 0x8371833b4Ac9aff2BEF24B3964015B2C209C8cDa::initialize([0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d, 0xf6697AA5e6322EaAC6cEd381B506C753F1425390, 0x2A9d16899c4a60780d08449c5268b5483b847455], [3500, 2777, 2500, 1223]) [delegatecall]
    │   │   ├─ emit SplitterInitialized(members: [0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d, 0xf6697AA5e6322EaAC6cEd381B506C753F1425390, 0x2A9d16899c4a60780d08449c5268b5483b847455], sharesDistribution: [3500, 2777, 2500, 1223])
    │   │   └─ ← [Stop]
    │   └─ ← [Return]
    ├─ emit SplitterCreated(splitter: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, creator: 0x36845aEC25a40263d918aD52eA3426215A216E3A, members: [0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d, 0xf6697AA5e6322EaAC6cEd381B506C753F1425390, 0x2A9d16899c4a60780d08449c5268b5483b847455], shareDistribution: [3500, 2777, 2500, 1223])
    └─ ← [Return] 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761

  [47317] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::mint(0x36845aEC25a40263d918aD52eA3426215A216E3A, 5000000000000000000000 [5e21])
    ├─ emit Transfer(from: 0x0000000000000000000000000000000000000000, to: 0x36845aEC25a40263d918aD52eA3426215A216E3A, amount: 5000000000000000000000 [5e21])
    └─ ← [Stop]

  [47317] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::mint(0x36845aEC25a40263d918aD52eA3426215A216E3A, 5000000000 [5e9])
    ├─ emit Transfer(from: 0x0000000000000000000000000000000000000000, to: 0x36845aEC25a40263d918aD52eA3426215A216E3A, amount: 5000000000 [5e9])
    └─ ← [Stop]

  [30545] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::transfer(0xDdbea380B9340978F7Cac49fd050A5A85a1672FA, 10000000000000000000 [1e19])
    ├─ emit Transfer(from: 0x36845aEC25a40263d918aD52eA3426215A216E3A, to: 0xDdbea380B9340978F7Cac49fd050A5A85a1672FA, amount: 10000000000000000000 [1e19])
    └─ ← [Return] true

  [13445] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::transfer(0xDdbea380B9340978F7Cac49fd050A5A85a1672FA, 25000000000000000000 [2.5e19])
    ├─ emit Transfer(from: 0x36845aEC25a40263d918aD52eA3426215A216E3A, to: 0xDdbea380B9340978F7Cac49fd050A5A85a1672FA, amount: 25000000000000000000 [2.5e19])
    └─ ← [Return] true

  [30545] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::transfer(0xDdbea380B9340978F7Cac49fd050A5A85a1672FA, 40000000 [4e7])
    ├─ emit Transfer(from: 0x36845aEC25a40263d918aD52eA3426215A216E3A, to: 0xDdbea380B9340978F7Cac49fd050A5A85a1672FA, amount: 40000000 [4e7])
    └─ ← [Return] true

  [30545] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::transfer(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, 100000000000000000000 [1e20])
    ├─ emit Transfer(from: 0x36845aEC25a40263d918aD52eA3426215A216E3A, to: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, amount: 100000000000000000000 [1e20])
    └─ ← [Return] true

  [30545] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::transfer(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, 250000000 [2.5e8])
    ├─ emit Transfer(from: 0x36845aEC25a40263d918aD52eA3426215A216E3A, to: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, amount: 250000000 [2.5e8])
    └─ ← [Return] true

  [182533] 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761::claim(0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b)
    ├─ [179864] 0x8371833b4Ac9aff2BEF24B3964015B2C209C8cDa::claim(0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b) [delegatecall]
    │   ├─ [2850] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::balanceOf(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761) [staticcall]
    │   │   └─ ← [Return] 100000000000000000000 [1e20]
    │   ├─ emit Synced(token: 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b, amount: 100000000000000000000 [1e20], newAccPerShare: 10000000000000000000000000000000000 [1e34])
    │   ├─ emit Claimed(token: 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b, member: 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d, amount: 27770000000000000000 [2.777e19])
    │   ├─ [28545] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::transfer(0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d, 27770000000000000000 [2.777e19])
    │   │   ├─ emit Transfer(from: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, to: 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d, amount: 27770000000000000000 [2.777e19])
    │   │   └─ ← [Return] true
    │   └─ ← [Stop]
    └─ ← [Return]

  [240951] 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761::claimMany([0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b, 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f])
    ├─ [238264] 0x8371833b4Ac9aff2BEF24B3964015B2C209C8cDa::claimMany([0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b, 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f]) [delegatecall]
    │   ├─ [2850] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::balanceOf(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761) [staticcall]
    │   │   └─ ← [Return] 72230000000000000000 [7.223e19]
    │   ├─ emit Claimed(token: 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b, member: 0x2A9d16899c4a60780d08449c5268b5483b847455, amount: 12230000000000000000 [1.223e19])
    │   ├─ [28545] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::transfer(0x2A9d16899c4a60780d08449c5268b5483b847455, 12230000000000000000 [1.223e19])
    │   │   ├─ emit Transfer(from: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, to: 0x2A9d16899c4a60780d08449c5268b5483b847455, amount: 12230000000000000000 [1.223e19])
    │   │   └─ ← [Return] true
    │   ├─ [2850] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::balanceOf(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761) [staticcall]
    │   │   └─ ← [Return] 250000000 [2.5e8]
    │   ├─ emit Synced(token: 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f, amount: 250000000 [2.5e8], newAccPerShare: 25000000000000000000000 [2.5e22])
    │   ├─ emit Claimed(token: 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f, member: 0x2A9d16899c4a60780d08449c5268b5483b847455, amount: 30575000 [3.057e7])
    │   ├─ [28545] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::transfer(0x2A9d16899c4a60780d08449c5268b5483b847455, 30575000 [3.057e7])
    │   │   ├─ emit Transfer(from: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, to: 0x2A9d16899c4a60780d08449c5268b5483b847455, amount: 30575000 [3.057e7])
    │   │   └─ ← [Return] true
    │   └─ ← [Stop]
    └─ ← [Return]

  [13445] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::transfer(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, 60000000000000000000 [6e19])
    ├─ emit Transfer(from: 0x36845aEC25a40263d918aD52eA3426215A216E3A, to: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, amount: 60000000000000000000 [6e19])
    └─ ← [Return] true

  [13445] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::transfer(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, 90000000 [9e7])
    ├─ emit Transfer(from: 0x36845aEC25a40263d918aD52eA3426215A216E3A, to: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, amount: 90000000 [9e7])
    └─ ← [Return] true

  [13445] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::transfer(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, 35000000 [3.5e7])
    ├─ emit Transfer(from: 0x36845aEC25a40263d918aD52eA3426215A216E3A, to: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, amount: 35000000 [3.5e7])
    └─ ← [Return] true

  [97033] 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761::claim(0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f)
    ├─ [94364] 0x8371833b4Ac9aff2BEF24B3964015B2C209C8cDa::claim(0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f) [delegatecall]
    │   ├─ [2850] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::balanceOf(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761) [staticcall]
    │   │   └─ ← [Return] 344425000 [3.444e8]
    │   ├─ emit Synced(token: 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f, amount: 125000000 [1.25e8], newAccPerShare: 37500000000000000000000 [3.75e22])
    │   ├─ emit Claimed(token: 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f, member: 0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, amount: 131250000 [1.312e8])
    │   ├─ [28545] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::transfer(0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, 131250000 [1.312e8])
    │   │   ├─ emit Transfer(from: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, to: 0xfeeCE6aC8D4FA91EFc9FBe9fbDa86cC0728FE8F0, amount: 131250000 [1.312e8])
    │   │   └─ ← [Return] true
    │   └─ ← [Stop]
    └─ ← [Return]

  [172548] 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761::claimMany([0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b, 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f])
    ├─ [169861] 0x8371833b4Ac9aff2BEF24B3964015B2C209C8cDa::claimMany([0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b, 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f]) [delegatecall]
    │   ├─ [2850] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::balanceOf(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761) [staticcall]
    │   │   └─ ← [Return] 120000000000000000000 [1.2e20]
    │   ├─ emit Synced(token: 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b, amount: 60000000000000000000 [6e19], newAccPerShare: 16000000000000000000000000000000000 [1.6e34])
    │   ├─ emit Claimed(token: 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b, member: 0xf6697AA5e6322EaAC6cEd381B506C753F1425390, amount: 40000000000000000000 [4e19])
    │   ├─ [28545] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::transfer(0xf6697AA5e6322EaAC6cEd381B506C753F1425390, 40000000000000000000 [4e19])
    │   │   ├─ emit Transfer(from: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, to: 0xf6697AA5e6322EaAC6cEd381B506C753F1425390, amount: 40000000000000000000 [4e19])
    │   │   └─ ← [Return] true
    │   ├─ [2850] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::balanceOf(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761) [staticcall]
    │   │   └─ ← [Return] 213175000 [2.131e8]
    │   ├─ emit Claimed(token: 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f, member: 0xf6697AA5e6322EaAC6cEd381B506C753F1425390, amount: 93750000 [9.375e7])
    │   ├─ [28545] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::transfer(0xf6697AA5e6322EaAC6cEd381B506C753F1425390, 93750000 [9.375e7])
    │   │   ├─ emit Transfer(from: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, to: 0xf6697AA5e6322EaAC6cEd381B506C753F1425390, amount: 93750000 [9.375e7])
    │   │   └─ ← [Return] true
    │   └─ ← [Stop]
    └─ ← [Return]

  [13445] 0x7B67f6672Da8a852CC82e1322DD1b306B47E1a1b::transfer(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, 45000000000000000000 [4.5e19])
    ├─ emit Transfer(from: 0x36845aEC25a40263d918aD52eA3426215A216E3A, to: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, amount: 45000000000000000000 [4.5e19])
    └─ ← [Return] true

  [13445] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::transfer(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, 20000000 [2e7])
    ├─ emit Transfer(from: 0x36845aEC25a40263d918aD52eA3426215A216E3A, to: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, amount: 20000000 [2e7])
    └─ ← [Return] true

  [97033] 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761::claim(0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f)
    ├─ [94364] 0x8371833b4Ac9aff2BEF24B3964015B2C209C8cDa::claim(0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f) [delegatecall]
    │   ├─ [2850] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::balanceOf(0xA95331F3E3CB06BBd4D379f3140ab268f13F9761) [staticcall]
    │   │   └─ ← [Return] 139425000 [1.394e8]
    │   ├─ emit Synced(token: 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f, amount: 20000000 [2e7], newAccPerShare: 39500000000000000000000 [3.95e22])
    │   ├─ emit Claimed(token: 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f, member: 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d, amount: 109691500 [1.096e8])
    │   ├─ [28545] 0x40FAB6b0998888EcFdd7a13FbEa81718aFfD7c0f::transfer(0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d, 109691500 [1.096e8])
    │   │   ├─ emit Transfer(from: 0xA95331F3E3CB06BBd4D379f3140ab268f13F9761, to: 0xb21b0daB8be7b27e3DCF9a8C08d7D34928653C6d, amount: 109691500 [1.096e8])
    │   │   └─ ← [Return] true
    │   └─ ← [Stop]
    └─ ← [Return]


==========================

Chain 11155111

Estimated gas price: 2.265980476 gwei

Estimated total gas used for script: 2834381

Estimated amount required: 0.006422652007545356 ETH

==========================

##### sepolia
✅  [Success] Hash: 0x1bba5c349b7503aae7d395e0b08b2c29d148238bc85954f08a208c38dd2cdd81
Contract: SplitterFactory
Function: createSplitter(address[],uint256[])
Block: 11667608
Paid: 0.000250804890249422 ETH (240029 gas * 1.044894118 gwei)


##### sepolia
✅  [Success] Hash: 0x16ed0ccbe5eb07524fb002dedfc42d1c395aee15488ac5786d029a7a96f5517c
Contract: SplitterFactory
Function: createSplitter(address[],uint256[])
Block: 11667609
Paid: 0.00034410430416999 ETH (339703 gas * 1.01295633 gwei)


##### sepolia
✅  [Success] Hash: 0xbbc286231e46355ed4c74b30f861deaaade3300f427bbfee547430ec34744303
Function: mint(address,uint256)
Block: 11667610
Paid: 0.00006788559375336 ETH (68973 gas * 0.98423432 gwei)


##### sepolia
✅  [Success] Hash: 0xcb3e13d27a43c5732405d00b5281ac47037f9d12b39466869c98121c1c2e3338
Function: mint(address,uint256)
Block: 11667611
Paid: 0.000076308074169975 ETH (68925 gas * 1.107117507 gwei)


##### sepolia
✅  [Success] Hash: 0xc3f9eee1574b82ade84b532593f5f4085391a3e385a8325742d1d48382a8d295
Function: transfer(address,uint256)
Block: 11667612
Paid: 0.000057551128263487 ETH (52177 gas * 1.102998031 gwei)


##### sepolia
✅  [Success] Hash: 0x5d46abbeaa3e530fe90fb1b10c51347c5e603316e102969efe3cb3843bf82244
Function: transfer(address,uint256)
Block: 11667613
Paid: 0.000040172126334357 ETH (35089 gas * 1.144863813 gwei)


##### sepolia
✅  [Success] Hash: 0xca025cd0c0639aa64ad5e1343429d3cd234d442557dcec26c29add6ec67df0e8
Function: transfer(address,uint256)
Block: 11667614
Paid: 0.000058057875377324 ETH (52141 gas * 1.113478364 gwei)


##### sepolia
✅  [Success] Hash: 0x6d9afb73d660b73c031ab5d6fca4d3f9d28f64d888b06586d0f602c03ebcda25
Function: transfer(address,uint256)
Block: 11667615
Paid: 0.00005449092318616 ETH (52189 gas * 1.04410744 gwei)


##### sepolia
✅  [Success] Hash: 0xcc0cac2e56b1fe4273a222b22d73a9bb0bb75acfb84dad7e548d86727f06d5b8
Function: transfer(address,uint256)
Block: 11667616
Paid: 0.000052696996782258 ETH (52153 gas * 1.010430786 gwei)


##### sepolia
✅  [Success] Hash: 0x07c0ae62bbec82786880bc0bae0983e62e4ee10a4e8a8914208c6ec91de32cdf
Function: claim(address)
Block: 11667618
Paid: 0.000222629697433975 ETH (203965 gas * 1.091509315 gwei)


##### sepolia
✅  [Success] Hash: 0xc90ea7403f8f2dac6880ac35c112b5a41c59e35567484442ff289e2ee32b728a
Function: claimMany(address[])
Block: 11667619
Paid: 0.000287521157192301 ETH (260231 gas * 1.104868971 gwei)


##### sepolia
✅  [Success] Hash: 0x9fc6d27de54d3414ff5ca0393250a696c6c3f970820a5afe000b68bc39b8b41e
Function: transfer(address,uint256)
Block: 11667620
Paid: 0.000036530524824262 ETH (35089 gas * 1.041081958 gwei)


##### sepolia
✅  [Success] Hash: 0x0c2f9a789bc575a432bcc33a2553bd660e821db84f516e1d3aef755d7e49e080
Function: transfer(address,uint256)
Block: 11667621
Paid: 0.000035827526951746 ETH (35053 gas * 1.022095882 gwei)


##### sepolia
✅  [Success] Hash: 0x443a817e9e0cb3abf902ee56bf641f74d87c8534529b28df8af7ccb74b863d93
Function: transfer(address,uint256)
Block: 11667623
Paid: 0.000039395837243062 ETH (35053 gas * 1.123893454 gwei)


##### sepolia
✅  [Success] Hash: 0xef2fa9f453dcd1dbb320aeab6cd7d34728633624906093e670ab33cda607948f
Function: claim(address)
Block: 11667624
Paid: 0.00012580049331399 ETH (115665 gas * 1.087628006 gwei)


##### sepolia
✅  [Success] Hash: 0x0350bbbd73ac99671e16a5c92d6925b2a4f5abf0ddcfdc24b04606f41279337e
Function: claimMany(address[])
Block: 11667625
Paid: 0.000199150310324784 ETH (191828 gas * 1.038171228 gwei)


##### sepolia
✅  [Success] Hash: 0x3284e694908a9263168f794f1930d19eea7b671aa0ecc2a37d9cd6e1a3a2eba1
Function: transfer(address,uint256)
Block: 11667627
Paid: 0.000038541494853568 ETH (35089 gas * 1.098392512 gwei)


##### sepolia
✅  [Success] Hash: 0x79f3329eca75927e622ead0e3a68d52b3c72537225c67dd2aa024cae5e3390b5
Function: transfer(address,uint256)
Block: 11667628
Paid: 0.000038364014524503 ETH (35041 gas * 1.094832183 gwei)


##### sepolia
✅  [Success] Hash: 0xe0619e9ebb090c58d85e18255eff61ee8c552e1d34f0e62c61a9a963493314a2
Function: claim(address)
Block: 11667629
Paid: 0.00012335016799578 ETH (115665 gas * 1.066443332 gwei)

✅ Sequence #1 on sepolia | Total Paid: 0.002149183136944304 ETH (2024058 gas * avg 1.070210397 gwei)


==========================

ONCHAIN EXECUTION COMPLETE & SUCCESSFUL.
```
