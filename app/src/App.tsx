import './App.css';
import { SolanaWalletProvider } from './components/wallet-provider';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';
import { Counter } from './components/Counter';

// Default styles that can be overridden by your app
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  return (
    <SolanaWalletProvider>
      <div className="app-container">
        <header className="app-header">
          <h1>Solana Counter App</h1>
          <WalletMultiButton />
        </header>
        
        <main className="app-main">
          <Counter />
        </main>
        
        <footer className="app-footer">
          <p>Powered by Magicblock</p>
        </footer>
      </div>
    </SolanaWalletProvider>
  );
}

export default App;
