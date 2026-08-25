//SPDX-License-Identifier:MIT
pragma solidity ^0.8.35;

import {Script, console} from "forge-std/Script.sol";
import {DevOpsTools} from "@foundry-devops/src/DevOpsTools.sol";

import {SplitterFactory} from "../src/SplitterFactory.sol";

contract CreateSplitter is Script {
    function run() public {
        address member1 = 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720; //anvil addr 9
        address member2 = 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f; //anvil addr 8
        address[] memory members = new address[](2);
        members[0] = member1;
        members[1] = member2;

        uint256 sharesMember1 = 6_000;
        uint256 sharesMember2 = 4_000;
        uint256[] memory shareDistribution = new uint256[](2);
        shareDistribution[0] = sharesMember1;
        shareDistribution[1] = sharesMember2;

        address mostRecentFactory = DevOpsTools.get_most_recent_deployment("SplitterFactory", block.chainid);

        vm.startBroadcast();
        address clone = SplitterFactory(mostRecentFactory).createSplitter(members, shareDistribution);
        vm.stopBroadcast();

        console.log("Deployed clone address : ", clone);
    }
}
