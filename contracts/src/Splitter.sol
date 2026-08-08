//SPDX-License-Identifier:MIT
pragma solidity ^0.8.35;

import {ReentrancyGuard} from "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import {SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IERC20} from "@openzeppelin/contracts/interfaces/IERC20.sol";

contract Splitter is ReentrancyGuard{
    using SafeERC20 for IERC20;

    error Splitter__NothingToClaim();

    uint256 constant private TOTAL_SHARES = 10_000;
    uint256 constant private PRECISION = 1e18;

    bool private isInitialized = false;

    mapping(address tokenAddress => uint256 balance) private lastKnowBalance;
    mapping(address tokenAddress => uint256 amountAccPerShare) private accPerShare;
    mapping(address tokenAddress => mapping(address member => uint256 lastAmountAccPerShare)) private lastAccPS;
    mapping(address tokenAddress => mapping(address member => uint256 credit)) private credit;
    mapping(address member => uint256 shares) private shares;

    mapping(address tokenAddress => uint256 amount) private totalReceived;
    mapping(address tokenAddress => uint256 amount) private totalClaimed;

    // function initialize(address[] memory members, mapping(address => uint256) sharesValues, address adminAddress) public {


    //     isInitialized = true;
    // }

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

}
