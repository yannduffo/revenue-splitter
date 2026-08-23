//SPDX-License-Identifier:MIT
pragma solidity ^0.8.35;

import {Test} from "forge-std/Test.sol";
import {Splitter} from "../src/Splitter.sol";

import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

// TODO Faire des tests avec un token qui n'a pas 18 décimales

contract SplitterTest is Test {
    Splitter implementation;
    address splitterClone;
    ERC20Mock token;

    address user = makeAddr("user");
    address user2 = makeAddr("user2");
    address user3 = makeAddr("user3");

    //creating args for contract initialization
    uint16 constant SHARES_USER = 6_000;
    uint16 constant SHARES_USER2 = 4_000;
    uint16 constant TOTAL_SHARES = 10_000;
    uint256 constant INITIAL_BALANCE = 100 ether;
    uint256 constant BASE_DEPOSIT = 10 ether;
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
        token.mint(user, INITIAL_BALANCE);
        token.mint(user2, INITIAL_BALANCE);
        token.mint(user3, INITIAL_BALANCE);
    }

    // ------------------------------------------- initialization ----------------------------------------------

    function testSplitterCloneInitializationNominal() public view {
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

    function testInitializeRevertOnImplementationContract() public {
        vm.expectRevert(Splitter.Splitter__AlreadyInitialized.selector);
        Splitter(implementation).initialize(members, shareDistribution, address(user));
    }

    function testInitializeRevertIfCalledTwoTimes() public {
        vm.prank(user);
        vm.expectRevert(Splitter.Splitter__AlreadyInitialized.selector);
        Splitter(splitterClone).initialize(members, shareDistribution, address(user));
    }

    // TODO : qu'est ce qu'il se passe avec un tableau de member vide ? ou même un des autres argument vide en soit ?
    // function testInitializeRevertIfNoMembers() public {
    //     address newClone = _freshClone();
    //     address[] memory noMembers;

    //     vm.expectRevert();
    //     Splitter(newClone).initialize(noMembers,shareDistribution, address(user));
    // }

    function testInitializeRevertIfTooManyMembers() public {
        address newClone = _freshClone();

        //creating a 51 table of members (MAX_MEMBERS = 50)
        uint256 n = 50 + 1;
        address[] memory lotOfmembers = new address[](n);
        uint16[] memory sharesMembers = new uint16[](n);
        for (uint256 i = 0; i < n; i++) {
            lotOfmembers[i] = address(uint160(i + 1));
            sharesMembers[i] = 1;
        }

        vm.expectRevert(Splitter.Splitter__TooManyMembers.selector);
        Splitter(newClone).initialize(lotOfmembers,sharesMembers, address(user));
    }

    function testInitializeRevertIfNbMembersDiffFromNbShareDistrib() public {
        address newClone = _freshClone();
        uint16[] memory sharesMembers = new uint16[](1);
        sharesMembers[0] = 6_000;

        vm.expectRevert(Splitter.Splitter__InitilizeArgsAreNotCoherent.selector);
        Splitter(newClone).initialize(members,sharesMembers, address(user));
    }

    function testInitializeRevertIfMemberAsAddressZero() public {
        address newClone = _freshClone();
        address[] memory sameMembers = new address[](2);
        sameMembers[0] = user;
        sameMembers[1] = address(0);

        vm.expectRevert(Splitter.Splitter__MemberAddressIsZero.selector);
        Splitter(newClone).initialize(sameMembers,shareDistribution, address(user));
    }

    function testInitializeRevertIfMemberAdded2Times() public {
        address newClone = _freshClone();
        address[] memory sameMembers = new address[](2);
        sameMembers[0] = user;
        sameMembers[1] = user;

        vm.expectRevert(Splitter.Splitter__MemberAlreadyAdded.selector);
        Splitter(newClone).initialize(sameMembers,shareDistribution, address(user));
    }

    function testInitializeRevertIfMemberSharesValueIsZero() public {
        address newClone = _freshClone();
        uint16[] memory sharesMembers = new uint16[](2);
        sharesMembers[0] = 6_000;
        sharesMembers[1] = 0;

        vm.expectRevert(Splitter.Splitter__MemberWithShareValueIsZero.selector);
        Splitter(newClone).initialize(members,sharesMembers, address(user));
    }

    function testInitializeRevertIfTotalShareIsNotTenThousands() public {
        address newClone = _freshClone();
        uint16[] memory sharesMembers = new uint16[](2);
        sharesMembers[0] = 6_000;
        sharesMembers[1] = 5_000;

        vm.expectRevert(Splitter.Splitter__SharesAreNotCorrectlyDistributed.selector);
        Splitter(newClone).initialize(members,sharesMembers, address(user));
    }

    // ------------------------------------ nominal use cases -------------------------------------------
    function testDeposit() public {
        // depot
        vm.prank(user3);
        token.transfer(address(splitterClone), BASE_DEPOSIT);

        //assert
        assertEq(BASE_DEPOSIT, token.balanceOf(address(splitterClone)));
    }

    function testSimpleClaim() public{
        // depot
        vm.prank(user3);
        token.transfer(address(splitterClone), BASE_DEPOSIT);

        //claim from user
        vm.prank(user);
        Splitter(splitterClone).claim(address(token));

        // comparer montant envoyé puis reçu par rapport aux shares
        // assertEq(token.balanceOf(user), INITIAL_BALANCE + (BASE_DEPOSIT * uint256(shareDistribution[0]) / TOTAL_SHARES));
        // -> Le test doit être "plus bête" pour ne pas utiliser la même méthode de calcul que dans le contract
        // sinon on pourrait se tromper 2 fois de la même manière
        assertEq(token.balanceOf(user), INITIAL_BALANCE + 6 ether);
        // vérfier la balance du contrat
        assertEq(token.balanceOf(splitterClone), 4 ether); //10 - 6
        // vérifier le pending de user est 0 après le claim
        assertEq(Splitter(splitterClone).pending(address(token), address(user)), 0);
    }

    function testClaimWithNonDivisibleAmountAsDeposit() public {
        // depot
        vm.prank(user3);
        token.transfer(address(splitterClone), 7 wei);

        //claim from user
        vm.prank(user);
        Splitter(splitterClone).claim(address(token));

        // assert
        assertEq(token.balanceOf(user), INITIAL_BALANCE + 4); //7*0,6 = 4,2 arrondi à 4 par solidity
        assertEq(token.balanceOf(splitterClone), 3);
        assertEq(Splitter(splitterClone).pending(address(token), address(user)), 0);
    }

    function testClaimRevertOnReentry() public {
        // depot
        vm.prank(user3);
        token.transfer(address(splitterClone), BASE_DEPOSIT);

        //claim from user
        vm.prank(user);
        Splitter(splitterClone).claim(address(token));
        //second claim in a row, expected to revert
        vm.prank(user);
        vm.expectRevert(Splitter.Splitter__NothingToClaim.selector);
        Splitter(splitterClone).claim(address(token));
    }

    function testClaimAfterAnother() public {
        // depot
        vm.prank(user3);
        token.transfer(address(splitterClone), BASE_DEPOSIT);

        //claim from user
        vm.prank(user);
        Splitter(splitterClone).claim(address(token));

        //claim from another user
        vm.prank(user2);
        Splitter(splitterClone).claim(address(token));

        //assert
        assertEq(token.balanceOf(user2), INITIAL_BALANCE + 4 ether);
        // vérfier la balance du contrat
        assertEq(token.balanceOf(splitterClone), 0);
    }

    function testClaimAfterAnotherWithMoneyEarnedInBetween() public {
        // depot
        vm.prank(user3);
        token.transfer(address(splitterClone), BASE_DEPOSIT);

        //claim from user
        vm.prank(user);
        Splitter(splitterClone).claim(address(token));

        // second deposit
        vm.prank(user3);
        token.transfer(address(splitterClone), BASE_DEPOSIT);

        //second claim from another user
        vm.prank(user2);
        Splitter(splitterClone).claim(address(token));

        //assert
        assertEq(token.balanceOf(user), INITIAL_BALANCE + 6 ether);
        assertEq(token.balanceOf(user2), INITIAL_BALANCE + 8 ether);
    }


    // --------------------------------------- invariants -----------------------------------------------



    // ------------------------------------------- helpers ----------------------------------------------
    function _freshClone() internal returns(address){
        return Clones.clone(address(implementation));
    }

}
