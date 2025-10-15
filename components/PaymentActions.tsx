"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { AutomatedPayrollABI, getContractAddress } from "@/config/contracts";
import { useState, useEffect } from "react";
import { useContractEvents } from "@/lib/useContractEvents";

export default function PaymentActions() {
  const { address: userAddress, chain } = useAccount();
  const contractAddress = getContractAddress(chain?.id);
  const { latestEvent } = useContractEvents(chain?.id);
  const [mounted, setMounted] = useState(false);
  const [eligibleEmployees, setEligibleEmployees] = useState<string[]>([]);
  const [selectedEmployees, setSelectedEmployees] = useState<Set<string>>(new Set());

  const { data: eligible, refetch: refetchEligible } = useReadContract({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    functionName: "getEligibleEmployees",
  });

  const { data: allEmployees } = useReadContract({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    functionName: "getAllEmployees",
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (eligible) {
      setEligibleEmployees(eligible as string[]);
    }
  }, [eligible]);

  useEffect(() => {
    if (isConfirmed) {
      refetchEligible();
      setSelectedEmployees(new Set());
    }
  }, [isConfirmed, refetchEligible]);

  useEffect(() => {
    if (latestEvent) {
      const eventTypes = ['PaymentExecuted', 'EmployeeAdded', 'EmployeeRemoved', 'EmployeeUpdated', 'EmployeePaused', 'EmployeeResumed'];
      if (eventTypes.includes(latestEvent.type)) {
        refetchEligible();
      }
    }
  }, [latestEvent, refetchEligible]);

  const handleExecuteSingle = (employee: string) => {
    if (!contractAddress) return;
    writeContract({
      address: contractAddress,
      abi: AutomatedPayrollABI,
      functionName: "executePayment",
      args: [employee as `0x${string}`],
    });
  };

  const handleExecuteBatch = () => {
    if (!contractAddress || selectedEmployees.size === 0) return;
    writeContract({
      address: contractAddress,
      abi: AutomatedPayrollABI,
      functionName: "executeBatchPayments",
      args: [Array.from(selectedEmployees) as `0x${string}`[]],
    });
  };

  const handleExecuteAll = () => {
    if (!contractAddress) return;
    if (confirm(`Execute payments for all ${eligibleEmployees.length} eligible employees?`)) {
      writeContract({
        address: contractAddress,
        abi: AutomatedPayrollABI,
        functionName: "executeAllPayments",
      });
    }
  };

  const toggleEmployee = (employee: string) => {
    const newSet = new Set(selectedEmployees);
    if (newSet.has(employee)) {
      newSet.delete(employee);
    } else {
      newSet.add(employee);
    }
    setSelectedEmployees(newSet);
  };

  const selectAll = () => {
    setSelectedEmployees(new Set(eligibleEmployees));
  };

  const clearSelection = () => {
    setSelectedEmployees(new Set());
  };

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-20 animate-pulse rounded-full bg-gray-200" />
        </div>
        <div className="h-40 animate-pulse rounded-lg bg-gray-100" />
      </div>
    );
  }

  if (!userAddress) {
    return (
      <div className="rounded-lg bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">
          Please connect your wallet to execute payments.
        </p>
      </div>
    );
  }

  if (!contractAddress) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <p className="text-sm text-red-800">
          Contract not deployed on this network.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">
          Payments
        </h2>
        <span className="rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-700">
          {eligibleEmployees.length} Eligible
        </span>
      </div>

      {eligibleEmployees.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-600">
            No employees eligible for payment at this time.
          </p>
        </div>
      ) : (
        <>
          <div className="rounded-lg border border-gray-200 bg-white p-4">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-semibold text-gray-900">
                Eligible Employees
              </h3>
              <div className="flex gap-2">
                <button
                  onClick={selectAll}
                  className="text-xs text-blue-600 hover:text-blue-700"
                >
                  Select All
                </button>
                <button
                  onClick={clearSelection}
                  className="text-xs text-gray-600 hover:text-gray-700"
                >
                  Clear
                </button>
              </div>
            </div>

            <div className="max-h-60 space-y-2 overflow-y-auto">
              {eligibleEmployees.map((employee) => (
                <div
                  key={employee}
                  className="flex items-center justify-between rounded-md border border-gray-200 bg-gray-50 p-3"
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={selectedEmployees.has(employee)}
                      onChange={() => toggleEmployee(employee)}
                      className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm font-mono text-gray-700">
                      {employee.slice(0, 10)}...{employee.slice(-8)}
                    </span>
                  </div>
                  <button
                    onClick={() => handleExecuteSingle(employee)}
                    disabled={isPending || isConfirming}
                    className="rounded-md bg-green-600 px-3 py-1 text-xs font-medium text-white hover:bg-green-700 disabled:opacity-50"
                  >
                    Pay
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <button
              onClick={handleExecuteBatch}
              disabled={selectedEmployees.size === 0 || isPending || isConfirming}
              className="rounded-lg bg-blue-600 px-4 py-3 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isPending || isConfirming
                ? "Processing..."
                : `Pay Selected (${selectedEmployees.size})`}
            </button>

            <button
              onClick={handleExecuteAll}
              disabled={isPending || isConfirming}
              className="rounded-lg bg-green-600 px-4 py-3 text-sm font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 disabled:opacity-50"
            >
              {isPending || isConfirming
                ? "Processing..."
                : `Pay All (${eligibleEmployees.length})`}
            </button>
          </div>

          {isConfirmed && (
            <div className="rounded-md bg-green-50 p-3">
              <p className="text-sm text-green-800">
                Payment(s) executed successfully!
              </p>
            </div>
          )}
        </>
      )}

      {!!allEmployees && (allEmployees as string[]).length > 0 && eligibleEmployees.length === 0 && (
        <div className="rounded-md bg-blue-50 p-3">
          <p className="text-sm text-blue-800">
            You have {(allEmployees as string[]).length} employee(s), but none are eligible for payment right now.
          </p>
        </div>
      )}
    </div>
  );
}
