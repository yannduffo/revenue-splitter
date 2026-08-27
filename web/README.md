# Revenue Splitter Front-end


## dev notes

- We are not using `rainbowKit` beacaus it would have asked us to downgrade to `wagmi v2.x` which was using a lot of deprecated dependency. Instead, we coded the `ConnectButton` component ourself.


## How to run 

1. start anvil chain
2. copy factory contrat address in `.env.local` 
3. use the webapp

NOTE : if the contract changes, regenerate ABI file calling `npm run wagmi` script
