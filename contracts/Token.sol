pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract Token is ERC20 {
    mapping(address => bool) private claimed;
    constructor(string memory name, string memory symbol, uint256 supply) ERC20(name, symbol) {
        _mint(msg.sender, supply);
    }
    function claim() public {
        assert(claimed[msg.sender] != true);
        if (claimed[msg.sender] != true) {
            _mint(msg.sender, 10000000000000000000000);
            claimed[msg.sender] = true;
        }
    }
}
