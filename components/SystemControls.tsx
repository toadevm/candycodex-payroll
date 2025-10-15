"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { AutomatedPayrollABI, getContractAddress } from "@/config/contracts";
import { parseEther, isAddress } from "viem";
import { useContractEvents } from "@/lib/useContractEvents";

export default function SystemControls() {
  const { address: userAddress, chain } = useAccount();
  const contractAddress = getContractAddress(chain?.id);
  const { latestEvent } = useContractEvents(chain?.id);
  const [mounted, setMounted] = useState(false);

  // Update Employee State
  const [updateAddress, setUpdateAddress] = useState("");
  const [updateAmount, setUpdateAmount] = useState("");
  const [updateInterval, setUpdateInterval] = useState("");
  const [showUpdateForm, setShowUpdateForm] = useState(false);

  const { data: owner } = useReadContract({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    functionName: "owner",
  });

  const { data: isPaused, refetch: refetchPaused } = useReadContract({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    functionName: "paused",
  });

  const isOwner = userAddress && owner && userAddress.toLowerCase() === (owner as string).toLowerCase();

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isConfirmed) {
      setUpdateAddress("");
      setUpdateAmount("");
      setUpdateInterval("");
      setShowUpdateForm(false);
    }
  }, [isConfirmed]);

  useEffect(() => {
    if (latestEvent) {
      const eventTypes = ['Paused', 'Unpaused'];
      if (eventTypes.includes(latestEvent.type)) {
        refetchPaused();
      }
    }
  }, [latestEvent, refetchPaused]);

  const handlePauseAll = () => {
    if (!contractAddress) return;
    if (confirm("Are you sure you want to pause ALL payments? This is an emergency function.")) {
      writeContract({
        address: contractAddress,
        abi: AutomatedPayrollABI,
        functionName: "pauseAllPayments",
      });
    }
  };

  const handleResumeAll = () => {
    if (!contractAddress) return;
    writeContract({
      address: contractAddress,
      abi: AutomatedPayrollABI,
      functionName: "resumeAllPayments",
    });
  };

  const handleUpdateEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractAddress || !updateAddress || !updateAmount || !updateInterval) return;

    if (!isAddress(updateAddress)) {
      alert("Invalid employee address");
      return;
    }

    if (parseFloat(updateAmount) <= 0) {
      alert("Payment amount must be greater than 0");
      return;
    }

    const intervalNum = parseInt(updateInterval);
    if (intervalNum < 1 || intervalNum > 365) {
      alert("Interval must be between 1 and 365 days");
      return;
    }

    writeContract({
      address: contractAddress,
      abi: AutomatedPayrollABI,
      functionName: "updateEmployee",
      args: [
        updateAddress as `0x${string}`,
        parseEther(updateAmount),
        BigInt(intervalNum),
      ],
    });
  };

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-24 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-24 animate-pulse rounded-lg bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!userAddress) {
    return (
      <div className="rounded-lg bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">
          Please connect your wallet to access system controls.
        </p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <p className="text-sm text-red-800">
          Only the contract owner can access system controls.
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
      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">System</h2>

      {/* System Status */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-gray-900">System Status</h3>
            <p className="mt-1 text-xs text-gray-500">
              Contract payment system status
            </p>
          </div>
          <div>
            <span
              className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                isPaused
                  ? "bg-red-100 text-red-800"
                  : "bg-green-100 text-green-800"
              }`}
            >
              {isPaused ? "⏸️ Paused" : "▶️ Active"}
            </span>
          </div>
        </div>
      </div>

      {/* Emergency Controls */}
      <div className="rounded-lg border border-red-200 bg-red-50 p-4">
        <h3 className="mb-3 text-sm font-semibold text-red-900">
          Emergency Controls
        </h3>
        <p className="mb-3 text-xs text-red-700">
          Use these controls to pause or resume all payments system-wide
        </p>
        <div className="flex gap-2">
          <button
            onClick={handlePauseAll}
            disabled={isPending || isConfirming || isPaused}
            className="flex-1 rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
          >
            {isPending || isConfirming ? "Processing..." : "Pause All Payments"}
          </button>
          <button
            onClick={handleResumeAll}
            disabled={isPending || isConfirming || !isPaused}
            className="flex-1 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
          >
            {isPending || isConfirming ? "Processing..." : "Resume All Payments"}
          </button>
        </div>
      </div>

      {/* Update Employee */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <button
          onClick={() => setShowUpdateForm(!showUpdateForm)}
          className="flex w-full items-center justify-between text-left"
        >
          <div>
            <h3 className="text-sm font-semibold text-gray-900">
              Update Employee Payment
            </h3>
            <p className="mt-1 text-xs text-gray-500">
              Modify employee payment amount and interval
            </p>
          </div>
          <span className="text-gray-400">
            {showUpdateForm ? "▼" : "▶"}
          </span>
        </button>

        {showUpdateForm && (
          <form onSubmit={handleUpdateEmployee} className="mt-4 space-y-3 border-t pt-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Employee Address
              </label>
              <input
                type="text"
                value={updateAddress}
                onChange={(e) => setUpdateAddress(e.target.value)}
                placeholder="0x..."
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Payment Amount (ETH/Tokens)
              </label>
              <input
                type="number"
                value={updateAmount}
                onChange={(e) => setUpdateAmount(e.target.value)}
                placeholder="1.0"
                step="0.000001"
                min="0"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                New Interval (days)
              </label>
              <input
                type="number"
                value={updateInterval}
                onChange={(e) => setUpdateInterval(e.target.value)}
                placeholder="30"
                min="1"
                max="365"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isPending || isConfirming}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending || isConfirming ? "Updating..." : "Update Employee"}
            </button>
          </form>
        )}
      </div>

      {isConfirmed && (
        <div className="rounded-md bg-green-50 p-3">
          <p className="text-sm text-green-800">
            Operation completed successfully!
          </p>
        </div>
      )}
    </div>
  );
}
