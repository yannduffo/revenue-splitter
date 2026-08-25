//SPDX-License-Identifier:MIT
pragma solidity ^0.8.35;

import {Script, console} from "forge-std/Script.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract HelperConfig is Script {
    struct NetworkConfig {
        address token1;
        address token2;
    }

    NetworkConfig public activeNetworkConfig;

    constructor() {
        if(block.chainid == 11155111){
            activeNetworkConfig = getSepoliaConfig();
        } else {
            //Anvil chainid = 31337
            activeNetworkConfig = getOrCreateAnvilConfig();
        }
    }

    function getSepoliaConfig() public pure returns(NetworkConfig memory){
        address token1 = address(0); //TODO
        address token2 = address(0); //TODO

        return NetworkConfig({
            token1: token1,
            token2: token2
        });
    }

    function getOrCreateAnvilConfig() public returns(NetworkConfig memory){
        //check if network is already configured :
        if(activeNetworkConfig.token1 != address(0)) return activeNetworkConfig;

        //if activeNetworkConfig is empty we create the configuration :
        vm.startBroadcast();
        ERC20Mock mockToken1 = new ERC20Mock();
        ERC20Mock mockToken2 = new ERC20Mock();
        vm.stopBroadcast();

        console.log("mockToken1 address : ", address(mockToken1));
        console.log("mockToken2 address : ", address(mockToken2));

        return NetworkConfig({
            token1 : address(mockToken1),
            token2: address(mockToken2)
        });
    }
}
