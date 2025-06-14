# IjasahKuliahNFT Smart Contract

This project implements an ERC-721 NFT smart contract for managing university diploma certificates (ijazah) on the blockchain. The contract handles the authentication flow for universities and students as shown in the project diagram.

## Features

- **Role-Based Access Control**: Universities and admin roles with different permissions
- **Whitelist Mechanism**: Only whitelisted addresses can mint or receive certificates
- **Certificate Management**: Mint, view, and verify academic credentials
- **Flow Implementation**: Matches the diagram flow with authentication, verification, and wallet connection

## Project Structure

- `contracts/`: Contains the smart contract code
- `scripts/`: Deployment and interaction scripts
- `test/`: Unit tests for the contract

## Getting Started

### Prerequisites

- Node.js (LTS version recommended, < v19)
- npm or yarn

### Installation

```shell
# Install dependencies
npm install
```

### Compile Contracts

```shell
npx hardhat compile
```

### Run Tests

```shell
npx hardhat test
```

### Local Deployment

```shell
# Start a local blockchain
npx hardhat node

# In a new terminal, deploy the contract
npx hardhat run scripts/deploy.js --network localhost
```

### Sample Interactions

```shell
# Run the interaction script to see a demonstration of the entire flow
npx hardhat run scripts/interact.js --network localhost
```

## Contract Flow

The contract implements the flow shown in the diagram:

1. **AUTH**: Access control for administrators
2. **Login By Address**: University authentication by address
3. **Check Address/Whitelist**: Verification of whitelisted addresses
4. **University Upload**: Universities can mint certificates as NFTs
5. **Connect Wallet**: Students connect their wallets to view their certificates
6. **Wallet & Email Whitelist**: Only whitelisted wallets can receive certificates

## Usage Example

```javascript
// Register a university (admin only)
await ijasahContract.registerUniversity(universityAddress, "University Name");

// Whitelist a student (university only)
await ijasahContract.connect(university).whitelistAddress(studentAddress);

// Mint a certificate (university only)
await ijasahContract.connect(university).mintCertificate(
  studentAddress,
  "ipfs://metadata-uri",
  "Student Name",
  "University Name",
  2025,
  "Major"
);

// View a certificate (anyone)
const certificateId = await ijasahContract.getStudentCertificate(studentAddress);
const certificateDetails = await ijasahContract.getCertificateDetails(certificateId);
```
