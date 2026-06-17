import { WagmiProvider } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { createAppKit } from "@reown/appkit/react";
import { WagmiAdapter } from "@reown/appkit-adapter-wagmi";
import { defineChain } from "@reown/appkit/networks";

// Somnia Testnet (Shannon)
const somniaTestnet = defineChain({
  id: parseInt(import.meta.env.VITE_BOTCHAIN_TESTNET_CHAIN_ID), // 50312
  name: "Somnia Testnet",
  nativeCurrency: { name: "Somnia Test Token", symbol: "STT", decimals: 18 },
  rpcUrls: {
    default: { http: [import.meta.env.VITE_BOTCHAIN_TESTNET_RPC_URL] },
  },
  blockExplorers: {
    default: { name: "Shannon Explorer", url: "https://shannon-explorer.somnia.network" },
  },
});

const projectId = import.meta.env.VITE_REOWN_PROJECT_ID;
const queryClient = new QueryClient();
const networks = [somniaTestnet];

const wagmiAdapter = new WagmiAdapter({
  networks,
  projectId,
  ssr: false,
});

createAppKit({
  adapters: [wagmiAdapter],
  networks,
  projectId,
  defaultNetwork: somniaTestnet,
  metadata: {
    name: "ArcadeX",
    description: "Play. Earn. Build — On Any Chain.",
    url: "https://arcade-x-somnia.vercel.app",
    icons: ["/IA-logo.png"],
  },
  features: {
    analytics: false,
    email: false,
    socials: false,
    onramp: false,
    swaps: false,
  },
  themeMode: "dark",
  themeVariables: {
    "--w3m-accent": "#7B2FFF",
    "--w3m-border-radius-master": "8px",
  },
});

export const ARCADE_TOKEN_ADDRESS = import.meta.env.VITE_ARCADE_TOKEN_ADDRESS;
export const LEADERBOARD_ADDRESS = import.meta.env.VITE_LEADERBOARD_ADDRESS;
export const PLATFORM_ADDRESS = import.meta.env.VITE_PLATFORM_ADDRESS;
export const ADMIN_ADDRESS = import.meta.env.VITE_ADMIN_ADDRESS;
export const CHAIN_ID = parseInt(import.meta.env.VITE_BOTCHAIN_TESTNET_CHAIN_ID);

export { wagmiAdapter };

export default function Providers({ children }) {
  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    </WagmiProvider>
  );
}