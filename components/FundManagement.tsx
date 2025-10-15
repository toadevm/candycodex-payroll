"use client";

import { useState, useEffect } from "react";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { AutomatedPayrollABI, getContractAddress } from "@/config/contracts";
import { parseEther, formatEther, isAddress } from "viem";
import { useContractEvents } from "@/lib/useContractEvents";

export default function FundManagement() {
  const { address: userAddress, chain } = useAccount();
  const contractAddress = getContractAddress(chain?.id);
  const { latestEvent } = useContractEvents(chain?.id);

  const [mounted, setMounted] = useState(false);
  const [depositAmount, setDepositAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [tokenAddress, setTokenAddress] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const [showTokenDeposit, setShowTokenDeposit] = useState(false);
  const [showTokenWithdraw, setShowTokenWithdraw] = useState(false);

  const { data: owner } = useReadContract({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    functionName: "owner",
  });

  const { data: ethBalance, refetch: refetchEthBalance } = useReadContract({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    functionName: "getContractETHBalance",
  });

  const isOwner: boolean = !!(userAddress && owner && userAddress.toLowerCase() === (owner as string).toLowerCase());

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isConfirmed) {
      refetchEthBalance();
      setDepositAmount("");
      setWithdrawAmount("");
      setTokenAmount("");
    }
  }, [isConfirmed, refetchEthBalance]);

  useEffect(() => {
    if (latestEvent) {
      const eventTypes = ['FundsDeposited', 'FundsWithdrawn', 'PaymentExecuted'];
      if (eventTypes.includes(latestEvent.type)) {
        refetchEthBalance();
      }
    }
  }, [latestEvent, refetchEthBalance]);

  const handleDepositETH = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractAddress || !depositAmount) return;

    try {
      writeContract({
        address: contractAddress,
        abi: AutomatedPayrollABI,
        functionName: "depositETH",
        value: parseEther(depositAmount),
      });
    } catch (error) {
      console.error("Error depositing ETH:", error);
    }
  };

  const handleWithdrawETH = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractAddress || !withdrawAmount) return;

    try {
      writeContract({
        address: contractAddress,
        abi: AutomatedPayrollABI,
        functionName: "withdrawETH",
        args: [parseEther(withdrawAmount)],
      });
    } catch (error) {
      console.error("Error withdrawing ETH:", error);
    }
  };

  const handleDepositTokens = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractAddress || !tokenAddress || !tokenAmount) return;

    if (!isAddress(tokenAddress)) {
      alert("Invalid token address");
      return;
    }

    try {
      writeContract({
        address: contractAddress,
        abi: AutomatedPayrollABI,
        functionName: "depositTokens",
        args: [tokenAddress as `0x${string}`, parseEther(tokenAmount)],
      });
    } catch (error) {
      console.error("Error depositing tokens:", error);
    }
  };

  const handleWithdrawTokens = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contractAddress || !tokenAddress || !tokenAmount) return;

    if (!isAddress(tokenAddress)) {
      alert("Invalid token address");
      return;
    }

    try {
      writeContract({
        address: contractAddress,
        abi: AutomatedPayrollABI,
        functionName: "withdrawTokens",
        args: [tokenAddress as `0x${string}`, parseEther(tokenAmount)],
      });
    } catch (error) {
      console.error("Error withdrawing tokens:", error);
    }
  };

  if (!mounted) {
    return (
      <div className="space-y-4">
        <div className="h-6 w-40 animate-pulse rounded bg-gray-200" />
        <div className="h-24 animate-pulse rounded-lg bg-gray-100" />
        <div className="grid gap-4 md:grid-cols-2">
          <div className="h-40 animate-pulse rounded-lg bg-gray-100" />
          <div className="h-40 animate-pulse rounded-lg bg-gray-100" />
        </div>
      </div>
    );
  }

  if (!userAddress) {
    return (
      <div className="rounded-lg bg-yellow-50 p-4">
        <p className="text-sm text-yellow-800">
          Please connect your wallet to manage funds.
        </p>
      </div>
    );
  }

  if (!isOwner) {
    return (
      <div className="rounded-lg bg-red-50 p-4">
        <p className="text-sm text-red-800">
          Only the contract owner can manage funds.
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
      <h2 className="text-sm font-semibold text-slate-700 uppercase tracking-wide">Funds</h2>

      <div className="rounded-lg border border-slate-200 bg-gradient-to-br from-blue-50 to-slate-50 p-3">
        <h3 className="mb-1 text-xs font-medium text-slate-600">
          Contract Balance
        </h3>
        <div className="text-xl font-bold text-slate-800">
          {ethBalance ? formatEther(ethBalance as bigint) : "0"} ETH
        </div>
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        {/* Deposit ETH */}
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Deposit ETH
          </h3>
          <form onSubmit={handleDepositETH} className="space-y-3">
            <div>
              <label
                htmlFor="depositAmount"
                className="block text-sm font-medium text-gray-700"
              >
                Amount (ETH)
              </label>
              <input
                type="number"
                id="depositAmount"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="1.0"
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isPending || isConfirming}
              className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
            >
              {isPending || isConfirming ? "Processing..." : "Deposit"}
            </button>
          </form>
        </div>

        {/* Withdraw ETH */}
        <div className="rounded-lg border border-gray-200 bg-white p-4">
          <h3 className="mb-3 text-sm font-semibold text-gray-900">
            Withdraw ETH
          </h3>
          <form onSubmit={handleWithdrawETH} className="space-y-3">
            <div>
              <label
                htmlFor="withdrawAmount"
                className="block text-sm font-medium text-gray-700"
              >
                Amount (ETH)
              </label>
              <input
                type="number"
                id="withdrawAmount"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="1.0"
                step="0.01"
                min="0"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                required
              />
            </div>
            <button
              type="submit"
              disabled={isPending || isConfirming}
              className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
            >
              {isPending || isConfirming ? "Processing..." : "Withdraw"}
            </button>
          </form>
        </div>
      </div>

      {/* Token Management */}
      <div className="rounded-lg border border-gray-200 bg-white p-4">
        <h3 className="mb-3 text-sm font-semibold text-gray-900">
          Token Management
        </h3>

        <div className="space-y-3">
          <button
            onClick={() => {
              setShowTokenDeposit(!showTokenDeposit);
              setShowTokenWithdraw(false);
            }}
            className="w-full rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            {showTokenDeposit ? "Hide" : "Show"} Token Deposit
          </button>

          {showTokenDeposit && (
            <form onSubmit={handleDepositTokens} className="space-y-3 border-t pt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Token Address
                </label>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="0x..."
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(e.target.value)}
                  placeholder="100"
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isPending || isConfirming}
                className="w-full rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {isPending || isConfirming ? "Processing..." : "Deposit Tokens"}
              </button>
              <p className="text-xs text-gray-500">
                Note: You must first approve the contract to spend your tokens
              </p>
            </form>
          )}

          <button
            onClick={() => {
              setShowTokenWithdraw(!showTokenWithdraw);
              setShowTokenDeposit(false);
            }}
            className="w-full rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-200"
          >
            {showTokenWithdraw ? "Hide" : "Show"} Token Withdrawal
          </button>

          {showTokenWithdraw && (
            <form onSubmit={handleWithdrawTokens} className="space-y-3 border-t pt-3">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Token Address
                </label>
                <input
                  type="text"
                  value={tokenAddress}
                  onChange={(e) => setTokenAddress(e.target.value)}
                  placeholder="0x..."
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Amount
                </label>
                <input
                  type="number"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(e.target.value)}
                  placeholder="100"
                  step="0.01"
                  min="0"
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-sm shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  required
                />
              </div>
              <button
                type="submit"
                disabled={isPending || isConfirming}
                className="w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:opacity-50"
              >
                {isPending || isConfirming ? "Processing..." : "Withdraw Tokens"}
              </button>
            </form>
          )}
        </div>
      </div>

      {isConfirmed && (
        <div className="rounded-md bg-green-50 p-3">
          <p className="text-sm text-green-800">
            Transaction completed successfully!
          </p>
        </div>
      )}
    </div>
  );
}
