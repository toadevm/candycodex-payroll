import AutomatedPayrollArtifact from "@/contracts/AutomatedPayroll.json";

// Export the ABI
export const AutomatedPayrollABI = AutomatedPayrollArtifact.abi;

// Contract addresses by chain ID
export const CONTRACT_ADDRESSES: Record<number, `0x${string}`> = {
  // Mainnet (Deployed: 2025-10-15)
  1: "0x05675651f110b874ea270d434ad24ab07eb514f3",
  // Sepolia (Deployed: 2025-10-15)
  11155111: "0x386C10D7E4d76483896614FA912B477c08eEF17E",
  // Hardhat local
  31337: "0x5FbDB2315678afecb367f032d93F642f64180aa3",
};

export function getContractAddress(chainId: number | undefined): `0x${string}` | undefined {
  if (!chainId) return undefined;
  return CONTRACT_ADDRESSES[chainId];
}
