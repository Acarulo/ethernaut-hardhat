//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import {IDetectionBot, IForta} from "./DoubleEntryPoint.sol";

contract DetectionBot is IDetectionBot {

    address vault;

    constructor(address _vault) {
        vault = _vault;
    }

    // The function will make use of the msg.data passed by the notify() method from Forta.sol 
    // msg.data, being triggered within the fortaNotify modifier, should be composed of:
    // 1. the handleTransaction selector + the user address.
    // 2. the delegateTransfer selector + its three inputs. 
    // We want to revert if the delegateTransfer call comes from the vault, that is, if origSender == vault.address. 
    // Given the msg.data structure, origSender should be located at position 0xa8.
    function handleTransaction(address user, bytes calldata msgData) external {
        address _caller;

        assembly {
            _caller := calldataload(0xa8)
        }

        if(_caller == vault) {
            IForta(msg.sender).raiseAlert(user);
        }
    }
}