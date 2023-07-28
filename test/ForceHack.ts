import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 07 - Force contract hack", () => {
    async function setUp() {
        const [hacker] = await ethers.getSigners();

        const ForceContract = await ethers.getContractFactory("Force");
        const force = await ForceContract.deploy();

        return {hacker, force};
    };
    
    describe("When hacking", () => {
        it("Hacker should transfer ETH to the force contract by deploying ForceHack", async() => {
            const {hacker, force} = await loadFixture(setUp);

            expect(await ethers.provider.getBalance(await force.getAddress())).to.equal("0");
            
            const ForceHackContract = await ethers.getContractFactory("ForceHack");
            const forceHack = await ForceHackContract.deploy(await force.getAddress(), {value: ethers.parseEther("1")});

            expect(await ethers.provider.getBalance(await force.getAddress())).to.equal(ethers.parseEther("1"));
        });
    });
});