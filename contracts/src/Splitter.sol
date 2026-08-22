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
    uint256 constant private MAX_TOKENS = 16;

    bool private isInitialized = false;
    address[] private memberList;
    address private admin;

    mapping(address tokenAddress => uint256 balance) private lastKnowBalance;
    mapping(address tokenAddress => uint256 amountAccPerShare) private accPerShare;
    mapping(address tokenAddress => mapping(address member => uint256 lastAmountAccPerShare)) private lastAccPS;
    mapping(address tokenAddress => mapping(address member => uint256 credit)) private credit;
    mapping(address member => uint16 shares) private shares;

    mapping(address tokenAddress => uint256 amount) private totalReceived;
    mapping(address tokenAddress => uint256 amount) private totalClaimed;

    //pour que personne ne puisse appelé initialize pour l'implémentation (EIP1167)
    constructor() {
        isInitialized = true;
    }

    function initialize(address[] calldata members_, uint16[] calldata sharesValues_, address adminAddress_) external {
        uint256 totalShares;

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
            totalShares += uint256(sharesValues_[i]);
        }

        //checking totalShares value :
        if(totalShares != TOTAL_SHARES) revert Splitter__SharesAreNotCorrectlyDistributed();

        //set the admin :
        admin = adminAddress_;

        //mark contract as initialized
        isInitialized = true;
        //TODO : émettre l'événement
    }

    /**
    * Get the contrat balance for a designated token
    * @param tokenAddress Address of the token balance to know
    */
    //TODO: gérer le cas ETH
    function _balanceOf(address tokenAddress) internal view returns(uint256){
        return IERC20(tokenAddress).balanceOf(address(this));
    }

    // TODO : ajouter la gestion des tokens appelés pour la 1ère fois
    // TODO : comprendre pourquoi la dust est "implicitement" gérée -> c'est la différence entre amountToAdd et le delta (si delta n'est pas divisible par 10_000)
    // TODO : émettre l'event
    function _sync(address tokenAddress) internal {
        //compare accPerShare and syncedAccPerShare
        uint256 oldAccPerShare = accPerShare[tokenAddress];
        uint256 syncedAccPerShare = _accPerShareAfterSync(tokenAddress);

        //if there is no token which weren't synced :
        if(oldAccPerShare == syncedAccPerShare) {
            return;
        }

        //if there are token not synced yet :
        // calcul du montant en unité de token non normalisé par rapport aux shares
        uint256 amountToAdd = (syncedAccPerShare - oldAccPerShare) * TOTAL_SHARES / PRECISION;
        // actualisation des valeurs par les valeurs synced
        accPerShare[tokenAddress] = syncedAccPerShare;
        // update states
        lastKnowBalance[tokenAddress] += amountToAdd;
        totalReceived[tokenAddress] += amountToAdd;
    }

    function _settle(address tokenAddress, address member) internal {
        //répartition de l'argent en fonction des parts :
        uint256 deltaWithAccumulatorPS = accPerShare[tokenAddress] - lastAccPS[tokenAddress][member];
        uint256 amountToPay = deltaWithAccumulatorPS * shares[member] / PRECISION; //on revient en unité token

        //mise à jour des valeurs :
        credit[tokenAddress][member] += amountToPay;
        lastAccPS[tokenAddress][member] = accPerShare[tokenAddress]; //remonter le curseur pour ce membre
    }


    //TODO: ajouter l'emmision de l'event Claimed
    function claim(address tokenAddress) external nonReentrant {
        //mises à jour :
        _sync(tokenAddress);
        _settle(tokenAddress, msg.sender); //appeler par le membre qui veut claim

        //preparation transfer
        uint256 amount = credit[tokenAddress][msg.sender];
        if(amount == 0) revert Splitter__NothingToClaim();

        credit[tokenAddress][msg.sender] = 0;

        lastKnowBalance[tokenAddress] -= amount;
        totalClaimed[tokenAddress] += amount;

        //transfer
        IERC20(tokenAddress).safeTransfer(msg.sender, amount);
    }

    function pending(address tokenAddress, address member) public view returns(uint256){
        //doit retourner credit[tokenAddress][member] + amountToAddSinceLastSync
        // maj accPerShare :
        uint256 syncedAccPerShare = _accPerShareAfterSync(tokenAddress);
        // calculate amount that represent for our user
        uint256 amountToAddSinceLastSync = (syncedAccPerShare - lastAccPS[tokenAddress][member]) * shares[member] / PRECISION;
        // add credit + syncedAmount
        uint256 availableBalanceAfterSync = credit[tokenAddress][member] + amountToAddSinceLastSync;
        return availableBalanceAfterSync;
    }

    // si on synchronisait ce token maintenant, à combien serait le compteur
    // clarifier la gestion de la dust pour moi
    function _accPerShareAfterSync(address tokenAddress) internal view returns(uint256) {
        uint256 syncBalance = _balanceOf(tokenAddress);
        if(syncBalance <= lastKnowBalance[tokenAddress]) {
            return accPerShare[tokenAddress]; //rien n'a changé : aucun token n'a été reçu
        }
        //si il y a une différence : on calcul le delta et on ajoute au compteur
        uint256 delta = syncBalance - lastKnowBalance[tokenAddress];
        uint256 syncedAccPerShare = accPerShare[tokenAddress] + (delta * PRECISION / TOTAL_SHARES);
        return syncedAccPerShare;
    }

    // -------------------------------------- getters -------------------------------------------
    function getAdmin() external view returns(address){
        return admin;
    }

    function getMembers() external view returns(address[] memory){
        return memberList;
    }

    function getMemberShares(address member) external view returns(uint16){
        return shares[member];
    }

}
