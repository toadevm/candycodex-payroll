"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { AutomatedPayrollABI, getContractAddress } from "@/config/contracts";
import { parseEther, isAddress } from "viem";

export default function AddEmployeeForm() {
  const { address: userAddress, chain } = useAccount();
  const contractAddress = getContractAddress(chain?.id);

  const [mounted, setMounted] = useState(false);
  const [employeeAddress, setEmployeeAddress] = useState("");
  const [employeeName, setEmployeeName] = useState("");
  const [paymentAmount, setPaymentAmount] = useState("");
  const [intervalDays, setIntervalDays] = useState("30");
  const [useToken, setUseToken] = useState(false);
  const [tokenAddress, setTokenAddress] = useState("");

  const { data: owner } = useReadContract({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    functionName: "owner",
  });

  const isOwner: boolean = !!(userAddress && owner && userAddress.toLowerCase() === (owner as string).toLowerCase());

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isConfirmed && hash) {
      // Save employee name to database if provided
      if (employeeName.trim()) {
        fetch("/api/employee-names", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            address: employeeAddress,
            name: employeeName.trim(),
          }),
        }).catch((error) => {
          console.error("Failed to save employee name:", error);
        });
      }

      // Reset form on success
      setEmployeeAddress("");
      setEmployeeName("");
      setPaymentAmount("");
      setIntervalDays("30");
      setTokenAddress("");
      setUseToken(false);
    }
  }, [isConfirmed, hash, employeeAddress, employeeName]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!contractAddress) {
      alert("Contract not deployed on this network");
      return;
    }

    if (!isAddress(employeeAddress)) {
      alert("Invalid employee address");
      return;
    }

    if (parseFloat(paymentAmount) <= 0) {
      alert("Payment amount must be greater than 0");
      return;
    }

    const intervalNum = parseInt(intervalDays);
    if (intervalNum < 1 || intervalNum > 365) {
      alert("Interval must be between 1 and 365 days");
      return;
    }

    if (useToken && !isAddress(tokenAddress)) {
      alert("Invalid token address");
      return;
    }

    writeContract({
      address: contractAddress,
      abi: AutomatedPayrollABI,
      functionName: "addEmployee",
      args: [
        employeeAddress as `0x${string}`,
        parseEther(paymentAmount),
        useToken ? (tokenAddress as `0x${string}`) : "0x0000000000000000000000000000000000000000",
        BigInt(intervalNum),
      ],
    });
  };

  if (!mounted) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <div className="h-8 w-48 animate-pulse rounded bg-gray-200 mb-4" />
        <div className="space-y-4">
          <div className="h-10 animate-pulse rounded bg-gray-100" />
          <div className="h-10 animate-pulse rounded bg-gray-100" />
          <div className="h-10 animate-pulse rounded bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!userAddress) {
    return (
      <div className="rounded-lg bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">
          Please connect your wallet to add employees.
        </p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <p className="text-sm text-red-800">
          Only the contract owner can add employees.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h2 className="mb-3 text-sm font-semibold text-slate-700 uppercase tracking-wide">
        Add Employee
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="employeeAddress"
            className="block text-sm font-medium text-gray-700"
          >
            Employee Address
          </label>
          <input
            type="text"
            id="employeeAddress"
            value={employeeAddress}
            onChange={(e) => setEmployeeAddress(e.target.value)}
            placeholder="0x..."
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label
            htmlFor="employeeName"
            className="block text-sm font-medium text-gray-700"
          >
            Employee Name (Optional)
          </label>
          <input
            type="text"
            id="employeeName"
            value={employeeName}
            onChange={(e) => setEmployeeName(e.target.value)}
            placeholder="e.g., John Doe"
            maxLength={100}
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <p className="mt-1 text-xs text-gray-500">
            Add a friendly name to identify this employee
          </p>
        </div>

        <div className="flex items-center rounded-md border border-gray-200 bg-gray-50 p-3">
          <input
            type="checkbox"
            id="useToken"
            checked={useToken}
            onChange={(e) => setUseToken(e.target.checked)}
            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
          />
          <label
            htmlFor="useToken"
            className="ml-2 block text-sm font-medium text-gray-700"
          >
            Pay with ERC20 Token (instead of ETH)
          </label>
        </div>

        {useToken && (
          <div>
            <label
              htmlFor="tokenAddress"
              className="block text-sm font-medium text-gray-700"
            >
              ERC20 Token Address
            </label>
            <input
              type="text"
              id="tokenAddress"
              value={tokenAddress}
              onChange={(e) => setTokenAddress(e.target.value)}
              placeholder="0x..."
              className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              required={useToken}
            />
            <p className="mt-1 text-xs text-gray-500">
              Enter the ERC20 token contract address
            </p>
          </div>
        )}

        <div>
          <label
            htmlFor="paymentAmount"
            className="block text-sm font-medium text-gray-700"
          >
            Payment Amount {useToken ? "(Tokens)" : "(ETH)"}
          </label>
          <input
            type="number"
            id="paymentAmount"
            value={paymentAmount}
            onChange={(e) => setPaymentAmount(e.target.value)}
            placeholder={useToken ? "100" : "1.0"}
            step="0.000001"
            min="0"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            {useToken
              ? "Amount of tokens to pay per interval (with decimals)"
              : "Amount of ETH to pay per interval"
            }
          </p>
        </div>

        <div>
          <label
            htmlFor="intervalDays"
            className="block text-sm font-medium text-gray-700"
          >
            Payment Interval (days)
          </label>
          <input
            type="number"
            id="intervalDays"
            value={intervalDays}
            onChange={(e) => setIntervalDays(e.target.value)}
            min="1"
            max="365"
            className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            How often should the employee be paid (1-365 days)
          </p>
        </div>

        <button
          type="submit"
          disabled={isPending || isConfirming}
          className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-lg px-4 py-2.5 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 disabled:opacity-50"
        >
          {isPending || isConfirming ? "Adding..." : "Add Employee"}
        </button>

        {error && (
          <div className="rounded-md bg-red-50 p-3">
            <p className="text-sm text-red-800">
              Error: {error.message.slice(0, 100)}...
            </p>
          </div>
        )}

        {isConfirmed && (
          <div className="rounded-md bg-green-50 p-3">
            <p className="text-sm text-green-800">
              Employee added successfully!
            </p>
          </div>
        )}
      </form>
    </div>
  );
}
