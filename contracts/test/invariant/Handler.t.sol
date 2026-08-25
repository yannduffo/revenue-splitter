//SPDX-License-Identifier:MIT
pragma solidity ^0.8.35;

import {Test} from "forge-std/Test.sol";

import {Splitter} from "../../src/Splitter.sol";
import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract Handler is Test {
    address payer = makeAddr("payer");

    Splitter splitter;
    address[] members;
    address[] tokens;

    //ghost variables
    mapping(address token => uint256) public ghost_totalDeposited;
    mapping(address token => uint256) public ghost_totalClaimed;
    uint256 public ghost_claimCount;
    uint256 public ghost_claimManyCount;
    //INV-6 :
    address public ghost_lastClaimer;
    bool public ghost_lastClaimWasMany;

    constructor(Splitter splitter_, address[] memory tokens_, address[] memory members_){
        splitter = splitter_;
        tokens = tokens_;
        members = members_;
    }

    function deposit(uint256 tokenSeed, uint256 amount) public {
        amount = bound(amount, 1, 1e20);
        address selectedToken = tokens[tokenSeed % tokens.length];

        ghost_totalDeposited[selectedToken] += amount;

        ERC20Mock(selectedToken).mint(payer, amount);
        vm.prank(payer);
        ERC20Mock(selectedToken).transfer(address(splitter), amount);
    }

    function claim(uint256 memberSeed, uint256 tokenSeed) public {
        address selectedMember = members[memberSeed % members.length];
        address selectedToken = tokens[tokenSeed % tokens.length];

        if(Splitter(splitter).pending(selectedToken, selectedMember) == 0) return; // func won't revert if there is nothing to claim

        uint256 balanceBefore = ERC20Mock(selectedToken).balanceOf(selectedMember);
        vm.prank(selectedMember);
        Splitter(splitter).claim(selectedToken);

        ghost_totalClaimed[selectedToken] += ERC20Mock(selectedToken).balanceOf(selectedMember) - balanceBefore;
        ghost_claimCount++; //count every iteration that passes the silent return (if pending == 0)
        ghost_lastClaimer = selectedMember;
        ghost_lastClaimWasMany = false;
    }

    function claimMany(uint256 memberSeed) public {
        address selectedMember = members[memberSeed % members.length];
        uint256 isSomethingPending;
        uint256[] memory balances = new uint256[](tokens.length);

        //getting "before" balances
        for(uint256 i=0; i < tokens.length; i++){
            isSomethingPending += Splitter(splitter).pending(tokens[i], selectedMember);
            balances[i] = ERC20Mock(tokens[i]).balanceOf(selectedMember);
        }

        if(isSomethingPending == 0) return; //silent return so we don't revert if there is nothing to claim

        //claimMany
        vm.prank(selectedMember);
        Splitter(splitter).claimMany(tokens);

        //updating ghost_variables
        for(uint256 i=0; i < tokens.length; i++){
            ghost_totalClaimed[tokens[i]] += ERC20Mock(tokens[i]).balanceOf(selectedMember) - balances[i];
        }
        ghost_claimManyCount++;
        ghost_lastClaimer = selectedMember;
        ghost_lastClaimWasMany = true;
    }

    // -------------------------- helper --------------------------
    function resetLastClaimer() external {
        ghost_lastClaimer = address(0);
        ghost_lastClaimWasMany = false;
    }
}
