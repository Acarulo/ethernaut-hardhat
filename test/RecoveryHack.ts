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
            /*
             * In order to calculate the missing token address, the hacker must check at the correct Recovery contract nonce
             * that has been used to create the token.
             * 
             * Nonce 0 points to the Recovery contract construction.
             * Nonce 1, the very next transaction, points to the generateToken() call.
             * 
             * That way, we can compute the Token instance address by computing the recursive-length prefix (RLP) 
             * of the Recovery contract address and the correct nonce, which is 1 in this case.
             * 
             * RLP is an encoding/decoding algorithm that serializes data and allows for quick reconstruction.
             * For more on RLP, check the following links:
             * * https://ethereum.org/en/developers/docs/data-structures-and-encoding/rlp/ 
             * * https://medium.com/coinmonks/data-structure-in-ethereum-episode-1-recursive-length-prefix-rlp-encoding-decoding-d1016832f919
            **/
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