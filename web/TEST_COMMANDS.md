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


# Send token to the splitter
```
cast send 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512 \
  "transfer(address,uint256)" \
  0x5392A33F7F677f59e833FEBF4016cDDD88fF9E67 \
  $(cast to-wei 100 ether) \
  --private-key 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d \
  --rpc-url http://127.0.0.1:8545
```
