const { ethers } = require("hardhat");

async function main() {
  console.log("Deploying CertifyChain contract...");

  // Get contract factory
  const CertifyChain = await ethers.getContractFactory("CertifyChain");

  // Deploy contract
  const certifyChain = await CertifyChain.deploy();
  await certifyChain.deployed();

  console.log("CertifyChain deployed to:", certifyChain.address);

  return certifyChain;
}

// Execute the deployment
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
