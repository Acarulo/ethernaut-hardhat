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
            const {owner, hacker, king, kingHacker} = await loadFixture(setUp);

            expect(await king._king()).to.equal(owner.address);

            await kingHacker.connect(hacker).convertIntoKing({value: ethers.parseEther("1.000001")});
            expect(await king._king()).to.equal(await kingHacker.getAddress());

            await expect(owner.sendTransaction({to: await king.getAddress(), value: ethers.parseEther("2")})).to.be.reverted;
        });
    });
});