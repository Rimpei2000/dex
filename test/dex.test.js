const Dai = artifacts.require("Dai");
const Dex = artifacts.require("Dex");

const BN = require("bn.js");
const chai = require("chai");
const { expect } = chai;
chai.use(require("chai-bn")(BN));

const truffleAssert = require("truffle-assertions");

contract("Dex test", (accounts) => {
    let dai, dex;
    
    const owner = accounts[0];
    const alice = accounts[1];

    before(async() => {
        dai = await Dai.deployed();
        dex = await Dex.deployed();

        await dai.transfer(dex.address, await dai.totalSupply());
    });

    describe("Buy token test", () => {
        it("Should revert when invalid token address is entered", async() => {
            const randomAddr = accounts[8];
            await truffleAssert.reverts(
                dex.buyToken(randomAddr, "1", "1", { value: "1"})
            );
        });

        it("Should pass when every parameter is valid", async() => {
            const tokenAddr = dai.address;
            await truffleAssert.passes(
                dex.buyToken(tokenAddr, "100", "10000", { value: "100", from: alice })
            );
        });

        it("Should update dex and alice balance after buying", async() => {
            const aliceDai = await dai.balanceOf(alice);
            const dexEth = await web3.eth.getBalance(dex.address);

            expect(aliceDai).to.be.bignumber.equal(new BN(10000));
            expect(dexEth).to.be.equal("100");
        });
    });

    describe("Sell token test", async () => {
        it("Should only pass if alice approved token transfer", async () => {
            const tokenAddr = dai.address;
            await truffleAssert.reverts(
                dex.sellToken(tokenAddr, "5000", "50", { from: alice })
            );

            await dai.approve(dex.address, "5000", { from: alice });

            await truffleAssert.passes(
                dex.sellToken(tokenAddr, "5000", "50", { from: alice })
            );
        });
    });
})