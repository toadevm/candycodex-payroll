import { mainnet, sepolia, hardhat } from "wagmi/chains";
import { http } from "wagmi";

// Get projectId from environment variable - you'll need to get this from cloud.reown.com
export const projectId = process.env.NEXT_PUBLIC_REOWN_PROJECT_ID || "";

if (!projectId) {
  console.warn("NEXT_PUBLIC_REOWN_PROJECT_ID is not set");
}

// Define the chains you want to support with custom transports
export const networks = [
  {
    ...mainnet,
    rpcUrls: {
      default: { http: ["https://eth.llamarpc.com"] },
      public: { http: ["https://eth.llamarpc.com"] },
    },
  },
  {
    ...sepolia,
    rpcUrls: {
      default: { http: ["https://ethereum-sepolia-rpc.publicnode.com"] },
      public: { http: ["https://ethereum-sepolia-rpc.publicnode.com"] },
    },
  },
  {
    ...hardhat,
    rpcUrls: {
      default: { http: ["http://127.0.0.1:8545"] },
      public: { http: ["http://127.0.0.1:8545"] },
    },
  },
];

// Metadata for your dApp
export const metadata = {
  name: "CandyCodex Payroll",
  description: "Professional Blockchain Payroll Management System",
  url: "https://candycodex.com",
  icons: ["https://avatars.githubusercontent.com/u/179229932"],
};
