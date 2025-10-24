"use client";

import { useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { AutomatedPayrollABI, getContractAddress } from "@/config/contracts";
import { useAccount } from "wagmi";
import { useState, useEffect } from "react";
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

export default function EmployeeDashboard() {
  const { chain, isConnected, address: userAddress } = useAccount();
  const contractAddress = getContractAddress(chain?.id);
  const { latestEvent } = useContractEvents(chain?.id);
  const [mounted, setMounted] = useState(false);
  const [employees, setEmployees] = useState<string[]>([]);
  const [employeeNames, setEmployeeNames] = useState<Record<string, string>>({});
  const [isEmployee, setIsEmployee] = useState<boolean>(false);
  const [isOwner, setIsOwner] = useState<boolean>(false);

  // Read all employees
  const { data: employeeList, refetch: refetchEmployees } = useReadContract({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    functionName: "getAllEmployees",
  });

  // Check if user is owner
  const { data: owner } = useReadContract({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    functionName: "owner",
  });

  const { writeContract, data: hash, isPending } = useWriteContract();
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash });

  useEffect(() => {
    setMounted(true);

    // Fetch employee names from API
    fetch("/api/employee-names")
      .then((res) => res.json())
      .then((data) => setEmployeeNames(data))
      .catch((error) => console.error("Error fetching employee names:", error));
  }, []);

  useEffect(() => {
    if (employeeList && Array.isArray(employeeList)) {
      const empList = employeeList as string[];
      setEmployees(empList);

      // Check if connected wallet is in employee list
      if (userAddress) {
        const isEmp = empList.some(emp => emp.toLowerCase() === userAddress.toLowerCase());
        setIsEmployee(isEmp);
      }
    }
  }, [employeeList, userAddress]);

  useEffect(() => {
    // Check if user is owner
    if (userAddress && owner) {
      setIsOwner(userAddress.toLowerCase() === (owner as string).toLowerCase());
    }
  }, [userAddress, owner]);

  // Fetch employee details for each employee
  useEffect(() => {
    if (employees.length > 0 && contractAddress) {
      employees.forEach(async (empAddress) => {
        try {
          // This is a workaround since we can't use useReadContract in a loop
          // In production, you'd want to batch these calls or use multicall
        } catch (error) {
          console.error(`Error fetching employee ${empAddress}:`, error);
        }
      });
    }
  }, [employees, contractAddress]);

  useEffect(() => {
    if (isConfirmed) {
      refetchEmployees();
    }
  }, [isConfirmed, refetchEmployees]);

  useEffect(() => {
    if (latestEvent) {
      const eventTypes = ['EmployeeAdded', 'EmployeeRemoved', 'EmployeeUpdated', 'PaymentExecuted', 'EmployeePaused', 'EmployeeResumed'];
      if (eventTypes.includes(latestEvent.type)) {
        refetchEmployees();
      }
    }
  }, [latestEvent, refetchEmployees]);

  const handleWithdraw = (employeeAddress: string) => {
    if (!contractAddress) return;
    writeContract({
      address: contractAddress,
      abi: AutomatedPayrollABI,
      functionName: "executePayment",
      args: [employeeAddress as `0x${string}`],
    });
  };

  if (!mounted) {
    return (
      <div className="animate-pulse">
        <div className="h-8 bg-purple-200 rounded w-1/4 mb-4"></div>
        <div className="h-64 bg-purple-100 rounded"></div>
      </div>
    );
  }

  if (!isConnected) {
    return (
      <div className="max-w-2xl mx-auto mt-12 text-center">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 font-chewy">
          Welcome to Candy Codex Developers Portal
        </h1>
        <p className="text-lg text-gray-600 mb-6 font-dynapuff">
          Connect your wallet to view and manage automated payroll payments
        </p>
        <p className="text-base text-gray-500 font-dynapuff">
          This decentralized application enables automated recurring payments for employees.
          Employees can view their payment schedules and withdraw funds when eligible.
          Administrators can manage employee records, fund the contract, and control payment settings.
          All transactions are transparent and recorded on the blockchain.
        </p>
      </div>
    );
  }

  // Show message for connected wallets that are not employees or admin
  if (isConnected && !isEmployee && !isOwner && mounted) {
    return (
      <div className="max-w-2xl mx-auto mt-12">
        <div className="text-center mb-8">
          <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-4 font-chewy">
            Welcome to Candy Codex Developers Portal
          </h1>
          <p className="text-lg text-gray-600 mb-6 font-dynapuff">
            Your wallet is connected
          </p>
        </div>

        <div className="bg-yellow-50 border-2 border-yellow-200 rounded-lg p-6 text-center">
          <div className="text-4xl mb-3">⚠️</div>
          <h2 className="text-xl font-bold text-yellow-900 mb-2">
            Not an Eligible Employee
          </h2>
          <p className="text-yellow-800 mb-4">
            Your wallet address is not registered as an employee in this payroll system.
          </p>
          <div className="bg-white rounded-md p-3 mb-4">
            <p className="text-xs text-gray-500 mb-1">Your Wallet Address</p>
            <code className="text-sm font-mono text-gray-900 break-all">
              {userAddress}
            </code>
          </div>
          <p className="text-sm text-yellow-700">
            Please contact your administrator if you believe this is an error.
          </p>
        </div>
      </div>
    );
  }

  if (!contractAddress) {
    return (
      <div className="text-center py-12">
        <div className="max-w-xl mx-auto bg-red-50 rounded-lg p-6 border-2 border-red-200">
          <p className="text-red-700 font-semibold text-lg mb-2">Contract Not Available</p>
          <p className="text-red-600 text-sm">
            The payroll contract is not deployed on this network. Please switch to Ethereum Mainnet or Sepolia testnet.
          </p>
        </div>
      </div>
    );
  }

  if (employees.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-600">No employees registered in the system</p>
      </div>
    );
  }

  // Filter employees based on user role
  const displayEmployees = isOwner
    ? employees // Admin sees all employees
    : employees.filter(emp => emp.toLowerCase() === userAddress?.toLowerCase()); // Employee sees only themselves

  return (
    <div className="space-y-4">
      {displayEmployees.map((empAddress) => (
        <EmployeeRow
          key={empAddress}
          employeeAddress={empAddress}
          employeeName={employeeNames[empAddress.toLowerCase()]}
          contractAddress={contractAddress}
          onWithdraw={handleWithdraw}
          isPending={isPending}
          isConfirming={isConfirming}
        />
      ))}
    </div>
  );
}

