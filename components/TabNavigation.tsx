"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Users } from "lucide-react";

export default function TabNavigation() {
  const pathname = usePathname();

  const isEmployer = pathname === "/";
  const isManager = pathname === "/manager";

  return (
    <div className="bg-white border-b-2 !border-purple-600">
      <div className="container mx-auto px-4">
        <div className="flex gap-4 py-4">
          <Link
            href="/"
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300
              ${
                isEmployer
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
              }
            `}
          >
            <Briefcase className="h-5 w-5" />
            Employer
          </Link>

          <Link
            href="/manager"
            className={`
              flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-lg transition-all duration-300
              ${
                isManager
                  ? "bg-gradient-to-r from-pink-500 to-purple-500 text-white shadow-lg scale-105"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-105"
              }
            `}
          >
            <Users className="h-5 w-5" />
            Manager
          </Link>
        </div>
      </div>
    </div>
  );
}
