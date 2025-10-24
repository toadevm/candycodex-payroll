"use client";

import EmployeeDashboard from "@/components/EmployeeDashboard";
import { useAccount, useReadContract } from "wagmi";
import { AutomatedPayrollABI, getContractAddress } from "@/config/contracts";
import { useEffect, useState } from "react";

export default function Home() {
  const { isConnected, address: userAddress, chain } = useAccount();
  const contractAddress = getContractAddress(chain?.id);
  const [isOwner, setIsOwner] = useState(false);

  // Check if user is owner
  const { data: owner } = useReadContract({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    functionName: "owner",
  });

  useEffect(() => {
    if (userAddress && owner) {
      setIsOwner(userAddress.toLowerCase() === (owner as string).toLowerCase());
    }
  }, [userAddress, owner]);

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 flex-1">
      {isConnected && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">
            {isOwner ? "Employee Dashboard (Admin View)" : "My Payment Dashboard"}
          </h1>
          <p className="mt-2 text-sm text-slate-700">
            {isOwner
              ? "View all employees and execute payments for eligible employees"
              : "View your payment details and withdraw when eligible"
            }
          </p>
        </div>
      )}

      <EmployeeDashboard />
    </main>
  );
}
