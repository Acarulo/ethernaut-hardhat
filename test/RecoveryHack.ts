import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";
import { getContractAddress } from "@ethersproject/address"
 
describe("Level 17 - Recovery contract hack", () => {
    async function setUp() {
        const [owner, hacker] = await ethers.getSigners();

        const RecoveryContract = await ethers.getContractFactory("Recovery");
        const recovery = await RecoveryContract.connect(owner).deploy();

        return {owner, hacker, recovery};
    };
    
    describe("When hacking", () => {
        it("Token address is recovered by computing the RLP serial value", async() => {
            const {owner, hacker, recovery} = await loadFixture(setUp);

            await recovery.connect(owner).generateToken("Token", ethers.parseEther("1823"));

            // Note 1: the token deployer is not the owner EOA, but rather the recovery contract.
            // Note 2: contract nonce at token deployment is 1.

            // Two ways to compute the expected address:
            const tokenAddr = getContractAddress({from: await recovery.getAddress(), nonce: BigInt(1)});
            const tokenAddr2 = ethers.keccak256(ethers.encodeRlp([await recovery.getAddress(), "0x01"]));
            expect(tokenAddr).to.equal(ethers.getAddress(`0x${tokenAddr2.slice(-40)}`));

            // We verify that the owner's balance on this address equals 1823.
            const token = await ethers.getContractAt("SimpleToken", tokenAddr);
            expect(await token.balances(owner.address)).to.equal(ethers.parseEther("1823"));
        });
    });
});