import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 11 - Elevator contract hack", () => {
    async function setUp() {
        const [owner, hacker] = await ethers.getSigners();

        const ElevatorContract = await ethers.getContractFactory("Elevator");
        const BuildingContract = await ethers.getContractFactory("BuildingHack");

        const elevator = await ElevatorContract.deploy();
        const building = await BuildingContract.deploy(await elevator.getAddress());

        return {owner, hacker, elevator, building};
    };
    
    describe("When hacking", () => {
        it("Calling goTo() should take the hacker to the top floor", async() => {
            const {owner, hacker, elevator, building} = await loadFixture(setUp);

            expect(await elevator.top()).to.equal(false);
            await building.connect(hacker).goToTop(BigInt("15"));
            expect(await elevator.top()).to.equal(true);
        });
    });
});