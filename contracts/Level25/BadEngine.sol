//SPDX-License-Identifier: MIT
pragma solidity <0.7.0;

contract BadEngine {

    function selfDestruct(address recipient) external {
        selfdestruct(payable(recipient));
    }
}