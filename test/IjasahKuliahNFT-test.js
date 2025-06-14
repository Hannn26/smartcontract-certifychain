const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("IjasahKuliahNFT", function () {
  let IjasahKuliahNFT, ijazahContract;
  let admin, university1, university2, student1, student2, generalUser;
  const UNIVERSITY_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("UNIVERSITY_ROLE"));
  const ADMIN_ROLE = ethers.utils.keccak256(ethers.utils.toUtf8Bytes("ADMIN_ROLE"));

  beforeEach(async function () {
    // Get signers
    [admin, university1, university2, student1, student2, generalUser] = await ethers.getSigners();
    
    // Deploy contract
    IjasahKuliahNFT = await ethers.getContractFactory("IjasahKuliahNFT");
    ijazahContract = await IjasahKuliahNFT.deploy();
    await ijazahContract.deployed();
  });

  describe("Role-based access", function () {
    it("Should set deployer as admin", async function () {
      expect(await ijazahContract.hasRole(ADMIN_ROLE, admin.address)).to.equal(true);
    });

    it("Should register a university", async function () {
      await ijazahContract.registerUniversity(university1.address, "University Alpha");
      expect(await ijazahContract.hasRole(UNIVERSITY_ROLE, university1.address)).to.equal(true);
      expect(await ijazahContract.checkWhitelisted(university1.address)).to.equal(true);
    });

    it("Should not allow non-admin to register university", async function () {
      await expect(
        ijazahContract.connect(generalUser).registerUniversity(university1.address, "University Alpha")
      ).to.be.reverted;
    });
  });

  describe("Whitelist functionality", function () {
    beforeEach(async function () {
      // Register university1
      await ijazahContract.registerUniversity(university1.address, "University Alpha");
    });

    it("Should allow university to whitelist student", async function () {
      await ijazahContract.connect(university1).whitelistAddress(student1.address);
      expect(await ijazahContract.checkWhitelisted(student1.address)).to.equal(true);
    });

    it("Should not allow non-university to whitelist", async function () {
      await expect(
        ijazahContract.connect(generalUser).whitelistAddress(student1.address)
      ).to.be.reverted;
    });
  });

  describe("Certificate minting", function () {
    beforeEach(async function () {
      // Register university1
      await ijazahContract.registerUniversity(university1.address, "University Alpha");
      
      // Whitelist student1
      await ijazahContract.connect(university1).whitelistAddress(student1.address);
    });

    it("Should mint certificate for whitelisted student", async function () {
      await ijazahContract.connect(university1).mintCertificate(
        student1.address,
        "ipfs://test",
        "John Doe",
        "University Alpha",
        2025,
        "Computer Science"
      );
      
      // Check certificate ownership
      expect(await ijazahContract.ownerOf(0)).to.equal(student1.address);
      
      // Check certificate details
      const cert = await ijazahContract.getCertificateDetails(0);
      expect(cert.studentName).to.equal("John Doe");
      expect(cert.universityName).to.equal("University Alpha");
      expect(cert.graduationYear).to.equal(2025);
      expect(cert.major).to.equal("Computer Science");
      expect(cert.isVerified).to.equal(true);
    });

    it("Should not allow minting for non-whitelisted student", async function () {
      await expect(
        ijazahContract.connect(university1).mintCertificate(
          student2.address, // not whitelisted
          "ipfs://test",
          "Jane Smith",
          "University Alpha",
          2025,
          "Engineering"
        )
      ).to.be.reverted;
    });

    it("Should not allow non-university to mint certificate", async function () {
      await expect(
        ijazahContract.connect(generalUser).mintCertificate(
          student1.address,
          "ipfs://test",
          "John Doe",
          "University Alpha",
          2025,
          "Computer Science"
        )
      ).to.be.reverted;
    });
  });

  describe("Certificate viewing", function () {
    beforeEach(async function () {
      // Register university
      await ijazahContract.registerUniversity(university1.address, "University Alpha");
      
      // Whitelist student
      await ijazahContract.connect(university1).whitelistAddress(student1.address);
      
      // Mint certificate
      await ijazahContract.connect(university1).mintCertificate(
        student1.address,
        "ipfs://test",
        "John Doe",
        "University Alpha",
        2025,
        "Computer Science"
      );
    });

    it("Should get certificate details by tokenId", async function () {
      const cert = await ijazahContract.getCertificateDetails(0);
      expect(cert.studentName).to.equal("John Doe");
      expect(cert.universityName).to.equal("University Alpha");
      expect(cert.major).to.equal("Computer Science");
    });

    it("Should get certificate tokenId by student address", async function () {
      const tokenId = await ijazahContract.getStudentCertificate(student1.address);
      expect(tokenId).to.equal(0);
    });
  });
});
