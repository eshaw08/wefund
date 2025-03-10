require("@nomicfoundation/hardhat-toolbox");

module.exports = {
  solidity: "0.8.28", // Solidity version
  networks: {
    localhost: {
      url: "http://127.0.0.1:7545", // Ganache RPC URL
      chainId: 1337, // Ganache chain ID
      accounts: {
        mnemonic: "your ganache mnemonic", // Optional: Add your Ganache mnemonic for account access
      },
    },
  },
  paths: {
    sources: "./contracts", // Path to your Solidity contracts
    tests: "./test", // Path to your tests
    cache: "./cache", // Path to cache
    artifacts: "./artifacts", // Path to compiled artifacts
  },
  mocha: {
    timeout: 20000, // Increase timeout for tests (optional)
  },
};