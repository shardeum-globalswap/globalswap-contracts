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

async function deployToken(name, symbol, supply) {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  try {
    console.log(`Deploying ${symbol} Token`);
    const TokenFactory = await ethers.getContractFactory("Token");
    const tokenContract = await TokenFactory.deploy(
      name,
      symbol,
      ethers.utils.parseUnits(supply)
    );
    await tokenContract.deployed();
    console.log(`${symbol} address:`, tokenContract.address);
    return tokenContract.address;
  } catch (e) {
    console.log("Error while ult deploy", e);
  }
}

async function deployWETH() {
  const [deployer] = await ethers.getSigners();

  console.log("Deploying contracts with the account:", deployer.address);
  console.log("Account balance:", (await deployer.getBalance()).toString());

  try {
    console.log(`Deploying WETH`);
    const TokenFactory = await ethers.getContractFactory("WETH9");
    const tokenContract = await TokenFactory.deploy();
    await tokenContract.deployed();
    console.log(`WETH address:`, tokenContract.address);
    return tokenContract.address;
  } catch (e) {
    console.log("Error while ult deploy", e);
  }
}

async function transferWETH(wethAddress, to, amount) {
  const [deployer] = await ethers.getSigners();
  const sender = await deployer.getAddress();

  const wethContract = new ethers.Contract(wethAddress, wethABI, deployer);
  const userBalance = await wethContract.balanceOf(sender);

  console.log("User WETH Balance: ", ethers.utils.formatUnits(userBalance));

  const tx = await wethContract.transfer(to, ethers.utils.parseUnits(amount));

  await tx.wait();

  const senderNewBalance = await wethContract.balanceOf(sender);
  const receiverBalance = await wethContract.balanceOf(to);

  console.log(
    "User WETH Balance after transfer: ",
    ethers.utils.formatUnits(senderNewBalance)
  );
  console.log(
    "Receiver WETH Balance: ",
    ethers.utils.formatUnits(receiverBalance)
  );
}

async function depositWETH(wethAddress, amount) {
  const [deployer] = await ethers.getSigners();
  const Contract = new ethers.Contract(wethAddress, wethABI, deployer);
  await Contract.deposit({ value: ethers.utils.parseUnits(amount) });
}

async function getWETHBalance(wethAddress, userAddress) {
  const [deployer] = await ethers.getSigners();
  const Contract = new ethers.Contract(wethAddress, wethABI, deployer);
  const balance = await Contract.balanceOf(userAddress);
  return balance;
}

async function getTokenBalance(tokenAddress, userAddress) {
  const [deployer] = await ethers.getSigners();
  const Contract = new ethers.Contract(tokenAddress, ERC20.abi, deployer);
  const balance = await Contract.balanceOf(userAddress);
  return balance;
}

module.exports = {
  deployToken,
  deployWETH,
  depositWETH,
  getWETHBalance,
  getTokenBalance,
  transferWETH
};
