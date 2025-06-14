const { ethers } = require("hardhat");

async function main() {
  console.log("Interacting with IjasahKuliahNFT contract...");
  
  // Get signers for different roles
  const [admin, university1, university2, student1, student2, generalUser] = await ethers.getSigners();
  
  console.log("Admin:", admin.address);
  console.log("University1:", university1.address);
  console.log("University2:", university2.address);
  console.log("Student1:", student1.address);
  console.log("Student2:", student2.address);
  console.log("General User:", generalUser.address);

  // Get contract instance - replace with your deployed contract address or deploy a new one
  let ijazahContract;
  try {
    // Try to get a deployed contract
    const contractAddress = process.env.CONTRACT_ADDRESS;
    if (!contractAddress) {
      throw new Error("Contract address not found in environment");
    }
    ijazahContract = await ethers.getContractAt("IjasahKuliahNFT", contractAddress);
    console.log("Using deployed contract at:", contractAddress);
  } catch (error) {
    // Deploy a new contract
    console.log("Deploying a new contract instance...");
    const IjasahKuliahNFT = await ethers.getContractFactory("IjasahKuliahNFT");
    ijazahContract = await IjasahKuliahNFT.deploy();
    await ijazahContract.deployed();
    console.log("New contract deployed at:", ijazahContract.address);
  }

  // FLOW DEMONSTRATION
  
  // Step 1: AUTH - Admin already has DEFAULT_ADMIN_ROLE from constructor
  console.log("\n--- Step 1: AUTH - Admin Access ---");
  const isAdmin = await ijazahContract.hasRole(ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN_ROLE")), admin.address);
  console.log(`Is admin authenticated: ${isAdmin}`);
  
  // Step 2: Register Universities (from AUTH)
  console.log("\n--- Step 2: Register Universities ---");
  await ijazahContract.registerUniversity(university1.address, "University Alpha");
  await ijazahContract.registerUniversity(university2.address, "University Beta");
  console.log("Registered 2 universities");
  
  // Step 3: Check if universities are whitelisted (university login by address)
  console.log("\n--- Step 3: University Login by Address ---");
  const isUni1Whitelisted = await ijazahContract.checkWhitelisted(university1.address);
  const isUni2Whitelisted = await ijazahContract.checkWhitelisted(university2.address);
  console.log(`University1 whitelisted: ${isUni1Whitelisted}`);
  console.log(`University2 whitelisted: ${isUni2Whitelisted}`);
  
  // Step 4: University whitelists student (manual verification)
  console.log("\n--- Step 4: University whitelists student (manual verification) ---");
  await ijazahContract.connect(university1).whitelistAddress(student1.address);
  await ijazahContract.connect(university2).whitelistAddress(student2.address);
  console.log(`Student1 whitelisted by University1`);
  console.log(`Student2 whitelisted by University2`);
  
  // Step 5: Universities mint certificates (upload ijazah)
  console.log("\n--- Step 5: Universities mint certificates ---");
  
  // University1 mints for student1
  const tokenURI1 = "ipfs://QmAbCdEfGhIjKlMnOpQrStUvWxYz1234567890";
  await ijazahContract.connect(university1).mintCertificate(
    student1.address,
    tokenURI1,
    "John Doe",
    "University Alpha",
    2025,
    "Computer Science"
  );
  console.log(`Certificate minted for student1 (John Doe)`);
  
  // University2 mints for student2
  const tokenURI2 = "ipfs://QmZyXwVuTsRqAbCdEfGhIjKlMnOpQrStUvW";
  await ijazahContract.connect(university2).mintCertificate(
    student2.address,
    tokenURI2,
    "Jane Smith",
    "University Beta",
    2025,
    "Engineering"
  );
  console.log(`Certificate minted for student2 (Jane Smith)`);
  
  // Step 6: Students and general users can view certificates
  console.log("\n--- Step 6: View Certificates ---");
  
  // Get certificate ID for student1
  const certId1 = await ijazahContract.getStudentCertificate(student1.address);
  console.log(`Student1 certificate ID: ${certId1}`);
  
  // View certificate details
  const cert1 = await ijazahContract.getCertificateDetails(certId1);
  console.log("Certificate details for student1:");
  console.log(`- Student Name: ${cert1.studentName}`);
  console.log(`- University: ${cert1.universityName}`);
  console.log(`- Graduation Year: ${cert1.graduationYear}`);
  console.log(`- Major: ${cert1.major}`);
  console.log(`- Verified: ${cert1.isVerified}`);
  
  // Get certificate token URI
  const uri1 = await ijazahContract.tokenURI(certId1);
  console.log(`- Certificate URI: ${uri1}`);
  
  // Check ownership - this would be part of wallet connection for students
  const owner1 = await ijazahContract.ownerOf(certId1);
  console.log(`Certificate owned by: ${owner1}`);
  console.log(`Matches student1 address: ${owner1 === student1.address}`);
  
  console.log("\n--- Flow demonstration completed successfully ---");
}

// Execute script
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
