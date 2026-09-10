# Transaction (send + claim) checks
### 1. CHECK AMOUNTS : 
```
# 1. Pending amount
cast call 0x5392A33F7F677f59e833FEBF4016cDDD88fF9E67 \
  "pending(address,address)(uint256)" \
  0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 \
  0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f \
  --rpc-url http://127.0.0.1:8545
```

```
2. Token2 balance amount
cast call 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 \
  "balanceOf(address)(uint256)" \
  0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f \
  --rpc-url http://127.0.0.1:8545
```

### 2. CALL CLAIM ON FRONT

### 3. CHECK AGAIN pending AND balance AMOUNTS


## Send token to the splitter
```
cast send 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 \
  "transfer(address,uint256)" \
  0x5392A33F7F677f59e833FEBF4016cDDD88fF9E67 \
  $(cast to-wei 10 ether) \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d \
  --rpc-url http://127.0.0.1:8545
```

# Token discovery checks
### Checking automatic token discovery

1. déployer ERC20Mock #3
2. mint des tokens à une adresse Anvil
3. transfer directement vers le splitter
4. Vérifier que le transfer à bien eu lieu (pending d'un member sur TOKEN#3)
5. Regarder si ton frontend le découvre automatiquement

---

1. déployer ERC20Mock #3

```
forge create lib/openzeppelin-contracts/contracts/mocks/token/ERC20Mock.sol:ERC20Mock \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d \
  --rpc-url http://127.0.0.1:8545 \
  --broadcast
```

2. mint des tokens à une adresse Anvil
```
cast send <<$TOKEN3>> \
  "mint(address,uint256)" \
  0x70997970C51812dc3A010C7d01b50e0d17dc79C8 \
  $(cast to-wei 1000 ether) \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d \
  --rpc-url http://127.0.0.1:8545
```

3. transfer directement vers le splitter (sans deposit, approve, ...)
```
cast send <<$TOKEN3>> \
  "transfer(address,uint256)" \
  0x5392A33F7F677f59e833FEBF4016cDDD88fF9E67 \
  $(cast to-wei 123 ether) \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d \
  --rpc-url http://127.0.0.1:8545
```

4. vérifier le pending
```
cast call 0x5392A33F7F677f59e833FEBF4016cDDD88fF9E67 \
  "pending(address,address)(uint256)" \
  <<$TOKEN3>> \
  0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f \
  --rpc-url http://127.0.0.1:8545
```

### Checking manual token add

To check manual token adding, we use the same pattern as automatic discovery but by adding the token from the front-end before sending some token to the splitter. It check the manual adding + the fact that it should not double the new token.


# Factory checks
### Creating a splitter
```
cast send <Factory_address> \
"createSplitter(address[], uint256[])" \
"[<ADDRESS1>, <ADDRESS2>]" \
"[<SHARE1>, <SHARE2>]" \
--rpc-url http://127.0.0.1:8545 \
--private-key <ANVILPK>
```

test with accout 0, 1, 2 :
```
cast send 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 \
"createSplitter(address[], uint256[])" \
"[0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, 0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC]" \
"[3000,3000,4000]" \
--rpc-url http://127.0.0.1:8545 \
--private-key 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80
```

test with account 8 as creator :
```
cast send 0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0 \
"createSplitter(address[], uint256[])" \
"[0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f, 0x70997970C51812dc3A010C7d01b50e0d17dc79C8, 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC]" \
"[3000,3000,4000]" \
--rpc-url http://127.0.0.1:8545 \
--private-key 0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97
```
