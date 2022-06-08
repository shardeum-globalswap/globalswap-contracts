// const tokenABI = require("../abi/TokenABI");
const wethABI = require("../artifacts/contracts/WETH9.sol/WETH9.json").abi;
const ERC20 = require("../artifacts/contracts/Token.sol/Token.json");

// const factoryABI = require('../abi/FactoryABI')

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(true);
    }, ms);
  });
}

function formatNumber(num) {
  return ethers.utils.formatUnits(num);
}


async function deployMulticall() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  try {
    console.log(`Deploying Multicall`);
    const TokenFactory = await ethers.getContractFactory("Multicall");
    const tokenContract = await TokenFactory.deploy();
    await tokenContract.deployed();
    console.log(`Multicall address:`, tokenContract.address);
    return tokenContract.address;
  } catch (e) {
    console.log("Error while ult deploy", e);
  }
}

deployMulticall();

module.exports = {
  deployMulticall

};
