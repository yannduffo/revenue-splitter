//SPDX-License-Identifier: MIT
pragma solidity ^0.8.35;

import {Script, console} from "forge-std/Script.sol";
import {SplitterFactory} from "../src/SplitterFactory.sol";
import {Splitter} from "../src/Splitter.sol";
import {DemoToken} from "../src/mocks/DemoToken.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

contract SeedSepolia is Script {
    SplitterFactory factory;
    DemoToken token1;
    DemoToken token2;

    uint256[4] pks;
    address[4] members;

    address splitterA;
    address splitterB;

    function run() public {
        _loadConfig();
        _deriveMembers();
        _createSplitters();
        _mintAndFirstDeposits();
        _firstClaims();
        _secondDeposits();
        _secondClaims();
        _thirdDeposits();
        _lastClaim();
        _log();
    }

    // ----------------- config

    function _loadConfig() internal {
        HelperConfig helperConfig = new HelperConfig();
        HelperConfig.NetworkConfig memory conf = helperConfig.getConfig();

        token1 = DemoToken(conf.token1);
        token2 = DemoToken(conf.token2);
        factory = SplitterFactory(vm.envAddress("SEPOLIA_FACTORY_ADDRESS"));
    }

    function _deriveMembers() internal {
        string memory mnemonic = vm.envString("SEPOLIA_DEMO_MNEMONIC");

        for (uint256 i = 0; i < 4; i++) {
            pks[i] = vm.deriveKey(mnemonic, uint32(i));
            members[i] = vm.addr(pks[i]);
            console.log("member", i, members[i]);
        }
    }

    // ------------------ creation

    function _createSplitters() internal {
        address[] memory membersA = new address[](2);
        membersA[0] = members[0];
        membersA[1] = members[1];

        uint256[] memory sharesA = new uint256[](2);
        sharesA[0] = 6_000;
        sharesA[1] = 4_000;

        address[] memory membersB = new address[](4);
        uint256[] memory sharesB = new uint256[](4);

        membersB[0] = members[0];
        membersB[1] = members[1];
        membersB[2] = members[2];
        membersB[3] = members[3];

        sharesB[0] = 3_500;
        sharesB[1] = 2_777;
        sharesB[2] = 2_500;
        sharesB[3] = 1_223;

        vm.startBroadcast();
        splitterA = factory.createSplitter(membersA, sharesA);
        splitterB = factory.createSplitter(membersB, sharesB);
        vm.stopBroadcast();
    }

    // ---------------- deposits

    function _mintAndFirstDeposits() internal {
        uint256 d1 = 10 ** token1.decimals();
        uint256 d2 = 10 ** token2.decimals();

        vm.startBroadcast();

        token1.mint(msg.sender, 5_000 * d1);
        token2.mint(msg.sender, 5_000 * d2);

        // Splitter A : trois dépôts, jamais réclamés ensuite
        token1.transfer(splitterA, 10 * d1);
        token1.transfer(splitterA, 25 * d1);
        token2.transfer(splitterA, 40 * d2);

        // Splitter B : première vague
        token1.transfer(splitterB, 100 * d1);
        token2.transfer(splitterB, 250 * d2);

        vm.stopBroadcast();
    }

    function _secondDeposits() internal {
        uint256 d1 = 10 ** token1.decimals();
        uint256 d2 = 10 ** token2.decimals();

        vm.startBroadcast();
        token1.transfer(splitterB, 60 * d1);
        token2.transfer(splitterB, 90 * d2);
        token2.transfer(splitterB, 35 * d2);
        vm.stopBroadcast();
    }

    function _thirdDeposits() internal {
        uint256 d1 = 10 ** token1.decimals();
        uint256 d2 = 10 ** token2.decimals();

        vm.startBroadcast();
        token1.transfer(splitterB, 45 * d1);
        token2.transfer(splitterB, 20 * d2);
        vm.stopBroadcast();
    }

    // ------------------- claims

    function _firstClaims() internal {
        vm.startBroadcast(pks[1]);
        Splitter(splitterB).claim(address(token1));
        vm.stopBroadcast();

        vm.startBroadcast(pks[3]);
        Splitter(splitterB).claimMany(_bothTokens());
        vm.stopBroadcast();
    }

    function _secondClaims() internal {
        // membre 0 : claim partiel, token2 seulement
        vm.startBroadcast(pks[0]);
        Splitter(splitterB).claim(address(token2));
        vm.stopBroadcast();

        // membre 2 : rattrape tout
        vm.startBroadcast(pks[2]);
        Splitter(splitterB).claimMany(_bothTokens());
        vm.stopBroadcast();
    }

    function _lastClaim() internal {
        vm.startBroadcast(pks[1]);
        Splitter(splitterB).claim(address(token2));
        vm.stopBroadcast();
    }

    // ----------------- utils

    function _bothTokens() internal view returns (address[] memory tokens) {
        tokens = new address[](2);
        tokens[0] = address(token1);
        tokens[1] = address(token2);
    }

    function _log() internal view {
        console.log("SPLITTER_A", splitterA);
        console.log("SPLITTER_B", splitterB);
        console.log("TOKEN_1", address(token1));
        console.log("TOKEN_2", address(token2));
        console.log("FACTORY", address(factory));
    }
}
