import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 27 - Good Samaritan contract hack", () => {
    async function setUp() {
        const [owner, hacker] = await ethers.getSigners();

        const GoodSamaritanContract = await ethers.getContractFactory("GoodSamaritan");
        const GoodSamaritanHackerContract = await ethers.getContractFactory("GoodSamaritanHacker");

        const samaritan = await GoodSamaritanContract.deploy();
        const samaritanHacker = await GoodSamaritanHackerContract.deploy();

        return {owner, hacker, samaritan, samaritanHacker};
    };
    
    describe("When hacking", () => {
        it("Hacker should be able to drain the Samaritan's wallet by passing a false-positive error through the notify call", async() => {
            const {owner, hacker, samaritan, samaritanHacker} = await loadFixture(setUp);

            const coin = await ethers.getContractAt("Coin", await samaritan.coin(), owner);
            expect(await coin.balances(await samaritan.wallet())).to.equal(ethers.parseUnits("1", 6));

            await samaritanHacker.connect(hacker).requestDonationFromSamaritan(await samaritan.getAddress());

            expect(await coin.balances(await samaritan.wallet())).to.equal("0");
            expect(await coin.balances(await samaritanHacker.getAddress())).to.equal(ethers.parseUnits("1", 6));
        });
    });
});