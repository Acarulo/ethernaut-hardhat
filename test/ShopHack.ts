import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 21 - Shop contract hack", () => {
    async function setUp() {
        const [owner, hacker] = await ethers.getSigners();

        const ShopContract = await ethers.getContractFactory("Shop");
        const ShopHackerContract = await ethers.getContractFactory("BuyerHacker");
        
        const shop = await ShopContract.deploy();
        const buyer = await ShopHackerContract.deploy(await shop.getAddress());

        return {owner, hacker, shop, buyer};
    };
    
    describe("When hacking", () => {
        it("Hacker should be able to buy the item for 25 units instead of 100", async() => {
            /*
             * The ShopHacker price() getter feeds from the Shop's isSold() getter.
             * Inline assembly allows the price getter to return a conditional value based on the victim contract's getter.
             * This way, it can return two different values within the very same buy() call.
            **/
            const {owner, hacker, shop, buyer} = await loadFixture(setUp);

            expect(await shop.isSold()).to.equal(false);
            expect(await shop.price()).to.equal("100");

            await buyer.connect(hacker).buy();

            expect(await shop.isSold()).to.equal(true);
            expect(await shop.price()).to.equal("25");
        });
    });
});