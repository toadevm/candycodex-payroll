import { mainnet, sepolia, hardhat, type Chain } from "wagmi/chains";

// Get projectId from environment variable - you'll need to get this from cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "";

if (!projectId) {
  console.warn("NEXT_PUBLIC_REOWN_PROJECT_ID is not set");
}

// Define the chains you want to support
export const networks: [Chain, ...Chain[]] = [mainnet, sepolia, hardhat];

// Metadata for your dApp
export const metadata = {
  name: "CandyCodex Payroll",
  description: "Professional Blockchain Payroll Management System",
  url: "https://candycodex.com",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};
