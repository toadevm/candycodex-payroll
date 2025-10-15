"use client";

import { useEffect, useState } from "react";
import { useAccount } from "wagmi";
import { useContractEvents } from "@/lib/useContractEvents";
import { formatEther } from "viem";

export default function EventToast() {
  const { chain } = useAccount();
  const { latestEvent } = useContractEvents(chain?.id);
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (latestEvent) {
      let msg = "";
      const data = latestEvent.data as Record<string, unknown>;

      switch (latestEvent.type) {
        case "EmployeeAdded":
          msg = `✅ Employee added: ${(data.employeeAddress as string)?.slice(0, 6)}...${(data.employeeAddress as string)?.slice(-4)}`;
          break;
        case "EmployeeRemoved":
          msg = `🗑️ Employee removed: ${(data.employeeAddress as string)?.slice(0, 6)}...${(data.employeeAddress as string)?.slice(-4)}`;
          break;
        case "EmployeeUpdated":
          msg = `✏️ Employee updated: ${(data.employeeAddress as string)?.slice(0, 6)}...${(data.employeeAddress as string)?.slice(-4)}`;
          break;
        case "PaymentExecuted":
          const amount = data.amount ? formatEther(data.amount as bigint) : "0";
          const token = data.tokenAddress === "0x0000000000000000000000000000000000000000" ? "ETH" : "Tokens";
          msg = `💰 Payment executed: ${amount} ${token} to ${(data.employeeAddress as string)?.slice(0, 6)}...${(data.employeeAddress as string)?.slice(-4)}`;
          break;
        case "EmployeePaused":
          msg = `⏸️ Employee paused: ${(data.employeeAddress as string)?.slice(0, 6)}...${(data.employeeAddress as string)?.slice(-4)}`;
          break;
        case "EmployeeResumed":
          msg = `▶️ Employee resumed: ${(data.employeeAddress as string)?.slice(0, 6)}...${(data.employeeAddress as string)?.slice(-4)}`;
          break;
        case "FundsDeposited":
          const depositAmount = data.amount ? formatEther(data.amount as bigint) : "0";
          const depositToken = data.tokenAddress === "0x0000000000000000000000000000000000000000" ? "ETH" : "Tokens";
          msg = `💵 Funds deposited: ${depositAmount} ${depositToken}`;
          break;
        case "FundsWithdrawn":
          const withdrawAmount = data.amount ? formatEther(data.amount as bigint) : "0";
          const withdrawToken = data.tokenAddress === "0x0000000000000000000000000000000000000000" ? "ETH" : "Tokens";
          msg = `💸 Funds withdrawn: ${withdrawAmount} ${withdrawToken}`;
          break;
        case "Paused":
          msg = `⏸️ System paused: All payments have been paused`;
          break;
        case "Unpaused":
          msg = `▶️ System resumed: All payments have been resumed`;
          break;
      }

      if (msg) {
        setMessage(msg);
        setVisible(true);

        // Auto-hide after 5 seconds
        const timer = setTimeout(() => {
          setVisible(false);
        }, 5000);

        return () => clearTimeout(timer);
      }
    }
  }, [latestEvent]);

  if (!visible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 animate-slide-up">
      <div className="rounded-lg bg-green-600 px-6 py-3 text-white shadow-lg">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium">{message}</span>
          <button
            onClick={() => setVisible(false)}
            className="ml-2 text-white hover:text-gray-200"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
  );
}
