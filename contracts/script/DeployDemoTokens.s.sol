//SPDX-License-Identifier:MIT
pragma solidity ^0.8.35;

import {Script} from "forge-std/Script.sol";
import {DemoToken} from "../src/mocks/DemoToken.sol";

contract DeployDemoTokens is Script {
    function run() public {
        vm.startBroadcast();
        new DemoToken("Demo Euro", "dEUR", 18);
        new DemoToken("Demo Dollar", "dUSD", 6);
        vm.stopBroadcast();
    }
}
