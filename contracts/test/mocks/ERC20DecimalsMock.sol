//SPDX-License-Identifier:MIT
pragma solidity ^0.8.35;

import {ERC20Mock} from "@openzeppelin/contracts/mocks/token/ERC20Mock.sol";

contract ERC20DecimalsMock is ERC20Mock {
    uint8 private immutable _customDecimals;

    constructor(uint8 decimals_) {
        _customDecimals = decimals_;
    }

    function decimals() public view override returns (uint8) {
        return _customDecimals;
    }
}
