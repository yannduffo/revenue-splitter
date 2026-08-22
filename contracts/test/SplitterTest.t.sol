//SPDX-License-Identifier:MIT
pragma solidity ^0.8.35;

import {Test} from "forge-std/Test.sol";
import {Splitter} from "../src/Splitter.sol";

import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

//TODO : Faire des tests avec un token qui n'a pas 18 décimales

contract SplitterTest is Test {
    Splitter implementation;
    address splitterClone;
    ERC20Mock token;

    address user = makeAddr("user");
    address user2 = makeAddr("user2");

    //creating args for contract initialization
    uint16 constant SHARES_USER = 6_000;
    uint16 constant SHARES_USER2 = 4_000;
    address[] members = [user, user2];
    uint16[] shareDistribution = [SHARES_USER, SHARES_USER2];

    function setUp() public {
        //création de l'implémentation de base du contrat Splitter
        implementation = new Splitter();

        //création d'un clone
        splitterClone = Clones.clone(address(implementation));
        //initialisation
        Splitter(splitterClone).initialize(members, shareDistribution, address(user));

        //token contract creation + minting to user
        token = new ERC20Mock();
        token.mint(user, 100 ether);
        token.mint(user2, 100 ether);
    }

    function testSplitterCloneInitialization() public view {
        //admin
        address cloneAdmin = Splitter(splitterClone).getAdmin();
        //members
        address[] memory cloneMembers = Splitter(splitterClone).getMembers();
        //share distribution
        uint16 shareMember0 = Splitter(splitterClone).getMemberShares(user);
        uint16 shareMember1 = Splitter(splitterClone).getMemberShares(user2);

        //assert
        assertEq(user, cloneMembers[0]);
        assertEq(user2, cloneMembers[1]);
        assertEq(cloneAdmin, user);
        assertEq(shareMember0, SHARES_USER);
        assertEq(shareMember1, SHARES_USER2);
    }

}
