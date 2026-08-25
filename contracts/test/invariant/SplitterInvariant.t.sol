//SPDX-License-Identifier:MIT
pragma solidity ^0.8.35;

import {Test, console} from "forge-std/Test.sol";
import {Handler} from "./Handler.t.sol";

import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

import {Splitter} from "../../src/Splitter.sol";
import {SplitterFactory} from "../../src/SplitterFactory.sol";

contract SplitterInvariantTest is Test {
    address user = makeAddr("user");
    address user2 = makeAddr("user2");
    address user3 = makeAddr("user3");
    address user4 = makeAddr("user4");
    address user5 = makeAddr("user5");
    //creating args for contract initialization
    uint256 constant SHARES_USER = 3_000;
    uint256 constant SHARES_USER2 = 2_000;
    uint256 constant SHARES_USER3 = 1_223;
    uint256 constant SHARES_USER4 = 2_777;
    uint256 constant SHARES_USER5 = 1_000;
    uint256 constant TOTAL_SHARES = 10_000;
    address[] members = [user, user2, user3, user4, user5];
    uint256[] shareDistribution = [SHARES_USER, SHARES_USER2,  SHARES_USER3,  SHARES_USER4,  SHARES_USER5];

    SplitterFactory factory;
    Handler handler;
    address splitter;
    ERC20Mock token1;
    ERC20Mock token2;

    function setUp() public {
        factory = new SplitterFactory();
        splitter = SplitterFactory(factory).createSplitter(members, shareDistribution);

        token1 = new ERC20Mock();
        token2 = new ERC20Mock();

        address[] memory tokens = new address[](2);
        tokens[0] = address(token1);
        tokens[1] = address(token2);

        handler = new Handler(Splitter(splitter), tokens, members);
        targetContract(address(handler));
    }

    //foundry hook executed one time after all invartiant test are executed
    function afterInvariant() public view {
        console.log("Number of claim() call that actually claim (pending != 0) : ", handler.ghost_claimCount(), " sur environ 166 appels");
        console.log("Number of claimMany() call that actually claim (pending on at least 1 token != 0) : ", handler.ghost_claimManyCount(), " sur environ 166 appels");
    }

    function invariant_sharesConservation() public view {
        address[] memory splitterMembers = Splitter(splitter).getMembers();
        uint256 sharesSum;

        for(uint256 i=0; i < splitterMembers.length; i++){
            sharesSum += Splitter(splitter).getMemberShares(splitterMembers[i]);
        }

        assertEq(sharesSum, TOTAL_SHARES);
    }
}
