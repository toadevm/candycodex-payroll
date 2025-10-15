"use client";

import { useAccount, useDisconnect } from "wagmi";
import { useEffect, useState } from "react";

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const { address, isConnected, chain } = useAccount();
  const { disconnect } = useDisconnect();

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <header className="border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
        <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 shadow-md text-2xl">
                🍭
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">
                  CandyCodex Payroll
                </h1>
                <p className="text-xs text-slate-500">
                  Blockchain Payroll Management
                </p>
              </div>
            </div>
            <div className="h-9 w-32 animate-pulse rounded-lg bg-slate-200" />
          </div>
        </div>
      </header>
    );
  }

  return (
    <header className="border-b border-slate-200 bg-white/95 backdrop-blur shadow-sm">
      <div className="mx-auto max-w-7xl px-3 py-3 sm:px-4 lg:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-pink-500 to-purple-600 shadow-md text-2xl">
              🍭
            </div>
            <div>
              <h1 className="text-lg font-bold text-slate-800">
                CandyCodex Payroll
              </h1>
              <p className="text-xs text-slate-500">
                Blockchain Payroll Management
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {isConnected && chain && (
              <div className="hidden sm:block rounded-md bg-slate-100 px-3 py-1.5 text-xs font-medium text-slate-700">
                {chain.name}
              </div>
            )}

            {isConnected ? (
              <button
                onClick={() => disconnect()}
                className="rounded-lg bg-gradient-to-r from-blue-600 to-indigo-600 px-3 py-1.5 text-xs font-medium text-white hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 shadow-sm"
              >
                {address?.slice(0, 6)}...{address?.slice(-4)}
              </button>
            ) : (
              <div dangerouslySetInnerHTML={{ __html: '<appkit-button></appkit-button>' }} />
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
