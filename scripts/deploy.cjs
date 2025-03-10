const { ethers } = require("hardhat");

async function main() {
  // Get the contract factory for WeFund
  const WeFund = await ethers.getContractFactory("WeFund");
  console.log("Deploying WeFund contract...");

  // Deploy the contract
  const wefund = await WeFund.deploy();
  
  // Wait for the contract to be deployed
  await wefund.waitForDeployment();

  // Get the contract address
  const contractAddress = await wefund.getAddress();
  console.log("WeFund deployed to:", contractAddress);

  // Optional: Log the transaction hash
  const deploymentTransaction = wefund.deploymentTransaction();
  console.log("Transaction hash:", deploymentTransaction.hash);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("Deployment failed:", error);
    process.exit(1);
  });