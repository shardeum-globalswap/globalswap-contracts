const multiCallJson = require("../artifacts/contracts/Multicall.sol/Multicall.json");
const multiCallAbi = multiCallJson.abi;

const ultAddress = "0xCaa541E2e57c5B298Db0a1A26Dbb4DDD714D3a02"; // deployed ULT token on shardeum liberty
const accountAddress = "0x1f1545Eb7EE5C3C1c4784ee9ddE5D26A9f76F77C"; // address of ULT deployer

const teamMulticallAddress = "0xEB76F8012c1b57eB2fE6d2fDE8B7FB84eb6360eF"; // multicall contract by core-team

async function balanceCheckThroughMulticall(
  tokenAddress,
  userAddress,
  multicallAddress
) {
  const [deployer] = await ethers.getSigners();
  const balanceOf_callData = `0x70a08231000000000000000000000000${userAddress.slice(
    2
  )}`;
  const multicallContract = new ethers.Contract(
    multicallAddress,
    multiCallAbi,
    deployer
  );
  const result = await multicallContract.callStatic.aggregate([
    [tokenAddress, balanceOf_callData],
  ]);
  return result;
}

async function main() {
  // balance call through core-team's multicall contract
  try {
    const result = await balanceCheckThroughMulticall(
      ultAddress,
      accountAddress,
      teamMulticallAddress
    );
    console.log("Balance:", ethers.utils.formatUnits(result.returnData[0]));
  } catch (e) {
    if (e)
      console.log(
        "Error while getting ULT balance through TEAM multicall contract",
        e.message
      );
  }
}

async function aggregate(targetAddress, callData) {
  const [deployer] = await ethers.getSigners();

  const multicallContract = new ethers.Contract(
    teamMulticallAddress,
    multiCallAbi,
    deployer
  );
  const result = await multicallContract.callStatic.aggregate([
    [targetAddress, callData],
  ]);
  console.log("Aggregate result", result);
  return result;
}

// main();
aggregate("0xEB76F8012c1b57eB2fE6d2fDE8B7FB84eb6360eF", "0x0f28c97d")
