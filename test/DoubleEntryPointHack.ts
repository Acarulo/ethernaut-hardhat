import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 26 - Double Entry Point contract hack", () => {
    async function setUp() {
        const [owner, hacker, whiteHacker] = await ethers.getSigners();

        const LegacyTokenContract = await ethers.getContractFactory("LegacyToken");
        const DEPTokenContract = await ethers.getContractFactory("DoubleEntryPoint");
        const CryptoVaultContract = await ethers.getContractFactory("CryptoVault");
        const FortaContract = await ethers.getContractFactory("Forta");
        const DetectionContract = await ethers.getContractFactory("DetectionBot");
        
        const legacy = await LegacyTokenContract.deploy();
        const vault = await CryptoVaultContract.deploy(owner.address);
        const forta = await FortaContract.deploy();
        const dep = await DEPTokenContract.deploy(await legacy.getAddress(), await vault.getAddress(), await forta.getAddress(), whiteHacker.address);
        const detection = await DetectionContract.deploy(await vault.getAddress());

        // Minting 100 units of the legacy token.
        await legacy.connect(owner).mint(await vault.getAddress(), ethers.parseEther("100"));
        await legacy.connect(owner).delegateToNewContract(await dep.getAddress());

        // Setting dep as the underlying token in the vault contract.
        await vault.connect(owner).setUnderlying(await dep.getAddress());

        return {owner, hacker, whiteHacker, legacy, vault, forta, dep, detection};
    };
    
    describe("When hacking", () => {
        it("Hacker should be able to remove the DEP token balance by calling the sweep function", async() => {
            const {owner, hacker, whiteHacker, legacy, vault, forta, dep} = await loadFixture(setUp);

            expect(await legacy.balanceOf(await vault.getAddress())).to.equal(ethers.parseEther("100"));
            expect(await dep.balanceOf(await vault.getAddress())).to.equal(ethers.parseEther("100"));

            await vault.connect(hacker).sweepToken(await legacy.getAddress());

            expect(await legacy.balanceOf(await vault.getAddress())).to.equal(ethers.parseEther("100"));
            expect(await dep.balanceOf(await vault.getAddress())).to.equal("0");
        });

        it("Hacker draining attempt should revert upon whitehacker setting his detection bot", async() => {
            const {owner, hacker, whiteHacker, legacy, vault, forta, dep, detection} = await loadFixture(setUp);
            
            expect(await legacy.balanceOf(await vault.getAddress())).to.equal(ethers.parseEther("100"));
            expect(await dep.balanceOf(await vault.getAddress())).to.equal(ethers.parseEther("100"));
           
            await forta.connect(whiteHacker).setDetectionBot(await detection.getAddress());

            await expect(vault.connect(hacker).sweepToken(await legacy.getAddress())).to.be.revertedWith("Alert has been triggered, reverting");
        });
    });
});