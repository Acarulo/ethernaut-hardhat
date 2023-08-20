import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 14 - Gatekeeper Two contract hack", () => {
    async function setUp() {
        const [owner, hacker] = await ethers.getSigners();

        const GatekeeperTwoContract = await ethers.getContractFactory("GatekeeperTwo");
        const gatekeeperTwo = await GatekeeperTwoContract.deploy();

        return {owner, hacker, gatekeeperTwo};
    };
    
    describe("When hacking", () => {
        it("Deploying the hacker contract should modify the entrant address", async() => {
            /*
             * This Gatekeeper level also holds three gates:
             * Gate one: the msg.sender should differ from tx.origin, forcing us to use a contract as intermediary.
             * Gate two: the caller -msg.sender- size should be zero. This can be bypassed by calling enter() from a contract's constructor.
             * Gate three: a casting and logical operation on the msg.sender address should equal the max uint64 value.
             * This later gate can also be bypassed by performing the computation at the GatekeeperHacker contract constructor.
            **/
            const {owner, hacker, gatekeeperTwo} = await loadFixture(setUp);
            const GatekeeperTwoHackerContract = await ethers.getContractFactory("GatekeeperTwoHacker");

            expect(await gatekeeperTwo.entrant()).to.equal(ethers.ZeroAddress);
            await GatekeeperTwoHackerContract.connect(hacker).deploy(await gatekeeperTwo.getAddress());

            expect(await gatekeeperTwo.entrant()).to.equal(hacker.address);
        });
    });
});