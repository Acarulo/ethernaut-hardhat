import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 19 - Alien codex contract hack", () => {
    async function setUp() {
        const [owner, hacker] = await ethers.getSigners();

        const AlienCodexContract = await ethers.getContractFactory("AlienCodex");
        const AlienCodexHackerContract = await ethers.getContractFactory("AlienCodexHacker");
        
        const alien = await AlienCodexContract.deploy();
        const alienHacker = await AlienCodexHackerContract.deploy(await alien.getAddress());

        return {owner, hacker, alien, alienHacker};
    };

    describe("When deploying", () => {
        it("Contract owner should be the deployer address", async() => {
            const {owner, hacker, alien, alienHacker} = await loadFixture(setUp);

            expect(await alien.owner()).to.equal(owner.address);
        });
    });
    
    describe("When hacking", () => {
        it("Alien hacker contract should bypass the codex restrictions and hacker become the owner", async() => {
            const {owner, hacker, alien, alienHacker} = await loadFixture(setUp);
            
            expect(await alien.owner()).to.equal(owner.address);
            expect(await alien.contact()).to.equal(false);

            await alienHacker.connect(hacker).takeOwnership();

            expect(await alien.owner()).to.equal(hacker.address);
        });

        //it("Do the very same from an external call", async() => {});
    });
});