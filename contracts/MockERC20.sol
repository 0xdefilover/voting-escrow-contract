// SPDX-License-Identifier: MIT
pragma solidity 0.8.7;

import { ERC20 } from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    constructor() ERC20("TestERC20", "ERC20") {}

    function mint(address account, uint256 amount) public {
        _mint(account, amount);
    }
}
