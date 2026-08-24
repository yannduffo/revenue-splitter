//SPDX-License-Identifier:MIT
pragma solidity ^0.8.35;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";

contract Splitter is ReentrancyGuard{
    using SafeERC20 for IERC20;

    error Splitter__NothingToClaim();
    error Splitter__AlreadyInitialized();
    error Splitter__InitilizeArgsAreNotCoherent();
    error Splitter__TooManyMembers();
    error Splitter__SharesAreNotCorrectlyDistributed();
    error Splitter__MemberAddressIsZero();
    error Splitter__MemberWithShareValueIsZero();
    error Splitter__MemberAlreadyAdded();
    error Splitter__MemberArrayEmpty();
    error Splitter__InvalidArrayOfTokens();

    uint256 constant private TOTAL_SHARES = 10_000;
    uint256 constant private PRECISION = 1e18;
    uint256 constant private MAX_MEMBERS = 50;
    uint256 constant private MAX_CLAIM_BATCH = 20; //max tokens per claimMany call

    mapping(address member => uint256) private shares; //basis points, sum = TOTAL_SHARES, never modified after creation
    address[] private memberList; //for enumeration, off-chain only

    mapping(address token => uint256) private accPerShare;
    mapping(address token => uint256) private lastKnowBalance;
    mapping(address token => mapping(address member => uint256)) private lastAccPerShare;

    bool private isInitialized = false; //used for clone initialization

    //bookkeeping
    mapping(address tokenAddress => uint256 amount) private totalAttributed;
    mapping(address tokenAddress => uint256 amount) private totalClaimed;

    //event SplitterCreated(address splitter, address[] members, uint256[] sharesDistribution); -> Factory
    event SplitterInitialized(address[] members, uint256[] sharesDistribution);
    event Synced(address token, uint256 amount, uint256 newAccPerShare);
    event Claimed(address token, address member, uint256 amount); //nothing emitted if claim return 0; -> no transfer occured

    //pour que personne ne puisse appelé initialize pour l'implémentation (EIP1167)
    constructor() {
        isInitialized = true;
    }

    //FIX: Comment le front-end connait les tokens existant dans le splitter ? Pour pouvoir appeler pending et afficher les amount to claim ?

    /**
    * Function to initialize the clone (following EIP1167 standard)
    * @param members_ array of the members addresses
    * @param sharesValues_ array of the shares distribution between these members (sum(shares) should be equal to 10_000)
    */
    function initialize(address[] calldata members_, uint256[] calldata sharesValues_) external {
        uint256 totalSharesCount;

        //checking if not already initialized
        if(isInitialized == true) revert Splitter__AlreadyInitialized();

        //checking args values
        if(members_.length != sharesValues_.length) revert Splitter__InitilizeArgsAreNotCoherent();
        if(members_.length > MAX_MEMBERS) revert Splitter__TooManyMembers();
        if(members_.length == 0) revert Splitter__MemberArrayEmpty(); //-> implicitly verifying that sharesValues_ is not empty

        //checking members : no address(0), no double, no share = 0,
        for(uint256 i=0; i < members_.length; i++){
            if(members_[i] == address(0)) revert Splitter__MemberAddressIsZero();
            if(shares[members_[i]] != 0)  revert Splitter__MemberAlreadyAdded(); //using shares mapping so we don't need a double for loop
            if(sharesValues_[i] == 0) revert Splitter__MemberWithShareValueIsZero();

            //adding to local variables :
            memberList.push(members_[i]);
            shares[members_[i]] = sharesValues_[i];

            //to check total shares == 10_000
            totalSharesCount += sharesValues_[i];
        }

        //checking totalShares value :
        if(totalSharesCount != TOTAL_SHARES) revert Splitter__SharesAreNotCorrectlyDistributed();

        //mark contract as initialized & emit event
        isInitialized = true;
        emit SplitterInitialized(members_, sharesValues_);
    }

    /**
    * External function to claim tokens from the splitter. Calls internal _claim with msg.sender as member parameter
    * @param token targeted token
    * @dev revert if there is nothing to claim
    */
    function claim(address token) external nonReentrant {
        uint256 amountPaid = _claim(token, msg.sender);
        if(amountPaid == 0) revert Splitter__NothingToClaim();
    }

    /**
    * Function to claim multiple tokens from the splitter in one call
    * @param tokens array of targeted tokens
    * @dev revert if nothing has been transfered
    */
    function claimMany(address[] calldata tokens) external nonReentrant {
        uint256 sumClaimed;

        //checking input array
        if(tokens.length == 0) revert Splitter__InvalidArrayOfTokens();
        if(tokens.length > MAX_CLAIM_BATCH) revert Splitter__InvalidArrayOfTokens();

        //making the claims
        for(uint256 i=0; i < tokens.length; i++){
            sumClaimed += _claim(tokens[i], msg.sender);
        }

        //checking if something was transfered
        if(sumClaimed == 0) revert Splitter__NothingToClaim();
    }

    /**
    * Calculate and return the amount a member can prentend to claim for a designated token
    * @param token Address of the targeted token
    * @param member Member targeted to know the available token amount to claim
    * @return availableAmountToClaim The hypothetical amount a member can claim for the designated token
    * @dev the caller is supposed to call pending with a valid ERC20 address. If not, the function will revert
    */
    function pending(address token, address member) public view returns(uint256 availableAmountToClaim){
        //getting the current accPerShare
        uint256 currentAccPerShare = _currentAccPerShare(token);

        //check if the member has unclaimed token
        uint256 accPerShareDelta = currentAccPerShare - lastAccPerShare[token][member];
        if(accPerShareDelta == 0){
            return 0;
        }

        //delta > 0, the member has token to claim
        availableAmountToClaim = accPerShareDelta * shares[member] / PRECISION;
    }

    /**
    * Check if a sync is needed, and, if needed, updates accPerShare, lastKnowBalance and totalAttributed for the designated token
    * @param token Targeted token to sync
    * @dev dust is implicitly managed here : if the division is approximated by the low, the "unknown dust" stays on the contract
    * balance and will be discovered at the next sync
    */
    function _sync(address token) internal {
        //getting the current accPerShare
        uint256 currentAccPerShare = _currentAccPerShare(token);

        //check if there is a difference between currentAccPerShare and the last synced one (accPerShare)
        uint256 accPerShareDelta = currentAccPerShare - accPerShare[token];
        if(accPerShareDelta == 0){
            return; //nothing to sync
        }

        //if delta > 0, there are token to sync :
        // updating token balances :
        uint256 amountToAdd = accPerShareDelta * TOTAL_SHARES / PRECISION; //unit of tokens NON normalized by share
        lastKnowBalance[token] += amountToAdd;
        totalAttributed[token] += amountToAdd;
        // updating accPerShare
        accPerShare[token] = currentAccPerShare;

        //emiting event
        emit Synced(token, amountToAdd, currentAccPerShare);
    }

    /**
    * Function called by claim or claimMany to actualize balances and transfer earned found to the asking member
    * @param token targeted token
    * @param member targeted member
    * @return amountPaid amount of token transfered to the member
    * @dev nonreentrancy guard applied on public/external claim() function
    * @dev on this func, some dust stays stranded in the contract due to the truncation when calculating amountToPay. Deliberately not mitigated
    */
    function _claim(address token, address member) internal returns(uint256 amountPaid) {
        //updating contract states:
        _sync(token);

        //calculating amountToPay
        uint256 accPerShareDelta = accPerShare[token] - lastAccPerShare[token][member];
        uint256 amountToPay = accPerShareDelta * shares[member] / PRECISION;

        //if amountToPay = 0 -> return 0. No revert so we don't break the claimMany loop
        if(amountToPay == 0) return 0;

        //updating contract states
        lastKnowBalance[token] -= amountToPay;
        totalClaimed[token] += amountToPay;
        lastAccPerShare[token][member] = accPerShare[token]; //member cursor actualized

        //emiting event & transfer & returning amountPaid
        emit Claimed(token, member, amountToPay);
        IERC20(token).safeTransfer(member, amountToPay);
        return amountToPay;
    }

    /**
    * Get the contrat balance for a designated token
    * @param token Address of the token balance to know
    */
    function _balanceOf(address token) internal view returns(uint256){
        return IERC20(token).balanceOf(address(this));
    }

    /**
    * Calculate and return the actualized accPerShare for a designated token
    * @param token Address of the trageted token
    * @return actualized accPerShare for the designated token
    */
    function _currentAccPerShare(address token) internal view returns(uint256) {
        uint256 currentBalance = _balanceOf(token);
        if(currentBalance <= lastKnowBalance[token]) {
            return accPerShare[token]; //no token received, accPerShare doesn't need an update
        }
        // if there is a difference, we calculate the currentAccPerShare using the formula
        uint256 delta = currentBalance - lastKnowBalance[token];
        uint256 currentAccPerShare = accPerShare[token] + (delta * PRECISION / TOTAL_SHARES);
        return currentAccPerShare;
    }

    // -------------------------------------- getters -------------------------------------------
    function getMembers() external view returns(address[] memory){
        return memberList;
    }

    function getMemberShares(address member) external view returns(uint256){
        return shares[member];
    }
}
