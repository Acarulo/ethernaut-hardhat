//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IMagicNum {
    function setSolver(address _solver) external;
}

contract MagicNumberHack {

    IMagicNum magicNum;

    constructor(IMagicNum _magicNum) {
        magicNum = _magicNum;
    }

    function setSolverInstance() external {
        address solver;

        assembly {
            let pointer := mload(0x40)
            mstore(pointer, 0x69601260805260206080f3600052600a6016f3)
            solver := create(0, pointer, 0x13)
        }

        magicNum.setSolver(solver);
    }
}