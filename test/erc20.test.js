const Dai = artifacts.require("Dai");
const Link = artifacts.require("Link");
const Comp = artifacts.require("Comp");

const BN = require("bn.js");
const chai = require("chai");
const { expect } = chai;
chai.use(require("chai-bn")(BN));

const truffleAssert = require("truffle-assertions");

contract("ERC20 token test", (accounts) => {
  let dai, link, comp;

  const owner = accounts[0];
  const alice = accounts[1];
  const bob = accounts[2];

  before(async () => {
    dai = await Dai.deployed();
    link = await Link.deployed();
    comp = await Comp.deployed();
  });

  describe("Basic token test", () => {
    it("Should return token names and symbols correctly", async () => {
      const daiName = await dai.name();
      const linkSymbol = await link.symbol();
      const compName = await comp.name();

      expect(daiName).to.equal("Dai");
      expect(linkSymbol).to.equal("LINK");
      expect(compName).to.equal("Compound");
    });
  });

  //From here, COMP test
  describe("Supply and balance test", () => {
    it("Should have the correct total supply", async () => {
      const totalSupply = await comp.totalSupply();
      const ten_thousand = web3.utils.toWei(web3.utils.toBN(10 ** 4), "ether");
      expect(totalSupply).to.be.bignumber.equal(ten_thousand);
    });

    it("Should have correct initial balances", async () => {
      const ownerBalance = await comp.balanceOf(owner);
      const aliceBalance = await comp.balanceOf(alice);
      const ten_thousand = web3.utils.toWei(web3.utils.toBN(10 ** 4), "ether");
      const zero = web3.utils.toBN(0);
      expect(ownerBalance).to.be.bignumber.equal(ten_thousand);
      expect(aliceBalance).to.be.bignumber.equal(zero);
    });
  });

  describe("transfer() test", () => {
    it("Should revert when transfer amount > balance", async () => {
      const ownerBalance = await comp.balanceOf(owner);
      const transferAmount = ownerBalance.add(new BN(1));
      await truffleAssert.reverts(comp.transfer(alice, transferAmount));
    });

    it("Should pass when transfer amount <= balance", async () => {
      const transferAmount = web3.utils.toBN(1000);
      await truffleAssert.passes(comp.transfer(alice, transferAmount));
    });

    it("Should update balances accordingly", async () => {
      const ownerBalance = await comp.balanceOf(owner);
      const aliceBalance = await comp.balanceOf(alice);
      const totalSupply = await comp.totalSupply();
      const thousand = new BN(1000);
      expect(ownerBalance).to.be.bignumber.equal(totalSupply.sub(thousand));
      expect(aliceBalance).to.be.bignumber.equal(thousand);
    });
  });

  describe("transferFrom() test", () => {
    before(async () => {
      const approveAmount = web3.utils.toBN(500);
      await comp.approve(bob, approveAmount, { from: alice });
    });

    it("Should revert when transfer amount > allowance", async () => {
      const transferAmount = web3.utils.toBN(501);
      await truffleAssert.reverts(
        comp.transferFrom(alice, bob, transferAmount, { from: bob })
      );
    });

    it("Should pass when transfer amount <= allowance", async () => {
      const approvedAmount = await comp.allowance(alice, bob);
      await truffleAssert.passes(
        comp.transferFrom(alice, bob, approvedAmount, { from: bob })
      );
    });
  });
});