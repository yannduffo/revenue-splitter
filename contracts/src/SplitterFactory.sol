//SPDX-License-Identifier:MIT
pragma solidity ^0.8.35;

import {Splitter} from "../src/Splitter.sol";
import {Clones} from "@openzeppelin/contracts/proxy/Clones.sol";

/**
 * @title SplitterFactory
 * @notice Deploys immutable ERC-20 revenue splitters as EIP-1167 minimal proxies.
 * @dev The implementation is deployed once in the constructor and locked by its own
 * constructor, so it can never be initialized by anyone. Clones delegate to it and hold
 * their own storage. Parameter validation lives in Splitter.initialize and is deliberately
 * not duplicated here.
 */
contract SplitterFactory {
    Splitter public immutable implementation;

    mapping(address splitter => bool) private isSplitter; //official splitter mapping

    event SplitterCreated(
        address indexed splitter, address indexed creator, address[] members, uint256[] shareDistribution
    );

    constructor() {
        implementation = new Splitter();
    }

    /**
     * Function to create and initialize a new clone of the Splitter contract
     * @param members  array of the members addresses
     * @param shareDistribution array of the shareDistribution between members (sum should equal 10_0000)
     * @return splitter address of the freshly created clone
     */
    function createSplitter(address[] calldata members, uint256[] calldata shareDistribution)
        external
        returns (address splitter)
    {
        //clone creation
        splitter = Clones.clone(address(implementation));

        //clone initialization
        Splitter(splitter).initialize(members, shareDistribution);

        //saving as an official splitter
        isSplitter[splitter] = true;

        //emiting event & return
        emit SplitterCreated(splitter, msg.sender, members, shareDistribution);
    }

    // ------------------------------------------- getters ------------------------------------------
    function isOfficialSplitter(address splitter) external view returns (bool) {
        return isSplitter[splitter];
    }
}
