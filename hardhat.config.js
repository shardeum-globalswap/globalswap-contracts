require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {
  solidity: {
    compilers: [
      {
        version: "0.5.16",
      },
      {
        version: "0.7.6",
      },
      {
        version: "0.6.6",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.8.0",
      },
      {
        version: "0.8.7",
      },
      {
        version: "0.4.18",
      },
    ],
  },
  defaultNetwork: "shardeum",
  networks: {
    shardeum: {
      url: "https://liberty10.shardeum.org",
       // url: "http://localhost:8080",
      chainId: 8080,
      accounts: [
        "74c269689e3af94b20d15dbf14f161e6e13f20704aa6d973dce1ad03e3f045b8",
      ],
    },
    ganache: {
      url: "http://localhost:7545",
      chainId: 1337,
      accounts: [
        "a5cb46448e64593e8827a1a65341812d5924f87435d3540bfc15a271386cd554",
      ],
    },
    hardhat: {
      // url: "http://localhost:8454",
      chainId: 31337,
    },
    ropsten: {
      url: process.env.ROPSTEN_URL || "",
      accounts:
        process.env.PRIVATE_KEY !== undefined ? [process.env.PRIVATE_KEY] : [],
    },
  },
  gasReporter: {
    enabled: process.env.REPORT_GAS !== undefined,
    currency: "USD",
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
};
