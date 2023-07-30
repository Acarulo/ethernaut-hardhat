import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 12 - Privacy contract hack", () => {
    async function setUp() {
        const [owner, hacker] = await ethers.getSigners();

        const GatekeeperOneContract = await ethers.getContractFactory("GatekeeperOne");
        const GatekeeperHackerContract = await ethers.getContractFactory("GatekeeperOneHacker");

        const gatekeeperOne = await GatekeeperOneContract.deploy();
        const gatekeeperHacker = await GatekeeperHackerContract.deploy(await gatekeeperOne.getAddress());

        return {owner, hacker, gatekeeperOne, gatekeeperHacker};
    };
    
    describe("When hacking", () => {
        it("Retrieving the second elem from the data array should suffice to unlock the contract", async() => {
            const {owner, hacker, gatekeeperOne, gatekeeperHacker} = await loadFixture(setUp);

            expect(await gatekeeperOne.entrant()).to.equal(ethers.ZeroAddress);

            async function recursiveGasLimits(gasLimit: number): Promise<any> {
                try {
                    await gatekeeperHacker.connect(hacker).enterIntoGatekeeper({gasLimit: gasLimit});
                } catch(e) {
                    return await recursiveGasLimits(gasLimit + 1);
                } finally {
                    console.log("Gas limit is:", gasLimit);
                }
            }

            let gasAmount = 2988581;
            //await recursiveGasLimits(gasAmount);
            
            await gatekeeperHacker.connect(hacker).enterIntoGatekeeper({gasLimit: gasAmount});
            expect(await gatekeeperOne.entrant()).to.equal(hacker.address);
        });
    });
});