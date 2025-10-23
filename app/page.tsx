import Header from "@/components/Header";
import AddEmployeeForm from "@/components/AddEmployeeForm";
import EmployeeList from "@/components/EmployeeList";
import PaymentActions from "@/components/PaymentActions";
import FundManagement from "@/components/FundManagement";
import SystemControls from "@/components/SystemControls";
import EventToast from "@/components/EventToast";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50">
      <Header />
      <EventToast />

      <main className="mx-auto max-w-7xl px-3 py-4 sm:px-4 lg:px-6">
        <div className="mb-4">
          <h1 className="text-2xl font-bold text-slate-800">Payroll Dashboard</h1>
          <p className="mt-1 text-xs text-slate-600">
            Manage employees and execute payments
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="rounded-lg border-2 !border-purple-600 bg-white p-4 shadow-lg hover:shadow-xl transition-all duration-300">
              <AddEmployeeForm />
            </div>

            <div className="rounded-lg border-2 !border-purple-600 bg-white p-4 shadow-lg hover:shadow-xl transition-all duration-300">
              <EmployeeList />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div className="rounded-lg border-2 !border-purple-600 bg-white p-4 shadow-lg hover:shadow-xl transition-all duration-300">
              <PaymentActions />
            </div>

            <div className="rounded-lg border-2 !border-purple-600 bg-white p-4 shadow-lg hover:shadow-xl transition-all duration-300">
              <FundManagement />
            </div>

            <div className="rounded-lg border-2 !border-purple-600 bg-white p-4 shadow-lg hover:shadow-xl transition-all duration-300">
              <SystemControls />
            </div>
          </div>
        </div>
      </main>

      <footer className="mt-8 border-t border-purple-300 bg-white/80 backdrop-blur">
        <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs text-slate-600">
            © 2025 Candy Codex. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
