import { useMemo, type ReactNode } from 'react';
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import { PhantomWalletAdapter, SolflareWalletAdapter } from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl } from '@solana/web3.js';

// Import Solana wallet adapter styles
import '@solana/wallet-adapter-react-ui/styles.css';

type WalletProviderProps = {
  children: ReactNode;
};

export function SolanaWalletProvider({ children }: WalletProviderProps) {
  // Use devnet for development environment
  const network = WalletAdapterNetwork.Devnet;
  
  // Configure RPC endpoint
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // Set up wallet adapters
  const wallets = useMemo(() => [
    new PhantomWalletAdapter(),
    new SolflareWalletAdapter()
  ], []);

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {children}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
