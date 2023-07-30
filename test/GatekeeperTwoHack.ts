import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 14 - Gatekeeper Two contract hack", () => {
    async function setUp() {
        const [owner, hacker] = await ethers.getSigners();

        const GatekeeperTwoContract = await ethers.getContractFactory("GatekeeperTwo");
        const gatekeeperTwo = await GatekeeperTwoContract.deploy();

        return {owner, hacker, gatekeeperTwo};
    };
    
    describe("When hacking", () => {
        it("Deploying the hacker contract should modify the entrant address", async() => {
            const {owner, hacker, gatekeeperTwo} = await loadFixture(setUp);
            const GatekeeperTwoHackerContract = await ethers.getContractFactory("GatekeeperTwoHacker");

            expect(await gatekeeperTwo.entrant()).to.equal(ethers.ZeroAddress);
            await GatekeeperTwoHackerContract.connect(hacker).deploy(await gatekeeperTwo.getAddress());

            expect(await gatekeeperTwo.entrant()).to.equal(hacker.address);
        });
    });
});