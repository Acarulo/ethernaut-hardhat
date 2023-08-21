import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 20 - Denial contract hack", () => {
    async function setUp() {
        const [owner, hacker] = await ethers.getSigners();

        const DenialContract = await ethers.getContractFactory("Denial");
        const DenialHackerContract = await ethers.getContractFactory("DenialHacker");

        const denial = await DenialContract.deploy();
        const denialHacker = await DenialHackerContract.deploy(await denial.getAddress());

        return {owner, hacker, denial, denialHacker};
    };

    describe("When deploying", () => {
        it("Contract owner should be the deployer address", async() => {
            const {owner, hacker, denial, denialHacker} = await loadFixture(setUp);

            expect(await denial.owner()).to.equal(owner.address);
        });
    });
    
    describe("When hacking", () => {
        it("Setting the withdrawal partner should block withdrawals due to the fallback assertion", async() => {
            /*
             * The DenialHacker contract's receive method asserts to false by default.
             * Therefore, any ETH transfer addressed to it will revert.
             * That way, we prevent the contract's owner from withdrawing funds from Denial. 
            **/
            const {owner, hacker, denial, denialHacker} = await loadFixture(setUp);

            await denialHacker.connect(hacker).setWithdrawPartner();

            expect(await denial.connect(hacker).withdraw()).to.be.reverted;
            expect(await denial.connect(owner).withdraw()).to.be.reverted;
        });
    });
});