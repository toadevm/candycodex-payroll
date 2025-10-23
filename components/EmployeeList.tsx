"use client";

import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { AutomatedPayrollABI, getContractAddress } from "@/config/contracts";
import { useEffect, useState } from "react";
import { formatEther } from "viem";
import { useContractEvents } from "@/lib/useContractEvents";

interface Employee {
  employeeAddress: string;
  paymentAmount: bigint;
  tokenAddress: string;
  paymentIntervalDays: bigint;
  lastPaymentTimestamp: bigint;
  isActive: boolean;
  exists: boolean;
}

export default function EmployeeList() {
  const { address: userAddress, chain } = useAccount();
  const contractAddress = getContractAddress(chain?.id);
  const { latestEvent } = useContractEvents(chain?.id);
  const [mounted, setMounted] = useState(false);
  const [employees, setEmployees] = useState<string[]>([]);
  const [selectedEmployee, setSelectedEmployee] = useState<string | null>(null);
  const [employeeData, setEmployeeData] = useState<Employee | null>(null);

  // Read all employees
  const { data: employeeList, refetch: refetchEmployees } = useReadContract({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    functionName: "getAllEmployees",
  });

  // Read owner
  const { data: owner } = useReadContract({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    functionName: "owner",
  });

  const isOwner: boolean = !!(userAddress && owner && userAddress.toLowerCase() === (owner as string).toLowerCase());

  // Get employee data
  const { data: employeeInfo } = useReadContract({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    functionName: "getEmployee",
    args: selectedEmployee ? [selectedEmployee as `0x${string}`] : undefined,
    query: {
      enabled: !!selectedEmployee,
    },
  });

  // Check if payment is due
  const { data: paymentDue } = useReadContract({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    functionName: "isPaymentDue",
    args: selectedEmployee ? [selectedEmployee as `0x${string}`] : undefined,
    query: {
      enabled: !!selectedEmployee,
    },
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (employeeList) {
      setEmployees(employeeList as string[]);
      if ((employeeList as string[]).length > 0 && !selectedEmployee) {
        setSelectedEmployee((employeeList as string[])[0]);
      }
    }
  }, [employeeList, selectedEmployee]);

  useEffect(() => {
    if (employeeInfo) {
      setEmployeeData(employeeInfo as Employee);
    }
  }, [employeeInfo]);

  useEffect(() => {
    if (isConfirmed) {
      refetchEmployees();
    }
  }, [isConfirmed, refetchEmployees]);

  useEffect(() => {
    if (latestEvent) {
      const eventTypes = ['EmployeeAdded', 'EmployeeRemoved', 'EmployeeUpdated', 'EmployeePaused', 'EmployeeResumed'];
      if (eventTypes.includes(latestEvent.type)) {
        refetchEmployees();
      }
    }
  }, [latestEvent, refetchEmployees]);

  const handlePauseEmployee = () => {
    if (!contractAddress || !selectedEmployee) return;
    writeContract({
      address: contractAddress,
      abi: AutomatedPayrollABI,
      functionName: "pauseEmployee",
      args: [selectedEmployee as `0x${string}`],
    });
  };

  const handleResumeEmployee = () => {
    if (!contractAddress || !selectedEmployee) return;
    writeContract({
      address: contractAddress,
      abi: AutomatedPayrollABI,
      functionName: "resumeEmployee",
      args: [selectedEmployee as `0x${string}`],
    });
  };

  const handleRemoveEmployee = () => {
    if (!contractAddress || !selectedEmployee) return;
    if (confirm(`Are you sure you want to remove employee ${selectedEmployee}?`)) {
      writeContract({
        address: contractAddress,
        abi: AutomatedPayrollABI,
        functionName: "removeEmployee",
        args: [selectedEmployee as `0x${string}`],
      });
      setSelectedEmployee(null);
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="h-6 w-32 animate-pulse rounded bg-gray-200" />
          <div className="h-6 w-24 animate-pulse rounded-full bg-gray-200" />
        </div>
        <div className="h-32 animate-pulse rounded-lg bg-gray-100" />
      </div>
    );
  }

  if (!userAddress) {
    return (
      <div className="rounded-lg bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">
          Please connect your wallet to view employees.
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
        <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Employees</h2>
        <span className="rounded-full bg-blue-100 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          {employees.length} {employees.length === 1 ? "Employee" : "Employees"}
        </span>
      </div>

      {employees.length === 0 ? (
        <div className="rounded-lg bg-gray-50 p-8 text-center">
          <p className="text-sm text-gray-600">No employees added yet.</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-700">
              Select Employee
            </label>
            <select
              value={selectedEmployee || ""}
              onChange={(e) => setSelectedEmployee(e.target.value)}
              className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            >
              {employees.map((emp) => (
                <option key={emp} value={emp}>
                  {emp.slice(0, 6)}...{emp.slice(-4)}
                </option>
              ))}
            </select>
          </div>

          {employeeData && selectedEmployee && (
            <div className="rounded-lg border border-gray-200 bg-white p-4">
              <h3 className="mb-3 text-sm font-semibold text-gray-900">
                Employee Details
              </h3>
              <dl className="space-y-2 text-sm">
                <div>
                  <dt className="font-medium text-gray-500">Address</dt>
                  <dd className="mt-1 text-gray-900 break-all">{selectedEmployee}</dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Payment Amount</dt>
                  <dd className="mt-1 text-gray-900">
                    {formatEther(employeeData.paymentAmount)} ETH
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Interval</dt>
                  <dd className="mt-1 text-gray-900">
                    {employeeData.paymentIntervalDays.toString()} days
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Status</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        employeeData.isActive
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {employeeData.isActive ? "Active" : "Paused"}
                    </span>
                  </dd>
                </div>
                <div>
                  <dt className="font-medium text-gray-500">Payment Due</dt>
                  <dd className="mt-1">
                    <span
                      className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${
                        paymentDue
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {paymentDue ? "Yes" : "No"}
                    </span>
                  </dd>
                </div>
              </dl>

              {isOwner && (
                <div className="mt-4 flex gap-2">
                  {employeeData.isActive ? (
                    <button
                      onClick={handlePauseEmployee}
                      disabled={isPending || isConfirming}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-md px-3 py-2 text-xs font-medium disabled:opacity-50"
                    >
                      {isPending || isConfirming ? "Processing..." : "Pause"}
                    </button>
                  ) : (
                    <button
                      onClick={handleResumeEmployee}
                      disabled={isPending || isConfirming}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-md px-3 py-2 text-xs font-medium disabled:opacity-50"
                    >
                      {isPending || isConfirming ? "Processing..." : "Resume"}
                    </button>
                  )}
                  <button
                    onClick={handleRemoveEmployee}
                    disabled={isPending || isConfirming}
                    className="flex-1 bg-red-600 hover:bg-red-700 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-md px-3 py-2 text-xs font-medium disabled:opacity-50"
                  >
                    {isPending || isConfirming ? "Processing..." : "Remove"}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
