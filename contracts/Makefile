-include .env

.PHONY: deploy-example-anvil deploy-seed-anvil deploy-sepolia

LOCAL_RPC := http://localhost:8545
ANVIL_KEY := 0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80

deploy-anvil:
	forge script script/DeploySplitterFactory.s.sol \
	--rpc-url $(LOCAL_RPC) --private-key $(ANVIL_KEY) --broadcast

deploy-seed-anvil:
	forge script script/SeedLocal.s.sol \
	--rpc-url $(LOCAL_RPC) --private-key $(ANVIL_KEY) --broadcast -vv

deploy-sepolia:
	forge script script/DeploySplitterFactory.s.sol \
	--rpc-url $(SEPOLIA_RPC_URL) --account $(ACCOUNT) --broadcast \
	--verify --etherscan-api-key $(ETHERSCAN_API_KEY) -vvvv
