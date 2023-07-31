import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

/*
 The requirement here is that the solver contract runtime code should not exceed 10 opcodes.
 In this case, the contract will respond to whatIsTheMeaningOfLife() with the number: 18.

 Therefore, we'll implement its answer using opcodes:
 
 For the Runtime bytecode:
    PUSH1 0x12  (pushes the number 18 -0x12- into the stack)
    PUSH1 0x80  (sets the memory location 0x80 into the stack)
    MSTORE      (stores 10 into 0x80 location in memory)
    PUSH1 0x20  (sets the attribute length into the stack)
    PUSH1 0x80  (sets the memory location 0x80 into the stack)
    RETURN      (returns the 0x20-length memory variable at position 0x80)

 Runtime bytecode: 60 12 60 80 52 60 20 60 80 f3 = 601260805260206080f3 (exactly 10 bytes)
 
 For the initialization bytecode:
    PUSH10 601260805260206080f3     (pushing the runtime bytecode into the stack)
    PUSH1 0x00                      (set the 0x00 memory location into the stack)
    MSTORE                          (storing the runtime bytecode into memory at 0x00)
    PUSH1 0x0a                      (set the runtime bytecode length into the stack)
    PUSH1 0x16                      (reading the last 10 bytes from memory 0x00)
    RETURN       

 Deployment bytecode: 69 601260805260206080f3 60 00 52 60 0a 60 16 f3 = 69601260805260206080f3600052600a6016f3 

 Opcodes are:
    PUSH1   0x60
    PUSH10  0x69
    MSTORE  0x52
    RETURN  0xF3

**/

describe("Level 18 - Magic number contract hack", () => {
    async function setUp() {

    };

    describe("When hacking", () => {

    });
});