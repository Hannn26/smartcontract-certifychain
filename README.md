# CertifyChain Smart Contract

This project implements an ERC-721 NFT smart contract for managing university diploma certificates on the blockchain. The CertifyChain contract enables a secure authentication and verification flow for universities and students.

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

The CertifyChain contract implements a secure authentication and verification flow:

1. **Access Control**: Administrators can register universities
2. **University Authentication**: Universities have special permissions via role-based access
3. **Whitelist Verification**: Only approved addresses can receive certificates
4. **Certificate Minting**: Universities can mint certificates as NFTs for their students
5. **Wallet Connection**: Students connect their wallets to view their credentials
6. **Certificate Verification**: Anyone can verify the authenticity of certificates

## Usage Example

```javascript
// Register a university (admin only)
await certifyChain.registerUniversity(universityAddress, "University Name");

// Whitelist a student (university only)
await certifyChain.connect(university).whitelistAddress(studentAddress);

// Mint a certificate (university only)
await certifyChain.connect(university).mintCertificate(
  studentAddress,
  "ipfs://metadata-uri",
  "Student Name",
  "University Name",
  2025,
  "Major"
);

// View a certificate (anyone)
const certificateId = await certifyChain.getStudentCertificate(studentAddress);
const certificateDetails = await certifyChain.getCertificateDetails(certificateId);
```
