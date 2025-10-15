"use client";

import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { type ReactNode, useEffect } from "react";
import { cookieToInitialState, WagmiProvider, type Config, http } from "wagmi";
import { createAppKit } from "@reown/appkit";
import { networks, metadata, projectId } from "@/config/wagmi";
import { mainnet, sepolia, hardhat } from "wagmi/chains";

// Set up queryClient
const queryClient = new QueryClient();

if (!projectId) {
  console.warn("Project ID is not defined");
}

// Create wagmi adapter with explicit transports to avoid WalletConnect RPC rate limits
const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId: projectId || "placeholder",
  transports: {
    [mainnet.id]: http("https://eth.llamarpc.com"),
    [sepolia.id]: http("https://ethereum-sepolia-rpc.publicnode.com"),
    [hardhat.id]: http("http://127.0.0.1:8545"),
  },
});

export const wagmiConfig = wagmiAdapter.wagmiConfig as Config;

// Track if modal is initialized
let modalInitialized = false;

export default function ContextProvider({
  children,
  cookies,
}: {
  children: ReactNode;
  cookies: string | null;
}) {
  const initialState = cookieToInitialState(wagmiConfig, cookies);

  useEffect(() => {
    if (!modalInitialized && projectId) {
      try {
        // Create the modal only once on client side
        const modal = createAppKit({
          adapters: [wagmiAdapter],
          projectId,
          networks,
          metadata,
          themeMode: "light",
          themeVariables: {
            "--w3m-accent": "#3b82f6",
          },
        });

        // Store modal globally for easy access
        if (typeof window !== "undefined") {
          (window as typeof window & { modal: typeof modal }).modal = modal;
        }

        modalInitialized = true;
      } catch (error) {
        console.error("Failed to initialize AppKit:", error);
      }
    }
  }, []);

  return (
    <WagmiProvider config={wagmiConfig} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  );
}
