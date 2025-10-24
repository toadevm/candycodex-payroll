import AddEmployeeForm from "@/components/AddEmployeeForm";
import EmployeeList from "@/components/EmployeeList";
import SystemControls from "@/components/SystemControls";
import FundManagement from "@/components/FundManagement";

export default function ManagerPage() {
  return (
    <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:px-6 flex-1">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Manager Dashboard</h1>
        <p className="mt-1 text-xs text-slate-600">
          Manage employees, funds, and system settings
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Row 1, Column 1 - Add Employee */}
        <div className="rounded-lg border-2 !border-purple-600 bg-white p-4 shadow-lg hover:shadow-xl transition-all duration-300">
          <AddEmployeeForm />
        </div>

        {/* Row 1, Column 2 - Fund Management */}
        <div className="rounded-lg border-2 !border-purple-600 bg-white p-4 shadow-lg hover:shadow-xl transition-all duration-300">
          <FundManagement />
        </div>

        {/* Row 2, Column 1 - Employee List */}
        <div className="rounded-lg border-2 !border-purple-600 bg-white p-4 shadow-lg hover:shadow-xl transition-all duration-300">
          <EmployeeList />
        </div>

        {/* Row 2, Column 2 - System Controls */}
        <div className="rounded-lg border-2 !border-purple-600 bg-white p-4 shadow-lg hover:shadow-xl transition-all duration-300">
          <SystemControls />
        </div>
      </div>
    </main>
  );
}
