import PaymentActions from "@/components/PaymentActions";
import EmployeeList from "@/components/EmployeeList";

export default function Home() {
  return (
    <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:px-6 flex-1">
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-slate-800">Employer Dashboard</h1>
        <p className="mt-1 text-xs text-slate-600">
          Execute payments to employees
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-4">
          <div className="rounded-lg border-2 !border-purple-600 bg-white p-4 shadow-lg hover:shadow-xl transition-all duration-300">
            <PaymentActions />
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-4">
          <div className="rounded-lg border-2 !border-purple-600 bg-white p-4 shadow-lg hover:shadow-xl transition-all duration-300">
            <EmployeeList />
          </div>
        </div>
      </div>
    </main>
  );
}
