import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 19 - Alien codex contract hack", () => {
    async function setUp() {
        const [owner, hacker] = await ethers.getSigners();

        const AlienCodexContract = await ethers.getContractFactory("AlienCodex");
        const AlienCodexHackerContract = await ethers.getContractFactory("AlienCodexHacker");
        
        const alien = await AlienCodexContract.deploy();
        const alienHacker = await AlienCodexHackerContract.deploy(await alien.getAddress());

        return {owner, hacker, alien, alienHacker};
    };

    describe("When deploying", () => {
        it("Contract owner should be the deployer address", async() => {
            const {owner, hacker, alien, alienHacker} = await loadFixture(setUp);

            expect(await alien.owner()).to.equal(owner.address);
        });
    });
    
    describe("When hacking", () => {
        it("Alien hacker contract should bypass the codex restrictions and hacker become the owner", async() => {
            /*
             * Let's check at where in storage is variable is held.
             * As a general rule, if a contract has any dependencies, its dependency variables are stored first in its storage list.
             * In this particular case, AlienCodex imports the Ownable dependency, which holds the private _owner variable.
             * Given that _ownable and contact can be packed together, they are both held at slot 0 in storage.
             * Therefore, we need to understand how dynamic arrays are stored.
             * At storage slot no. 1, the length of codex is stored.
             * Then, in order to determine the storage slot of the element in codex located at "i-est" position, the following calculation must be checked:
             * slot_no_i = keccak256(1) + i
             * That way, in order to check how to override the owner storage slot, we need to take two parameters into account:
             * a. The starting point in storage for the codex values "n"
             * b. The element from codex "i" so that n + i = 0
             * 
             * The revise() method is called to guarantee that codex has a length max uint256 elements (thanks to an old compiler, this operation does underflow, which is what we want)
             * Then AlienCodexHacker provides the bytes32 version of the hacker's address at the target location.
            **/
            const {owner, hacker, alien, alienHacker} = await loadFixture(setUp);
            
            expect(await alien.owner()).to.equal(owner.address);
            expect(await alien.contact()).to.equal(false);

            await alienHacker.connect(hacker).takeOwnership();

            expect(await alien.owner()).to.equal(hacker.address);
        });

        //it("Do the very same from an external call", async() => {});
    });
});