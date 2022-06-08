const hre = require("hardhat");
const ShardeumTicketJson = require("../artifacts/contracts/ShardeumTicket.sol/ShardeumTicket.json");
const ShardeumTicketAbi = ShardeumTicketJson.abi;
const AuctionJson = require("../artifacts/contracts/AuctionRepository.sol/AuctionRepository.json");
const { ethers } = require("hardhat");
const AuctionAbi = AuctionJson.abi;
const BN = require("bn.js");
const { BigNumber } = require("ethers");

let auctionContractAddress;
let shardeumTicketAddress;

let AuctionContract;
let ShardeumTicketContract;

const oneEth = ethers.utils.parseEther("5.0");

async function sleep(ms) {
  return new Promise(resolve => {
    setTimeout(resolve, ms)
  })
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const deployerEthBalance = await deployer.getBalance();
  console.log("Deployer ETH balance", deployerEthBalance);

  ShardeumTicketContract = await deployShardeumTicketNft();
  // AuctionContract = await deployAuctionContract();

  shardeumTicketAddress = ShardeumTicketContract.address;
  // auctionContractAddress = AuctionContract.address;
  
  console.log("deployed shardeum nft contract", shardeumTicketAddress)
  console.log("deployed auction contract", auctionContractAddress)

  return

  await sleep(10000)

  // return

  const ticketId = await issueTicketNft(shardeumTicketAddress);

  console.log("Minted ticket with ID", ticketId);

  await sleep(10000)

  const success = await listTicketForSale(
    shardeumTicketAddress,
    ticketId,
    "first NFT",
    1000,
    100000
  );

  if (success) {
    const buyer = await getRandomSigner();
    const auctionId = 0;
    await buyTicket(buyer, auctionId);

    const deployerEthBalance = await deployer.getBalance();
    console.log("Deployer ETH balance", deployerEthBalance);

    const buyerEthBalance = await buyer.getBalance();
    console.log("Buyer ETH balance", buyerEthBalance);

    const ownerOfTicket = await ShardeumTicketContract.ownerOf(ticketId);
    console.log(`Owner of ticker ${ticketId}: `, ownerOfTicket)

    const totalSupply = await ShardeumTicketContract.totalSupply()
    console.log('Total supply', totalSupply);
  }
}

async function buyTicket(buyer, auctionId) {
  const contract = new ethers.Contract(
    auctionContractAddress,
    AuctionAbi,
    buyer
  );
  const bidTx = await contract.bidOnAuction(auctionId, { value: oneEth });
  const bidReceipt = await bidTx.wait();
}

async function deployShardeumTicketNft() {
  try {
    const signers = await ethers.getSigners();
    console.log("signers", signers.length);
    const [deployer] = await ethers.getSigners();
    console.log("Deployer: ", deployer.address);
    // We get the contract to deploy
    const ShardeumTicketContract = await hre.ethers.getContractFactory(
      "ShardeumTicket"
    );
    const shardeumTicket = await ShardeumTicketContract.deploy()

    console.log(shardeumTicket)
    
    // shardeumTicket.deployTransaction.wait().then(receipt => {
    //   console.log("Receipt", receipt)
    // })
  
    // await shardeumTicket.deployed();
    console.log("shardeumTicket deployed to:", shardeumTicket.address);
    return shardeumTicket;
  } catch (e) {
    console.log("ERROR: ", e)
  }

}

async function deployAuctionContract() {
  const [deployer] = await ethers.getSigners();
  console.log("Deployer: ", deployer.address);
  // We get the contract to deploy
  const AuctionContract = await hre.ethers.getContractFactory(
    "AuctionRepository"
  );
  const auctionContract = await AuctionContract.deploy({ gasLimit: new BN(5000000)});

  // await auctionContract.deployed();
  console.log("auctionContract deployed to:", auctionContract.address);
  return auctionContract;
}

async function listTicketForSale(
  shardeumTicketAddress,
  ticketId,
  title,
  metadata,
  price,
  deadlineCycle
) {
  const [deployer] = await ethers.getSigners();
  const auctionContract = await getAuctionContract(auctionContractAddress);
  const ShardeumTicketContract = await getShardeumTicketContract(
    shardeumTicketAddress
  );

  // console.log('ShardeumTicketContract', ShardeumTicketContract)

  const approveTx = await ShardeumTicketContract.transferFrom(
    deployer.address,
    auctionContractAddress,
    ticketId
  );

  await approveTx.wait();

  const tx = await auctionContract.createAuction(
    shardeumTicketAddress,
    ticketId,
    title,
    metadata,
    oneEth
  );
  const receipt = await tx.wait();
  if (receipt.status === 1) return true;
}

async function getShardeumTicketContract(contractAddress) {
  const [deployer] = await ethers.getSigners();
  const contract = new ethers.Contract(
    contractAddress,
    ShardeumTicketAbi,
    deployer
  );
  return contract;
}

async function getAuctionContract(contractAddress) {
  const [deployer] = await ethers.getSigners();
  const contract = new ethers.Contract(contractAddress, AuctionAbi, deployer);
  return contract;
}

async function issueTicketNft(contractAddress, networkSlot) {
  const [deployer] = await ethers.getSigners();
  const contract = await getShardeumTicketContract(contractAddress);
  const uri = {
    slot: networkSlot,
  };
  console.log('Minting a new NFT token')
  const tx = await contract.safeMint(deployer.address, JSON.stringify(uri));
  await tx.wait();
  const ticketId = 0;
  const owner = await contract.ownerOf(ticketId);

  console.log("owner of tokenId 0", owner);
  return ticketId;
}

async function getRandomSigner() {
  const signers = await ethers.getSigners();
  const index = 1 + Math.floor(Math.random() * (signers.length - 1));
  console.log("INDEX", index);
  return signers[index];
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
