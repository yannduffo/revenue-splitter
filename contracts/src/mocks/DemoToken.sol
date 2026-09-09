//SPDX-License-Identifier: MIT
pragma solidity ^0.8.35;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract DemoToken is ERC20 {
    error DemoToken__MintAmountExceedsLimit(uint256 amount, uint256 maxAmount);

    uint256 private constant MAX_MINT_TOKENS = 10_000;

    uint8 private immutable _decimals;
    uint256 private immutable _maxMintAmount;

    constructor(string memory name_, string memory symbol_, uint8 decimals_) ERC20(name_, symbol_) {
        _decimals = decimals_;
        _maxMintAmount = MAX_MINT_TOKENS * 10 ** _decimals;
    }

    /// @notice Overrides the default ERC20 decimals to allow demo tokens with different decimal values
    function decimals() public view override returns (uint8) {
        return _decimals;
    }

    function faucet() external {
        _mint(msg.sender, 1_000 * 10 ** decimals());
    }

    function mint(address to_, uint256 amount_) external {
        if (amount_ > _maxMintAmount) revert DemoToken__MintAmountExceedsLimit(amount_, _maxMintAmount);
        _mint(to_, amount_);
    }
}
