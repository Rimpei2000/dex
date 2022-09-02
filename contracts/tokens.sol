// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "./ERC20.sol";

contract Dai is ERC20 {
    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) 
    ERC20(_name, _symbol, _totalSupply) {

    }
}

contract Link is ERC20 {
    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) 
    ERC20(_name, _symbol, _totalSupply) {

    }
}

contract Comp is ERC20 {
    constructor(string memory _name, string memory _symbol, uint256 _totalSupply) 
    ERC20(_name, _symbol, _totalSupply) {

    }
}