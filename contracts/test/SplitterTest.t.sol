//SPDX-License-Identifier:MIT
pragma solidity ^0.8.35;

import {Test} from "forge-std/Test.sol";
import {Splitter} from "../src/Splitter.sol";

import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

//TODO : Faire des tests avec un token qui n'a pas 18 décimales

contract SplitterTest is Test {
    Splitter splitter;
    ERC20Mock token;

    address user = makeAddr("user");

    function setUp() public {
        splitter = new Splitter();
        //ensuite il faut déployer un clone pour les tests car on vérouille initialize de splitter par son constructeur


        token = new ERC20Mock();

        token.mint(user, 100 ether);
    }
}
