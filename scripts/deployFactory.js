const hre = require("hardhat");
let fs = require('fs')

const FactoryJSON = require("../artifacts/contracts/UniswapV2Factory.sol/UniswapV2Factory.json");
const FactoryABI = FactoryJSON.abi;

const TokenJSON = require("../artifacts/contracts/Token.sol/Token.json");
const TokenABI = TokenJSON.abi;

const { ethers } = require("hardhat");
const BN = require("bn.js");
const { BigNumber } = require("ethers");
const {
  deployToken,
  deployWETH,
  depositWETH,
  getWETHBalance,
} = require("./deployToken");

let pairContractAddress;
let factoryAddress;
let routerAddress;

let AuctionContract;
let FactoryContract;
let RouterContract;

const oneEth = ethers.utils.parseEther("5.0");

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerEthBalance = await deployer.getBalance();
  const deployerAddress = await deployer.getAddress();
  console.log("Deployer ETH balance", deployerEthBalance);

  const daiAddress = await deployToken(
    "DAI",
    "DAI",
    "1000000000000000000000000"
  );
  const wethAddress = await deployWETH();

  await depositWETH(wethAddress, "1");

  const wethBalance = await getWETHBalance(wethAddress, deployerAddress);

  console.log("WETH Balance", wethBalance);

  FactoryContract = await deployUniswapFactory();
  factoryAddress = FactoryContract.address;

  await sleep(15000)

  const codeHash = await FactoryContract.INIT_CODE_HASH();

  console.log("factoryAddress", factoryAddress);
  console.log("wethAddress", wethAddress);
  console.log("daiAddress", daiAddress);
  console.log("codeHash", codeHash);
  fs.writeFileSync(
    "address.json",
    JSON.stringify({
      factoryAddress,
      wethAddress,
      daiAddress,
    })
  );
}


async function deployUniswapFactory() {
  try {
    const signers = await ethers.getSigners();
    console.log("signers", signers.length);
    const [deployer] = await ethers.getSigners();
    console.log("Deployer: ", deployer.address);
    // We get the contract to deploy
    const FactoryContract = await hre.ethers.getContractFactory(
      "UniswapV2Factory"
    );
    const factoryContract = await FactoryContract.deploy(deployer.address);
    let receipt = await factoryContract.deployed();
    console.log("factoryContract deployed to:", factoryContract.address);
    return factoryContract;
  } catch (e) {
    console.log("ERROR: ", e);
  }
}

async function deployRouterV2(factoryAddress, wethAddress) {
  try {
    const signers = await ethers.getSigners();
    const [deployer] = await ethers.getSigners();
    const RouterContract = await hre.ethers.getContractFactory(
      "UniswapV2Router02"
    );
    console.log("Deploying router v2");
    const routerContract = await RouterContract.deploy(
      factoryAddress,
      wethAddress,
      { gasLimit: 29000000 }
    );
    await routerContract.deployed();
    console.log("routerContract deployed to:", routerContract.address);
    return routerContract;
  } catch (e) {
    console.log("ERROR: ", e);
  }
}

main();
