import type { Metadata } from "next";
import { Geist, Geist_Mono, Chewy } from "next/font/google";
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

const chewy = Chewy({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-chewy",
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
        className={`${geistSans.variable} ${geistMono.variable} ${chewy.variable} antialiased`}
      >
        <ContextProvider cookies={cookieString}>
          <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-purple-50 flex flex-col">
            <Header />
            <TabNavigation />
            <EventToast />
            {children}
            <footer className="bg-gray-900 text-white mt-auto">
              <div className="container mx-auto px-4 py-6">
                <div className="flex flex-col sm:flex-row justify-between items-center text-xs sm:text-sm text-gray-400 gap-4 sm:gap-0">
                  <p>
                    © {new Date().getFullYear()} CandyCodex Payroll. All rights reserved.
                  </p>
                  <div className="flex space-x-3 sm:space-x-4">
                    <a
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Privacy Policy
                    </a>
                    <a
                      href="#"
                      className="hover:text-white transition-colors"
                    >
                      Terms of Service
                    </a>
                  </div>
                </div>
              </div>
            </footer>
          </div>
        </ContextProvider>
      </body>
    </html>
  );
}
