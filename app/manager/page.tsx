"use client";

import AddEmployeeForm from "@/components/AddEmployeeForm";
import EmployeeList from "@/components/EmployeeList";
import SystemControls from "@/components/SystemControls";
import FundManagement from "@/components/FundManagement";
import { useAccount, useReadContract } from "wagmi";
import { AutomatedPayrollABI, getContractAddress } from "@/config/contracts";
import { useEffect, useState } from "react";

export default function ManagerPage() {
  const { isConnected, address: userAddress, chain } = useAccount();
  const contractAddress = getContractAddress(chain?.id);
  const [mounted, setMounted] = useState(false);
  const [isOwner, setIsOwner] = useState(false);

  // Check if user is owner
  const { data: owner } = useReadContract({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    functionName: "owner",
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (userAddress && owner) {
      setIsOwner(userAddress.toLowerCase() === (owner as string).toLowerCase());
    }
  }, [userAddress, owner]);

  // Loading state
  if (!mounted) {
    return (
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:px-6 flex-1">
        <div className="animate-pulse">
          <div className="h-8 bg-purple-200 rounded w-1/4 mb-4"></div>
          <div className="h-64 bg-purple-100 rounded"></div>
        </div>
      </main>
    );
  }

  // Not connected - show welcome message
  if (!isConnected) {
    return (
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:px-6 flex-1">
        <div className="max-w-2xl mx-auto mt-12 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 font-chewy">
            Welcome to Candy Codex Developers Portal
          </h1>
          <p className="text-lg text-gray-600 mb-6 font-dynapuff">
            Connect your wallet to access manager controls
          </p>
          <p className="text-base text-gray-500 font-dynapuff">
            This section is restricted to administrators only.
            Connect your wallet to manage employees, fund the contract, and control system settings.
            All administrative actions are recorded on the blockchain.
          </p>
        </div>
      </main>
    );
  }

  // Connected but not owner - show not authorized message
  if (isConnected && !isOwner && owner) {
    return (
      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:px-6 flex-1">
        <div className="max-w-2xl mx-auto mt-12">
          <div className="text-center mb-8">
            <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 font-chewy">
              Welcome to Candy Codex Developers Portal
            </h1>
            <p className="text-lg text-gray-600 mb-6 font-dynapuff">
              Your wallet is connected
            </p>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-dashed border-purple-400 rounded-lg p-8 text-center">
            <div className="text-5xl mb-4">🔒</div>
            <h2 className="text-2xl font-bold text-purple-900 mb-3 font-chewy">
              Not Authorized as Administrator
            </h2>
            <p className="text-purple-800 mb-6 font-dynapuff">
              Your wallet address does not have administrator privileges for this payroll system.
            </p>
            <div className="bg-white rounded-lg border-2 border-purple-200 p-4 mb-6">
              <p className="text-xs font-semibold text-purple-700 mb-2">Your Wallet Address</p>
              <code className="text-sm font-mono text-gray-900 break-all block">
                {userAddress}
              </code>
            </div>
            <p className="text-sm text-purple-700 font-dynapuff">
              Only the contract owner can access this section. Please contact the system administrator if you believe this is an error.
            </p>
          </div>
        </div>
      </main>
    );
  }

  // Owner - show manager dashboard
  return (
    <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:px-6 flex-1">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Manager Dashboard</h1>
        <p className="mt-1 text-xs text-slate-600">
          Manage employees, funds, and system settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Row 1, Column 1 - Add Employee */}
        <div className="rounded-lg border-2 !border-purple-600 bg-white p-4 shadow-lg hover:shadow-xl transition-all duration-300">
          <AddEmployeeForm />
        </div>

        {/* Row 1, Column 2 - Fund Management */}
        <div className="rounded-lg border-2 !border-purple-600 bg-white p-4 shadow-lg hover:shadow-xl transition-all duration-300">
          <FundManagement />
        </div>

        {/* Row 2, Column 1 - Employee List */}
        <div className="rounded-lg border-2 !border-purple-600 bg-white p-4 shadow-lg hover:shadow-xl transition-all duration-300">
          <EmployeeList />
        </div>

        {/* Row 2, Column 2 - System Controls */}
        <div className="rounded-lg border-2 !border-purple-600 bg-white p-4 shadow-lg hover:shadow-xl transition-all duration-300">
          <SystemControls />
        </div>
      </div>
    </main>
  );
}
