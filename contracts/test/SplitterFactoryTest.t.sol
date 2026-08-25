//SPDX-License-Identifier:MIT
pragma solidity ^0.8.35;

import {Test} from "forge-std/Test.sol";
import {Splitter} from "../src/Splitter.sol";
import {SplitterFactory} from "../src/SplitterFactory.sol";

import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

contract SplitterFactoryTest is Test {
    SplitterFactory factory;
    ERC20Mock token;

    address user = makeAddr("user");
    address user2 = makeAddr("user2");
    address user3 = makeAddr("user3");
    address creator = makeAddr("creator");

    uint256 constant SHARES_USER = 6_000;
    uint256 constant SHARES_USER2 = 4_000;
    uint256 constant INITIAL_BALANCE = 100 ether;
    uint256 constant BASE_DEPOSIT = 10 ether;

    address[] members = [user, user2];
    uint256[] shareDistribution = [SHARES_USER, SHARES_USER2];

    event SplitterCreated(
        address indexed splitter, address indexed creator, address[] members, uint256[] shareDistribution
    );

    function setUp() public {
        factory = new SplitterFactory();

        token = new ERC20Mock();
        token.mint(user3, INITIAL_BALANCE);
    }

    // ---------------------------------------- creation ------------------------------------------
    function testCreateSplitterReturnsInitializedClone() public {
        vm.prank(creator);
        address splitter = factory.createSplitter(members, shareDistribution);

        assertTrue(splitter != address(0));

        //the clone must carry the members and shares passed to the factory
        address[] memory cloneMembers = Splitter(splitter).getMembers();
        assertEq(cloneMembers[0], user);
        assertEq(cloneMembers[1], user2);
        assertEq(Splitter(splitter).getMemberShares(user), SHARES_USER);
        assertEq(Splitter(splitter).getMemberShares(user2), SHARES_USER2);
    }

    //test if the event emission is correct
    function testCreateSplitterEmitsEvent() public {
        //the splitter address is not known before the call, so it is not checked here
        vm.expectEmit(false, true, false, true, address(factory));
        emit SplitterCreated(address(0), creator, members, shareDistribution);

        vm.prank(creator);
        factory.createSplitter(members, shareDistribution);
    }

    function testCreateSplitterTwiceGivesTwoDifferentAddresses() public {
        address splitterA = factory.createSplitter(members, shareDistribution);
        address splitterB = factory.createSplitter(members, shareDistribution);

        assertTrue(splitterA != splitterB);
    }

    // ------------------------------------------ registry ----------------------------------------------
    function testIsOfficialSplitterTrueForFactoryClone() public {
        address splitter = factory.createSplitter(members, shareDistribution);

        assertTrue(factory.isOfficialSplitter(splitter));
    }

    function testIsOfficialSplitterFalseForRandomAddress() public view {
        assertFalse(factory.isOfficialSplitter(user));
    }

    function testIsOfficialSplitterFalseForSelfMadeClone() public {
        //anyone can clone the implementation without going through the factory :
        //that clone works, but the factory must not know and validate it
        address roqueClone = Clones.clone(address(factory.implementation()));
        Splitter(roqueClone).initialize(members, shareDistribution);

        assertFalse(factory.isOfficialSplitter(roqueClone));
    }

    // ------------------------------------- isolation of storages ------------------------------------------
    function testClonesDoNotShareStorage() public {
        address splitterA = factory.createSplitter(members, shareDistribution);

        //second splitter with a different member set
        address[] memory otherMembers = new address[](1);
        otherMembers[0] = user3;
        uint256[] memory otherShares = new uint256[](1);
        otherShares[0] = 10_000;
        address splitterB = factory.createSplitter(otherMembers, otherShares);

        //deposit on A only
        vm.prank(user3);
        token.transfer(splitterA, BASE_DEPOSIT);

        //B must be untouched because of the storage separation between clones
        assertEq(Splitter(splitterB).pending(address(token), user3), 0);
        assertEq(Splitter(splitterB).getMemberShares(user), 0);
        assertEq(Splitter(splitterA).getMemberShares(user), SHARES_USER);
    }

    // ------------------------------------------- implementation ----------------------------------------------
    function testImplementationIsLocked() public {
        Splitter implementation = factory.implementation();

        //it should be impossible to initialize implementation again
        vm.expectRevert(Splitter.Splitter__AlreadyInitialized.selector);
        implementation.initialize(members, shareDistribution);
    }

    // ------------------------------------------- invalid params ----------------------------------------------
    function testCreateSplitterRevertsIfSharesDoNotSumToTotal() public {
        uint256[] memory wrongShares = new uint256[](2);
        wrongShares[0] = 6_000;
        wrongShares[1] = 5_000;

        vm.expectRevert(Splitter.Splitter__SharesAreNotCorrectlyDistributed.selector);
        factory.createSplitter(members, wrongShares);
    }

    function testCreateSplitterRevertsIfMemberAddedTwice() public {
        address[] memory sameMembers = new address[](2);
        sameMembers[0] = user;
        sameMembers[1] = user;

        vm.expectRevert(Splitter.Splitter__MemberAlreadyAdded.selector);
        factory.createSplitter(sameMembers, shareDistribution);
    }

    // ------------------------------------------- end to end ----------------------------------------------
    function testFullCycleThroughFactory() public {
        //splitter clone creation
        vm.prank(creator);
        address splitter = factory.createSplitter(members, shareDistribution);

        //deposit
        vm.prank(user3);
        token.transfer(splitter, BASE_DEPOSIT);

        //claim
        vm.prank(user);
        Splitter(splitter).claim(address(token));

        //assets
        assertEq(token.balanceOf(user), 6 ether);
        assertEq(token.balanceOf(splitter), 4 ether);
    }
}
