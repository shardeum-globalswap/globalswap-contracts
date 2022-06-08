let routerAbi = require('../artifacts/contracts/UniswapV2Router02.sol/IUniswapV2Router02.json').abi
const hre = require("hardhat");

const ROUTER = require("../artifacts/contracts/UniswapV2Router02.sol/UniswapV2Router02.json");
const ERC20 = require("../artifacts/contracts/Token.sol/Token.json");
const FactoryJSON = require("../artifacts/contracts/UniswapV2Factory.sol/UniswapV2Factory.json");
const FactoryABI = FactoryJSON.abi;

const { ethers } = require("hardhat");
const fs = require("fs");
const {
  getWETHBalance,
  getTokenBalance,
  transferWETH,
} = require("./deployToken");
const { SignerWithAddress } = require("@nomiclabs/hardhat-ethers/signers");

let routerAddress = '0x56452b4d90c40F717636A1FEF1C6Bb332bE4b9F8';
const oneEth = ethers.utils.parseEther("1.0");

async function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

async function main() {
  let address = fs.readFileSync("address.json");
  address = JSON.parse(address);
  console.log("address", address);
  const [deployer] = await ethers.getSigners();
  const deployerEthBalance = await deployer.getBalance();
  const deployerAddress = await deployer.getAddress();
  console.log(
    "Deployer ETH balance before",
    ethers.utils.formatUnits(deployerEthBalance)
  );

  const routerContract = new ethers.Contract(
    routerAddress,
    ROUTER.abi,
    deployer
  );

  console.log("routerAddress", routerContract.address);

  // sleep(20000)

  const ethAmount = "1";
  const daiAmount = "1000";
  await addLiquidity(
    address.wethAddress,
    address.daiAddress,
    ethAmount,
    daiAmount,
    "0",
    "0",
    routerContract,
    deployerAddress,
    deployer
  );
  const deployerEthBalanceAfter = await deployer.getBalance();
  console.log(
    "Deployer ETH balance after",
    ethers.utils.formatUnits(deployerEthBalanceAfter)
  );
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
      wethAddress
    );
    await routerContract.deployed();
    console.log("routerContract deployed to:", routerContract.address);
    return routerContract;
  } catch (e) {
    console.log("ERROR: ", e);
  }
}

async function getDecimals(token) {
  const decimal = await token.decimals();
  console.log("token decimal", decimal);
  return decimal;
}

async function addLiquidity(
  address1,
  address2,
  amount1,
  amount2,
  amount1min,
  amount2min,
  routerContract,
  account,
  signer
) {
  const tokenBalanceBefore = await getTokenBalance(address2, account);
  console.log(
    "Token before add liquidity",
    ethers.utils.formatUnits(tokenBalanceBefore)
  );
  const wethAddress = await routerContract.WETH();
  console.log("WETH Address fetched from router", wethAddress);
  const token1 = new ethers.Contract(address1, ERC20.abi, signer);
  const token2 = new ethers.Contract(address2, ERC20.abi, signer);

  const token1Decimals = await getDecimals(token1);
  const token2Decimals = await getDecimals(token2);

  const amountIn1 = ethers.utils.parseUnits(amount1, token1Decimals);
  const amountIn2 = ethers.utils.parseUnits(amount2, token2Decimals);

  const amount1Min = ethers.utils.parseUnits(amount1min, token1Decimals);
  const amount2Min = ethers.utils.parseUnits(amount2min, token2Decimals);

  const time = Math.floor(Date.now() / 1000) + 120; // to complete in 2 cycles
  const deadline = ethers.BigNumber.from(time * 1000); // convert s to ms

  // await token1.approve(routerContract.address, amountIn1);
  // await token2.approve(routerContract.address, amountIn2);


  console.log([
    address1,
    address2,
    amountIn1,
    amountIn2,
    amount1Min,
    amount2Min,
    account,
    deadline,
  ]);

  if (address1 === wethAddress) {
    console.log("Add liquidity for ETH + Token", amountIn1, amountIn2);
    // Eth + Token
    const tx = await routerContract.addLiquidityETH(
      address2,
      amountIn2,
      amount2Min,
      amount1Min,
      account,
      deadline,
      { value: amountIn1, gasLimit: 200000000 }
    );
    const receipt = await tx.wait();
    console.log("Receipt", receipt);
  } else if (address2 === wethAddress) {
    console.log("Add liquidity for Token + Eth");
    // Token + Eth
    await routerContract.addLiquidityETH(
      address1,
      amountIn1,
      amount1Min,
      amount2Min,
      account,
      deadline,
      { value: amountIn2 }
    );
  } else {
    console.log("Add liquidity for Token + Token");
    // Token + Token
    await routerContract.addLiquidity(
      address1,
      address2,
      amountIn1,
      amountIn2,
      amount1Min,
      amount2Min,
      account,
      deadline
    );
  }
  const tokenBalanceAfter = await getTokenBalance(address2, account);
  console.log(
    "token balance after add liquidity",
    ethers.utils.formatUnits(tokenBalanceAfter)
  );
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
