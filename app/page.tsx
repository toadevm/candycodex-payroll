import EmployeeDashboard from "@/components/EmployeeDashboard";

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:px-6 flex-1">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Employee Dashboard</h1>
        <p className="mt-1 text-xs text-slate-600">
          View employee details and execute payments for eligible employees
        </p>
      </div>

      <EmployeeDashboard />
    </main>
  );
}
