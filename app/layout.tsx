import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import "./globals.css";
import ContextProvider from "@/lib/ContextProvider";
import Header from "@/components/Header";
import TabNavigation from "@/components/TabNavigation";
import EventToast from "@/components/EventToast";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CandyCodex Payroll - Blockchain Payroll Management",
  description: "Professional blockchain-based payroll system for managing employee payments with cryptocurrency",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const cookieString = cookieStore.toString();

  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ContextProvider cookies={cookieString}>
          <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex flex-col">
            <Header />
            <TabNavigation />
            <EventToast />
            {children}
            <footer className="mt-auto border-t-2 !border-purple-600 bg-white/95 backdrop-blur">
              <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
                <p className="text-center text-xs text-slate-600">
                  Built with ❤️ by Candy Codex
                </p>
              </div>
            </footer>
          </div>
        </ContextProvider>
      </body>
    </html>
  );
}
