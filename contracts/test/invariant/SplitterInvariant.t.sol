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
    address[] tokens;

    //invariants states varaibles
    mapping(address token => uint256) lastAccPerShare;
    mapping(address token => uint256) lastTotalAttributed;
    mapping(address token => uint256) lastTotalClaimed;
    mapping(address token => mapping(address member => uint256)) lastPending;

    function setUp() public {
        factory = new SplitterFactory();
        splitter = SplitterFactory(factory).createSplitter(members, shareDistribution);

        token1 = new ERC20Mock();
        token2 = new ERC20Mock();

        tokens.push(address(token1));
        tokens.push(address(token2));

        handler = new Handler(Splitter(splitter), tokens, members);

        //we have to use tragetSelector because we have an helper in the Handler contract
        bytes4[] memory selectors = new bytes4[](3);
        selectors[0] = Handler.deposit.selector;
        selectors[1] = Handler.claim.selector;
        selectors[2] = Handler.claimMany.selector;

        targetSelector(FuzzSelector({addr: address(handler), selectors: selectors}));
        targetContract(address(handler));
    }

    //foundry hook executed one time after all invartiant test are executed
    function afterInvariant() public view {
        console.log("Number of claim() call that actually claim (pending != 0) : ", handler.ghost_claimCount(), " sur environ 166 appels");
        console.log("Number of claimMany() call that actually claim (pending on at least 1 token != 0) : ", handler.ghost_claimManyCount(), " sur environ 166 appels");
    }

    // corresponding to INV-1 from SPEC.md
    function invariant_sharesConservation() public view {
        address[] memory splitterMembers = Splitter(splitter).getMembers();
        uint256 sharesSum;

        for(uint256 i=0; i < splitterMembers.length; i++){
            sharesSum += Splitter(splitter).getMemberShares(splitterMembers[i]);
        }

        assertEq(sharesSum, TOTAL_SHARES);
    }

    // for INV-5
    // Should check that the internal accumulating counters never decrease
    function invariant_monotonicity() public {
        for(uint256 i=0; i < tokens.length; i++){
            address token = tokens[i];

            uint256 currentAccPerShare = Splitter(splitter).getAccPerShare(token);
            uint256 currentTotalAttributed = Splitter(splitter).getTotalAttributed(token);
            uint256 currentTotalClaimed = Splitter(splitter).getTotalClaimed(token);

            //none of these three counters should decrease
            assertGe(currentAccPerShare, lastAccPerShare[token]);
            assertGe(currentTotalAttributed, lastTotalAttributed[token]);
            assertGe(currentTotalClaimed, lastTotalClaimed[token]);

            //saving for next run :
            lastAccPerShare[token] = currentAccPerShare;
            lastTotalAttributed[token] = currentTotalAttributed;
            lastTotalClaimed[token] = currentTotalClaimed;
        }
    }

    // INV-2
    // Should check that the sum of pendings never exceed contract balance
    function invariant_solvability() public view {
        uint256 sumPendingForOneToken;

        for(uint256 i=0; i<tokens.length; i++){
            for(uint256 j=0; j<members.length; j++){
                sumPendingForOneToken += Splitter(splitter).pending(tokens[i], members[j]);
            }
            assertGe(ERC20Mock(tokens[i]).balanceOf(address(splitter)), sumPendingForOneToken);
            sumPendingForOneToken = 0;
        }
    }

    // INV-3
    // arithmetical verification :
    // totalDeposited should be equal to totalClaimed + pending + dust
    // as we don't keep the dust count, we are going to bound it to it's maximal value : (members.length * claimCount)
    function invariant_conservation() public view {
        for (uint256 i = 0; i < tokens.length; i++) {
            address token = tokens[i];

            uint256 deposited = handler.ghost_totalDeposited(token);
            uint256 claimed = handler.ghost_totalClaimed(token);

            uint256 pendingSum;
            for (uint256 j = 0; j < members.length; j++) {
                pendingSum += Splitter(splitter).pending(token, members[j]);
            }

            //without counting the dust, the sum should be Lower or equal
            assertLe(claimed + pendingSum, deposited);

            //with dust upper bound taking in account it should be Greater or equal
            uint256 dustUpperBound = members.length * (1 + handler.ghost_claimCount() + handler.ghost_claimManyCount()); //+1 to cover the recyclable part of the dust
            assertGe(claimed + pendingSum + dustUpperBound, deposited);
        }
    }

    // INV-6
    // Pending(token, member) should never decrease except if the member called claim() on last tour
    function invariant_noRetroactiveTheft() public {
        address claimer = handler.ghost_lastClaimer();

        for (uint256 i = 0; i < tokens.length; i++) {
            address token = tokens[i];

            for (uint256 j = 0; j < members.length; j++) {
                address member = members[j];
                uint256 current = Splitter(splitter).pending(token, member);

                //can go down if the one who claimed was the member
                bool mayHaveDropped = (member == claimer);

                if (!mayHaveDropped) {
                    assertGe(current, lastPending[token][member]);
                }

                lastPending[token][member] = current;
            }
        }
        handler.resetLastClaimer();
    }

    // INV-4
    // Already tested without invariant testing
}