// Separate component for each employee row to handle individual reads
function EmployeeRow({
  employeeAddress,
  employeeName,
  contractAddress,
  onWithdraw,
  isPending,
  isConfirming
}: {
  employeeAddress: string;
  employeeName?: string;
  contractAddress: `0x${string}`;
  onWithdraw: (address: string) => void;
  isPending: boolean;
  isConfirming: boolean;
}) {
  const { data: employeeData } = useReadContract({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    functionName: "getEmployee",
    args: [employeeAddress as `0x${string}`],
  });

  const { data: isEligible } = useReadContract({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    functionName: "isPaymentDue",
    args: [employeeAddress as `0x${string}`],
  });

  if (!employeeData) return null;

  const employee = employeeData as Employee;
  const eligible = isEligible as boolean;

  const formatDate = (timestamp: bigint) => {
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString() + " " + date.toLocaleTimeString();
  };

  const formatNextPaymentDate = (lastPayment: bigint, intervalDays: bigint) => {
    const nextDate = new Date((Number(lastPayment) + Number(intervalDays) * 86400) * 1000);
    return nextDate.toLocaleDateString() + " " + nextDate.toLocaleTimeString();
  };

  return (
    <div className="border-2 border-dashed !border-purple-600 hover:!border-purple-500 rounded-lg p-6 hover:shadow-lg transition-all duration-300 bg-white">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Employee Name */}
        {employeeName && (
          <div>
            <p className="text-xs font-semibold text-gray-700 mb-2">Employee Name</p>
            <p className="text-base font-bold text-purple-600">{employeeName}</p>
          </div>
        )}

        {/* Employee Address */}
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Employee Address</p>
          <code className="text-sm bg-gray-100 px-2 py-1 rounded font-mono text-gray-900 block">
            {employeeAddress.slice(0, 6)}...{employeeAddress.slice(-4)}
          </code>
        </div>

        {/* Payment Amount */}
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Payment Amount</p>
          <p className="font-bold text-base text-green-600">
            {formatEther(employee.paymentAmount)} {employee.tokenAddress === "0x0000000000000000000000000000000000000000" ? "ETH" : "TOKEN"}
          </p>
        </div>

        {/* Payment Interval */}
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Payment Interval</p>
          <p className="font-semibold text-base text-gray-900">{employee.paymentIntervalDays.toString()} days</p>
        </div>

        {/* Status */}
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Status</p>
          <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${employee.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {employee.isActive ? "Active" : "Paused"}
          </span>
        </div>

        {/* Last Payment */}
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Last Payment</p>
          <p className="text-sm font-medium text-gray-900">{formatDate(employee.lastPaymentTimestamp)}</p>
        </div>

        {/* Next Payment Due */}
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Next Payment Due</p>
          <p className="text-sm font-medium text-gray-900">{formatNextPaymentDate(employee.lastPaymentTimestamp, employee.paymentIntervalDays)}</p>
        </div>

        {/* Eligibility */}
        <div>
          <p className="text-xs font-semibold text-gray-700 mb-2">Eligible</p>
          <span className={`inline-block px-3 py-1 rounded text-sm font-semibold ${eligible ? 'bg-blue-100 text-blue-800' : 'bg-gray-200 text-gray-800'}`}>
            {eligible ? "Yes - Due Now" : "Not Yet"}
          </span>
        </div>

        {/* Action Button */}
        <div className="flex items-end">
          <button
            onClick={() => onWithdraw(employeeAddress)}
            disabled={!eligible || !employee.isActive || isPending || isConfirming}
            className={`w-full py-2 px-4 rounded-lg font-semibold text-sm transition-all duration-300 ${
              eligible && employee.isActive && !isPending && !isConfirming
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white shadow-lg hover:shadow-xl'
                : 'bg-gray-300 text-gray-600 cursor-not-allowed'
            }`}
          >
            {isPending || isConfirming ? 'Processing...' : eligible && employee.isActive ? 'Withdraw' : 'Not Due'}
          </button>
        </div>
      </div>
    </div>
  );
}