//SPDX-License-Identifier:MIT
pragma solidity ^0.8.35;

import {Test} from "forge-std/Test.sol";
import {Splitter} from "../src/Splitter.sol";

import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

// TODO Faire des tests avec un token ERC20 qui n'a pas 18 décimales

contract SplitterTest is Test {
    Splitter implementation;
    address splitterClone;
    ERC20Mock token;
    ERC20Mock token2;

    address user = makeAddr("user");
    address user2 = makeAddr("user2");
    address user3 = makeAddr("user3");

    //creating args for contract initialization
    uint256 constant SHARES_USER = 6_000;
    uint256 constant SHARES_USER2 = 4_000;
    uint256 constant TOTAL_SHARES = 10_000;
    uint256 constant INITIAL_BALANCE = 100 ether;
    uint256 constant BASE_DEPOSIT = 10 ether;
    address[] members = [user, user2];
    uint256[] shareDistribution = [SHARES_USER, SHARES_USER2];

    function setUp() public {
        //création de l'implémentation de base du contrat Splitter
        implementation = new Splitter();

        //création d'un clone
        splitterClone = Clones.clone(address(implementation));
        //initialisation
        Splitter(splitterClone).initialize(members, shareDistribution);

        //token contract creation + minting to user
        token = new ERC20Mock();
        token2 = new ERC20Mock();
        token.mint(user, INITIAL_BALANCE);
        token.mint(user2, INITIAL_BALANCE);
        token.mint(user3, INITIAL_BALANCE);
        token2.mint(user3, INITIAL_BALANCE);
    }

    // ------------------------------------------- initialization ----------------------------------------------

    function testSplitterCloneInitializationNominal() public view {
        //members
        address[] memory cloneMembers = Splitter(splitterClone).getMembers();
        //share distribution
        uint256 shareMember0 = Splitter(splitterClone).getMemberShares(user);
        uint256 shareMember1 = Splitter(splitterClone).getMemberShares(user2);

        //assert
        assertEq(user, cloneMembers[0]);
        assertEq(user2, cloneMembers[1]);
        assertEq(shareMember0, SHARES_USER);
        assertEq(shareMember1, SHARES_USER2);
    }

    function testInitializeRevertOnImplementationContract() public {
        vm.expectRevert(Splitter.Splitter__AlreadyInitialized.selector);
        Splitter(implementation).initialize(members, shareDistribution);
    }

    function testInitializeRevertIfCalledTwoTimes() public {
        vm.prank(user);
        vm.expectRevert(Splitter.Splitter__AlreadyInitialized.selector);
        Splitter(splitterClone).initialize(members, shareDistribution);
    }

    function testInitializeRevertIfEmptyArray() public {
        address newClone = _freshClone();
        address[] memory noMembers;
        uint256[] memory noSharesValues;

        vm.expectRevert(Splitter.Splitter__MemberArrayEmpty.selector);
        Splitter(newClone).initialize(noMembers, noSharesValues);
    }

    function testInitializeRevertIfTooManyMembers() public {
        address newClone = _freshClone();

        //creating a 51 table of members (MAX_MEMBERS = 50)
        uint256 n = 50 + 1;
        address[] memory lotOfmembers = new address[](n);
        uint256[] memory sharesMembers = new uint256[](n);
        for (uint256 i = 0; i < n; i++) {
            lotOfmembers[i] = address(uint160(i + 1));
            sharesMembers[i] = 1;
        }

        vm.expectRevert(Splitter.Splitter__TooManyMembers.selector);
        Splitter(newClone).initialize(lotOfmembers, sharesMembers);
    }

    function testInitializeRevertIfNbMembersDiffFromNbShareDistrib() public {
        address newClone = _freshClone();
        uint256[] memory sharesMembers = new uint256[](1);
        sharesMembers[0] = 6_000;

        vm.expectRevert(Splitter.Splitter__ArgsLengthMismatch.selector);
        Splitter(newClone).initialize(members, sharesMembers);
    }

    function testInitializeRevertIfMemberAsAddressZero() public {
        address newClone = _freshClone();
        address[] memory sameMembers = new address[](2);
        sameMembers[0] = user;
        sameMembers[1] = address(0);

        vm.expectRevert(Splitter.Splitter__MemberAddressIsZero.selector);
        Splitter(newClone).initialize(sameMembers, shareDistribution);
    }

    function testInitializeRevertIfMemberAdded2Times() public {
        address newClone = _freshClone();
        address[] memory sameMembers = new address[](2);
        sameMembers[0] = user;
        sameMembers[1] = user;

        vm.expectRevert(Splitter.Splitter__MemberAlreadyAdded.selector);
        Splitter(newClone).initialize(sameMembers, shareDistribution);
    }

    function testInitializeRevertIfMemberSharesValueIsZero() public {
        address newClone = _freshClone();
        uint256[] memory sharesMembers = new uint256[](2);
        sharesMembers[0] = 6_000;
        sharesMembers[1] = 0;

        vm.expectRevert(Splitter.Splitter__MemberWithShareValueIsZero.selector);
        Splitter(newClone).initialize(members, sharesMembers);
    }

    function testInitializeRevertIfTotalShareIsNotTenThousands() public {
        address newClone = _freshClone();
        uint256[] memory sharesMembers = new uint256[](2);
        sharesMembers[0] = 6_000;
        sharesMembers[1] = 5_000;

        vm.expectRevert(Splitter.Splitter__SharesAreNotCorrectlyDistributed.selector);
        Splitter(newClone).initialize(members, sharesMembers);
    }

    // ------------------------------------ nominal use cases -------------------------------------------
    // --- claim ---
    function testDeposit() public {
        // depot
        vm.prank(user3);
        token.transfer(address(splitterClone), BASE_DEPOSIT);

        //assert
        assertEq(BASE_DEPOSIT, token.balanceOf(address(splitterClone)));
    }

    function testSimpleClaim() public {
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

    function testClaimRevertsOnSecondClaimInARow() public {
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

    function testClaimRevertWhenAmountTruncateToZero() public {
        //super small deposit < TOTAL_SHARES (10_000)
        uint256 superSmallDeposit = 1;
        vm.prank(user3);
        token.transfer(splitterClone, superSmallDeposit);

        //claim
        vm.prank(user);
        vm.expectRevert(Splitter.Splitter__NothingToClaim.selector);
        Splitter(splitterClone).claim(address(token));
    }

    //--- claimMany ---
    function testClaimMany() public {
        //depot
        vm.startPrank(user3);
        token.transfer(address(splitterClone), BASE_DEPOSIT);
        token2.transfer(address(splitterClone), BASE_DEPOSIT);
        vm.stopPrank();

        address[] memory tokens = new address[](2);
        tokens[0] = address(token);
        tokens[1] = address(token2);

        //claim many
        vm.prank(user);
        Splitter(splitterClone).claimMany(tokens);

        //asserts
        assertEq(token.balanceOf(user), INITIAL_BALANCE + 6 ether);
        assertEq(token2.balanceOf(user), 6 ether); //no initial_balance for token2
        assertEq(Splitter(splitterClone).pending(address(token), user), 0);
    }

    function testClaimManyRevertsIfTokensArrayIsEmpty() public {
        address[] memory tokens;

        vm.expectRevert(Splitter.Splitter__InvalidArrayOfTokens.selector);
        Splitter(splitterClone).claimMany(tokens);
    }

    function testClaimManyRevertsIfToManyTokensInTokens() public {
        address[] memory tokens = new address[](21);
        for (uint256 i = 0; i < tokens.length; i++) {
            tokens[i] = makeAddr(vm.toString(i));
        }

        vm.expectRevert(Splitter.Splitter__InvalidArrayOfTokens.selector);
        Splitter(splitterClone).claimMany(tokens);
    }

    function testClaimManyRevertsIfNothingToclaimOnEveryTokens() public {
        address[] memory tokens = new address[](2);
        tokens[0] = address(token);
        tokens[1] = address(token2);

        //claim many
        vm.prank(user);
        vm.expectRevert(Splitter.Splitter__NothingToClaim.selector);
        Splitter(splitterClone).claimMany(tokens);
    }

    // --- pending ---
    function testPending() public {
        //deposit
        vm.prank(user3);
        token.transfer(address(splitterClone), BASE_DEPOSIT);

        // act
        uint256 amountToGet = Splitter(splitterClone).pending(address(token), user);

        //assert
        assertEq(amountToGet, 6 ether);
    }

    // --------------------------------------- fuzz -----------------------------------------------
    // --- conservation ---
    function testfuzz_sumOfClaimsNeverExceedsDeposit(uint96 amount) public {
        //lower bound = TOTAL_SHARES because it reverse if the truncate give 0 for really low amount
        uint256 amountToDeposit = bound(amount, TOTAL_SHARES, type(uint96).max);

        //deposit random amount
        token.mint(user3, amountToDeposit);
        vm.prank(user3);
        token.transfer(splitterClone, amountToDeposit);

        //claim
        vm.prank(user);
        Splitter(splitterClone).claim(address(token));
        vm.prank(user2);
        Splitter(splitterClone).claim(address(token));

        //assert
        uint256 sum = token.balanceOf(user) + token.balanceOf(user2) - (2 * INITIAL_BALANCE);
        assertApproxEqAbs(sum, amountToDeposit, 1);
    }

    // --- coherence ---
    function testfuzz_pendingMatchesClaimedAmount(uint96 amount) public {
        uint256 amountToDeposit = bound(amount, TOTAL_SHARES, type(uint96).max);

        //deposit random amount
        token.mint(user3, amountToDeposit);
        vm.prank(user3);
        token.transfer(splitterClone, amountToDeposit);

        //get pending
        uint256 expectedAmountToClaim = Splitter(splitterClone).pending(address(token), user);
        //claim
        vm.prank(user);
        Splitter(splitterClone).claim(address(token));

        //assert
        assertEq(expectedAmountToClaim, token.balanceOf(user) - INITIAL_BALANCE);
    }

    // --- proportionality ---
    function testfuzz_claimIsProportionalToShares(uint96 amount) public {
        uint256 amountToDeposit = bound(amount, TOTAL_SHARES, type(uint96).max);
        //deposit
        token.mint(user3, amountToDeposit);
        vm.prank(user3);
        token.transfer(splitterClone, amountToDeposit);

        //claim
        vm.prank(user);
        Splitter(splitterClone).claim(address(token));
        vm.prank(user2);
        Splitter(splitterClone).claim(address(token));

        uint256 receivedByUser = token.balanceOf(user) - INITIAL_BALANCE;
        uint256 receivedByUser2 = token.balanceOf(user2) - INITIAL_BALANCE;

        // cross-multiplication : receivedByUser / receivedByUser2 == SHARES_USER / SHARES_USER2
        // so receivedByUser * SHARES_USER2 should equal receivedByUser2 * SHARES_USER
        assertApproxEqAbs(receivedByUser * SHARES_USER2, receivedByUser2 * SHARES_USER, SHARES_USER);
    }

    // --- deposit independance ---
    function testfuzz_multipleDepositsAccumulate(uint96 amountA, uint96 amountB) public {
        uint256 depositA = bound(amountA, TOTAL_SHARES, type(uint96).max);
        uint256 depositB = bound(amountB, TOTAL_SHARES, type(uint96).max);

        // reference splitter : one single deposit of depositA + depositB
        address referenceClone = _freshClone();
        Splitter(referenceClone).initialize(members, shareDistribution);

        token.mint(user3, (depositA + depositB) * 2);

        // splitterClone : two successive deposits, no claim in between
        vm.startPrank(user3);
        token.transfer(splitterClone, depositA);
        token.transfer(splitterClone, depositB);
        token.transfer(referenceClone, depositA + depositB);
        vm.stopPrank();

        uint256 balanceBefore = token.balanceOf(user);
        vm.prank(user);
        Splitter(splitterClone).claim(address(token));
        uint256 fromTwoDeposits = token.balanceOf(user) - balanceBefore;

        balanceBefore = token.balanceOf(user);
        vm.prank(user);
        Splitter(referenceClone).claim(address(token));
        uint256 fromOneDeposit = token.balanceOf(user) - balanceBefore;

        // two deposits then one claim must pay the same as one deposit of the sum
        assertEq(fromTwoDeposits, fromOneDeposit);
    }

    // ------------------------------------------- helpers ----------------------------------------------
    function _freshClone() internal returns (address) {
        return Clones.clone(address(implementation));
    }
}
