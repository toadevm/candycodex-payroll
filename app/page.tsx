"use client";

import EmployeeDashboard from "@/components/EmployeeDashboard";
import { useAccount, useReadContract } from "wagmi";
import { AutomatedPayrollABI, getContractAddress } from "@/config/contracts";
import { useEffect, useState } from "react";

export default function Home() {
  const { isConnected, address: userAddress, chain } = useAccount();
  const contractAddress = getContractAddress(chain?.id);
  const [isOwner, setIsOwner] = useState(false);
  const [isEmployee, setIsEmployee] = useState(false);
  const [employeesLoaded, setEmployeesLoaded] = useState(false);

  // Check if user is owner
  const { data: owner } = useReadContract({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    functionName: "owner",
  });

  // Get employee list
  const { data: employeeList } = useReadContract({
    address: contractAddress,
    abi: AutomatedPayrollABI,
    functionName: "getAllEmployees",
  });

  useEffect(() => {
    if (userAddress && owner) {
      setIsOwner(userAddress.toLowerCase() === (owner as string).toLowerCase());
    }
  }, [userAddress, owner]);

  useEffect(() => {
    if (employeeList && Array.isArray(employeeList)) {
      const empList = employeeList as string[];
      setEmployeesLoaded(true);

      if (userAddress) {
        const isEmp = empList.some(emp => emp.toLowerCase() === userAddress.toLowerCase());
        setIsEmployee(isEmp);
      }
    }
  }, [employeeList, userAddress]);

  // Only show heading if user is owner or employee (and data is loaded)
  const shouldShowHeading = isConnected && employeesLoaded && (isOwner || isEmployee);

  return (
    <main className="mx-auto max-w-[1600px] px-4 py-6 sm:px-6 lg:px-8 flex-1">
      {shouldShowHeading && (
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
