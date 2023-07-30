//SPDX-License-Identifier: MIT
pragma solidity 0.8.10; // The solidity compiler version is fixed to calculate the amount of remaining gas by the time the gateTwo() modifier is executed.

/*
    Make it past the gatekeeper and register as an entrant to pass this level.

    Things that might help:
    - Remember what you've learned from the Telephone and Token levels.
    - You can learn more about the special function gasleft(), in Solidity's documentation
*/

contract GatekeeperOne {
    address public entrant;

    error GasLeft(uint256 value);

    modifier gateOne() {
        require(msg.sender != tx.origin);
        _;
    }

    modifier gateTwo() {
        uint256 gasLeft = gasleft() % 8191;
        if (gasLeft != 0) revert GasLeft(gasLeft);
        //require(gasleft() % 8191 == 0, "GatekeeperOne: invalid gateTwo");
        _;
    }

    modifier gateThree(bytes8 _gateKey) {
        require(
            uint32(uint64(_gateKey)) == uint16(uint64(_gateKey)),
            "GatekeeperOne: invalid gateThree part one"
        );
        require(
            uint32(uint64(_gateKey)) != uint64(_gateKey),
            "GatekeeperOne: invalid gateThree part two"
        );
        require(
            uint32(uint64(_gateKey)) == uint16(uint160(tx.origin)),
            "GatekeeperOne: invalid gateThree part three"
        );
        _;
    }

    function enter(
        bytes8 _gateKey
    ) public gateOne gateTwo gateThree(_gateKey) returns (bool) {
        entrant = tx.origin;
        return true;
    }
}
