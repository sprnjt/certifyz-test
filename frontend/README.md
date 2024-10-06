### CertifyZ

Certificate Verification dApp on Aptos with IPFS integration represents a cutting-edge solution in the realm of digital credentialing. This decentralized application ingeniously combines the security and immutability of the Aptos blockchain with the efficient, distributed storage capabilities of the InterPlanetary File System (IPFS).

The dApp addresses the growing need for tamper-proof, easily verifiable digital certificates in various sectors, including education, professional training, and corporate credentialing. By leveraging blockchain technology, it ensures the integrity and authenticity of certificates, while IPFS provides a cost-effective and scalable method for storing the actual certificate data off-chain.

The system works by allowing authorized issuers to create digital certificates, which are then uploaded to IPFS. The resulting IPFS hash, along with relevant metadata such as the recipient's address and timestamp, is recorded on the Aptos blockchain. This approach creates an immutable record of the certificate's existence and provenance.

Verification becomes a straightforward process where anyone can check the authenticity of a certificate by cross-referencing the on-chain data with the IPFS-stored certificate. This not only ensures the certificate's validity but also maintains data privacy and reduces on-chain storage costs.

The dApp's user-friendly interface, coupled with Aptos's fast and efficient blockchain, provides a seamless experience for both issuers and verifiers. It opens up new possibilities for secure, decentralized credential management, potentially revolutionizing how academic achievements, professional certifications, and other accomplishments are recorded and verified in our increasingly digital world.

## Getting Started

Install the necessary node modules by running npm install in terminal.

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Made by Suparnojit Sarkar
