//SPDX-License-Identifier:MIT
pragma solidity ^0.8.35;

import {Script, console} from "forge-std/Script.sol";
import {SplitterFactory} from "../src/SplitterFactory.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract DeploySplitterFactory is Script {
    function run() public returns(SplitterFactory, HelperConfig){
        SplitterFactory factory;
        HelperConfig helperConfig;

        helperConfig = new HelperConfig();

        vm.startBroadcast();
        factory = new SplitterFactory();
        vm.stopBroadcast();

        console.log("Factory address : ", address(factory));
        console.log("Implementation addresss", address(factory.implementation()));

        return(factory,helperConfig);
    }
}
