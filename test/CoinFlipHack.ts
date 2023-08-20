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
            /*
             * The alledgedly random coin flip value -which can either be 0 or 1- is the outcome of a math operation:
             *
             * coinflip = uint256(blockhash(block.number - 1)) / FACTOR
             * 
             * Where FACTOR is nothing but a very large value. The side choice is determined on whether coinflip is 0 (false) or 1 (true).
             * Given that we can calculate the blockhash of any given block number but we cannot accurately predict which block will 
             * process the operation, we delegate this calculation to the CoinFlipHack contract.
             * 
             * That way, by iterating guessForSure() 10 times, we can accurately "guess" the side of the coin flip.
            **/
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