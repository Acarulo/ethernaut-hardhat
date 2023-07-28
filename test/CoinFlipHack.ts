import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 03 - Coinflip contract hack", () => {
    async function setUp() {
        const [hacker] = await ethers.getSigners();
        const CoinflipContract = await ethers.getContractFactory("CoinFlip");
        const CoinflipHackerContract = await ethers.getContractFactory("CoinFlipHacker");
        
        const coinflip = await CoinflipContract.deploy();
        const coinflipHacker = await CoinflipHackerContract.deploy(await coinflip.getAddress());

        return {hacker, coinflip, coinflipHacker};
    };

    describe("When hacking", () => {
        it("Hacker should be able to 'guess' 10 times in a row", async() => {
            const {hacker, coinflip, coinflipHacker} = await loadFixture(setUp);
  
            expect(await coinflip.consecutiveWins()).to.equal(0);
            for (let i = 0; i < 10; i++) {
                let tx = await coinflipHacker.connect(hacker).guessForSure();
                await tx.wait();
            }

            expect(await coinflip.consecutiveWins()).to.equal(10);
        });
    });
});