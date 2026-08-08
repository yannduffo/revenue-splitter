//SPDX-License-Identifier:MIT
pragma solidity ^0.8.35;

import {Test} from "forge-std/Test.sol";
import {Splitter} from "../src/Splitter.sol";

contract SplitterTest is Test {
    Splitter splitter;

    function setUp() public {
        splitter = new Splitter();
    }
}
