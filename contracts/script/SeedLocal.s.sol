//SPDX-License-Identifier:MIT
pragma solidity ^0.8.35;

import {Script, console} from "forge-std/Script.sol";

import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

import {DeploySplitterFactory} from "./DeploySplitterFactory.s.sol";
import {HelperConfig} from "./HelperConfig.s.sol";

import {SplitterFactory} from "../src/SplitterFactory.sol";
import {Splitter} from "../src/Splitter.sol";

contract SeedLocal is Script {
    // we are using anvil key, for dev only
    address payer = 0x70997970C51812dc3A010C7d01b50e0d17dc79C8; //anvil addr 1
    uint256 constant PAYER_PK = 0x59c6995e998f97a5a0044966f0945389dc9e86dae88c7a8412f4603b6b78690d; //anvil pk account 1
    address member1 = 0xa0Ee7A142d267C1f36714E4a8F75612F20a79720; //anvil addr 9
    address member2 = 0x23618e81E3f5cdF7f54C3d65f7FBc0aBf5B21E8f; //anvil addr 8
    uint256 constant MEMBER2_PK = 0xdbda1821b80551c9d65939329250298aa3472ba22feea921c0cf5d620ea67b97; //anvil pk account 8
    address member3 = 0x14dC79964da2C08b23698B3D3cc7Ca32193d9955; //anvil addr 7
    address member4 = 0x976EA74026E726554dB657fA54763abd0C3a0aa9; //anvil addr 6
    uint256 constant MEMBER4_PK = 0x92db14e403b83dfe3df233f83dfa3a0d7096f21ca9b0d6d6b8d88b2b4ec1564e; //anvil pk account 6
    address member5 = 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc; //anvil addr 5
    address[] s1_members;
    uint256[] s1_shareDistribution;
    address[] s2_members;
    uint256[] s2_shareDistribution;

    function run() public {
        //0. setting up the variables
        SplitterFactory factory;
        HelperConfig config;

        //splitter1
        s1_members.push(member1);
        s1_members.push(member2);
        s1_shareDistribution.push(6_000);
        s1_shareDistribution.push(4_000);

        //splitter2
        s2_members.push(member1);
        s2_members.push(member2);
        s2_members.push(member3);
        s2_members.push(member4);
        s2_members.push(member5);
        s2_shareDistribution.push(2_000);
        s2_shareDistribution.push(3_000);
        s2_shareDistribution.push(1_223);
        s2_shareDistribution.push(2_777);
        s2_shareDistribution.push(1_000);

        //1. Deploying the Splitter Factory Contract
        DeploySplitterFactory deployer = new DeploySplitterFactory();
        (factory, config) = deployer.run();
        //extracting token address
        (address token1, address token2) = config.activeNetworkConfig();
        address[] memory tokens = new address[](2);
        tokens[0] = token1;
        tokens[1] = token2;

        //2. Creating some sample splitters with diverse parameters
        // Splitter 1
        vm.startBroadcast();
        address splitter1 = _createDemoSplitter(factory, s1_members, s1_shareDistribution);
        vm.stopBroadcast();

        //payer get some fund and make a deposit
        vm.startBroadcast(PAYER_PK);
        _fundAccounts(config);
        _depositOnSplitter(splitter1, token1, 10 ether);
        vm.stopBroadcast();

        //Splitter 2
        vm.startBroadcast();
        address splitter2 = _createDemoSplitter(factory, s2_members, s2_shareDistribution);
        vm.stopBroadcast();

        //payer get some fund and make a deposit
        vm.startBroadcast(PAYER_PK);
        _depositOnSplitter(splitter2, token1, 100 ether);
        _depositOnSplitter(splitter2, token2, 1257 ether);
        vm.stopBroadcast();

        //some of the members call claim / claimMany
        vm.startBroadcast(MEMBER2_PK);
        Splitter(splitter2).claim(token1);
        vm.stopBroadcast();

        vm.startBroadcast(MEMBER4_PK);
        Splitter(splitter2).claimMany(tokens);
        vm.stopBroadcast();

        //3. Log everything
        _logSummary(factory, config, splitter1, splitter2, tokens);
    }

    function _createDemoSplitter(SplitterFactory factory, address[] memory members, uint256[] memory shareDistribution) internal returns(address splitter){
        splitter = factory.createSplitter(members, shareDistribution);
    }

    function _fundAccounts(HelperConfig config) internal {
        HelperConfig.NetworkConfig memory conf = config.getConfig();
        ERC20Mock(conf.token1).mint(payer, 10000 ether);
        ERC20Mock(conf.token2).mint(payer, 10000 ether);
    }

    function _depositOnSplitter(address splitter, address token, uint256 amount) internal {
        ERC20Mock(token).transfer(splitter, amount);
    }

    function _logSummary(
        SplitterFactory factory,
        HelperConfig config,
        address splitter1,
        address splitter2,
        address[] memory tokens
    ) internal view {
        HelperConfig.NetworkConfig memory conf = config.getConfig();

        console.log("============================================");
        console.log("--------------- About Factory --------------");
        console.log("Factory        :", address(factory));
        console.log("Implementation :", address(factory.implementation()));

        console.log("--------------- Mock Tokens  ---------------");
        console.log("Token 1 :", conf.token1);
        console.log("Token 2 :", conf.token2);

        _logSplitter("Splitter 1", splitter1, tokens);
        _logSplitter("Splitter 2", splitter2, tokens);

        console.log("============================================");
    }

    function _logSplitter(string memory label, address splitter, address[] memory tokens) internal view {
        console.log("---------------", label, "----------------");
        console.log("Address :", splitter);

        for (uint256 t = 0; t < tokens.length; t++) {
            console.log("  token", tokens[t]);
            console.log("    balance :", ERC20Mock(tokens[t]).balanceOf(splitter));
        }

        address[] memory members = Splitter(splitter).getMembers();
        for (uint256 i = 0; i < members.length; i++) {
            console.log("  member :", members[i]);
            console.log("    shares :", Splitter(splitter).getMemberShares(members[i]));
            for (uint256 t = 0; t < tokens.length; t++) {
                console.log("    pending :", Splitter(splitter).pending(tokens[t], members[i]));
            }
        }
    }
}
