import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 13 - GatekeeperOne contract hack", () => {
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
            /*
             * A GatekeeperHacker contract is deployed in order to pass all three gates at once and for the hacker to become the entrant.
             * 
             * Gates requisites:
             * The first gate requires the msg.sender to differ from the tx.origin, that's the reason why we need an intermediary contract.
             * The second gate expects the gas left at the time of the check to be a multiple of 8191. We can estimate this with debugging tools (such as Remix).
             * The third gate forces us to do some casting checks on the enter() bytes8 input.
             * By masking out the last 8 bytes of the hacker address and 0xFFFFFFFF0000FFFF using the AND operator, we can pass the third gate. 
            **/
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