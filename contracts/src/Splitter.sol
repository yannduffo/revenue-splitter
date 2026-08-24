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

    uint256 constant private TOTAL_SHARES = 10_000;
    uint256 constant private PRECISION = 1e18;
    uint256 constant private MAX_MEMBERS = 50;
    uint256 constant MAX_CLAIM_BATCH = 20; //max tokens per claimMany call

    mapping(address member => uint256) private shares; //basis points, sum = TOTAL_SHARES, never modified after creation
    address[] private memberList; //for enumeration, off-chain only

    mapping(address token => uint256) private accPerShare;
    mapping(address token => uint256) private lastKnowBalance;
    mapping(address token => mapping(address member => uint256)) private lastAccPerShare;

    bool private isInitialized = false; //used for clone initialization

    //bookkeeping
    mapping(address tokenAddress => uint256 amount) private totalAttributed;
    mapping(address tokenAddress => uint256 amount) private totalClaimed;

    //pour que personne ne puisse appelé initialize pour l'implémentation (EIP1167)
    constructor() {
        isInitialized = true;
    }

    //XXX: Comment le front-end connait les tokens existant dans le splitter ? Pour pouvoir appeler pending et afficher les amount to claim ?

    //TODO: ajouter la gestion du cas "members_ vide et sharesValues_ vide" pour que ça renvoie pour l'erreur Splitter__SharesAreNotCorrectlyDistributed mais une erreur désignée" */
    function initialize(address[] calldata members_, uint256[] calldata sharesValues_) external {
        uint256 totalSharesCount;

        //checking if not already initialized
        if(isInitialized == true) revert Splitter__AlreadyInitialized();

        //checking args values
        if(members_.length != sharesValues_.length) revert Splitter__InitilizeArgsAreNotCoherent();
        if(members_.length > MAX_MEMBERS) revert Splitter__TooManyMembers();

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

        //mark contract as initialized
        isInitialized = true;
        //TODO : émettre l'événement Initialized()
    }

    /**
    * Get the contrat balance for a designated token
    * @param token Address of the token balance to know
    */
    function _balanceOf(address token) internal view returns(uint256){
        return IERC20(token).balanceOf(address(this));
    }

    // TODO : ajouter la gestion des tokens appelés pour la 1ère fois
    // TODO : comprendre pourquoi la dust est "implicitement" gérée -> c'est la différence entre amountToAdd et le delta (si delta n'est pas divisible par 10_000)
    // TODO : émettre l'event
    /**
    * Check if a sync is needed, and, if needed, updates accPerShare, lastKnowBalance and totalAttributed for the designated token
    * @param token Targeted token to sync
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
    }

    //TODO: ajouter l'emmision de l'event Claimed
    function claim(address token) external nonReentrant {
        //updating contract states:
        _sync(token);

        //calculating amountToPay
        uint256 accPerShareDelta = accPerShare[token] - lastAccPerShare[token][msg.sender];
        uint256 amountToPay = accPerShareDelta * shares[msg.sender] / PRECISION;

        //if amountToPay = 0 -> revert
        if(amountToPay == 0) revert Splitter__NothingToClaim();

        //updating contract states
        lastKnowBalance[token] -= amountToPay;
        totalClaimed[token] += amountToPay;
        lastAccPerShare[token][msg.sender] = accPerShare[token]; //msg.sender cursor actualized

        //transfer
        IERC20(token).safeTransfer(msg.sender, amountToPay);
    }

    /**
    * Calculate and return the amount a member can prentend to claim for a designated token
    * @param token Address of the targeted token
    * @param member Member targeted to know the available token amount to claim
    * @return availableAmountToClaim The hypothetical amount a member can claim for the designated token
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
