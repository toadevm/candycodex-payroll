import { useWatchContractEvent } from "wagmi";
import { AutomatedPayrollABI, getContractAddress } from "@/config/contracts";
import { useEffect, useState } from "react";

export function useContractEvents(chainId: number | undefined) {
  const contractAddress = getContractAddress(chainId);
  const [latestEvent, setLatestEvent] = useState<{
    type: string;
    data: any;
    timestamp: number;
  } | null>(null);

  // Watch EmployeeAdded events
  useWatchContractEvent({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    eventName: "EmployeeAdded",
    onLogs(logs) {
      logs.forEach((log) => {
        setLatestEvent({
          type: "EmployeeAdded",
          data: log.args,
          timestamp: Date.now(),
        });
      });
    },
  });

  // Watch EmployeeRemoved events
  useWatchContractEvent({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    eventName: "EmployeeRemoved",
    onLogs(logs) {
      logs.forEach((log) => {
        setLatestEvent({
          type: "EmployeeRemoved",
          data: log.args,
          timestamp: Date.now(),
        });
      });
    },
  });

  // Watch EmployeeUpdated events
  useWatchContractEvent({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    eventName: "EmployeeUpdated",
    onLogs(logs) {
      logs.forEach((log) => {
        setLatestEvent({
          type: "EmployeeUpdated",
          data: log.args,
          timestamp: Date.now(),
        });
      });
    },
  });

  // Watch PaymentExecuted events
  useWatchContractEvent({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    eventName: "PaymentExecuted",
    onLogs(logs) {
      logs.forEach((log) => {
        setLatestEvent({
          type: "PaymentExecuted",
          data: log.args,
          timestamp: Date.now(),
        });
      });
    },
  });

  // Watch EmployeePaused events
  useWatchContractEvent({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    eventName: "EmployeePaused",
    onLogs(logs) {
      logs.forEach((log) => {
        setLatestEvent({
          type: "EmployeePaused",
          data: log.args,
          timestamp: Date.now(),
        });
      });
    },
  });

  // Watch EmployeeResumed events
  useWatchContractEvent({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    eventName: "EmployeeResumed",
    onLogs(logs) {
      logs.forEach((log) => {
        setLatestEvent({
          type: "EmployeeResumed",
          data: log.args,
          timestamp: Date.now(),
        });
      });
    },
  });

  // Watch FundsDeposited events
  useWatchContractEvent({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    eventName: "FundsDeposited",
    onLogs(logs) {
      logs.forEach((log) => {
        setLatestEvent({
          type: "FundsDeposited",
          data: log.args,
          timestamp: Date.now(),
        });
      });
    },
  });

  // Watch FundsWithdrawn events
  useWatchContractEvent({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    eventName: "FundsWithdrawn",
    onLogs(logs) {
      logs.forEach((log) => {
        setLatestEvent({
          type: "FundsWithdrawn",
          data: log.args,
          timestamp: Date.now(),
        });
      });
    },
  });

  // Watch Paused events (from OpenZeppelin Pausable)
  useWatchContractEvent({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    eventName: "Paused",
    onLogs(logs) {
      logs.forEach((log) => {
        setLatestEvent({
          type: "Paused",
          data: log.args,
          timestamp: Date.now(),
        });
      });
    },
  });

  // Watch Unpaused events (from OpenZeppelin Pausable)
  useWatchContractEvent({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    eventName: "Unpaused",
    onLogs(logs) {
      logs.forEach((log) => {
        setLatestEvent({
          type: "Unpaused",
          data: log.args,
          timestamp: Date.now(),
        });
      });
    },
  });

  return { latestEvent };
}
