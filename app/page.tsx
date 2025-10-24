"use client";

import EmployeeDashboard from "@/components/EmployeeDashboard";
import { useAccount } from "wagmi";

export default function Home() {
  const { isConnected } = useAccount();

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 flex-1">
      {isConnected && (
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-slate-900">Employee Dashboard</h1>
          <p className="mt-2 text-sm text-slate-700">
            View employee details and execute payments for eligible employees
          </p>
        </div>
      )}

      <EmployeeDashboard />
    </main>
  );
}
