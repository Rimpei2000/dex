const Dai = artifacts.require("Dai");
const Link = artifacts.require("Link");
const Comp = artifacts.require("Comp");

const Dex = artifacts.require("Dex");

const toWei = (number) => web3.utils.toWei(web3.utils.toBN(number), 'ether');

module.exports = async function(deployer) {
  //deploy ERC20 tokens
  await deployer.deploy(Dai, "Dai", "DAI", toWei(10**10));
  const dai = await Dai.deployed();
  await deployer.deploy(Link, "Chainlink", "LINK", toWei(10**6));
  const link = await Link.deployed();
  await deployer.deploy(Comp, "Compound", "COMP", toWei(10**4));
  const comp = await Comp.deployed();

  //deploy Dex 
  await deployer.deploy(Dex, [dai.address, link.address, comp.address]);
  const dex = await Dex.deployed();

  // transfer all the tokens to the deployed dex
  // await dai.transfer(dex.address, toWei(10**10));
  // await link.transfer(dex.address, toWei(10**6));
  // await comp.transfer(dex.address, toWei(10**4));
}
