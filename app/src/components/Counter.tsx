import { useState, useEffect } from 'react';
import { useAnchorWallet, useConnection } from '@solana/wallet-adapter-react';
import * as anchor from '@coral-xyz/anchor';
import { Program } from '@coral-xyz/anchor';
import type { Idl } from '@coral-xyz/anchor';
import { PublicKey } from '@solana/web3.js';
import programIDL from '../contract/id.json';

// This should match the program ID in your lib.rs
const PROGRAM_ID = new PublicKey('JDf5TTQD3ViLN4zuBKk351xBJTBpxkhUeHgSHo1ENwMV');
const TEST_PDA_SEED = 'test-pda';

interface CounterProps {
  programId?: PublicKey;
}

// Define a minimal interface for the Counter account
interface CounterAccount {
  count: anchor.BN;
}

export function Counter() {
  const [count, setCount] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const wallet = useAnchorWallet();
  const { connection } = useConnection();

  // Setup program and provider
  const getProgram = () => {
    if (!wallet) return null;
    
    const provider = new anchor.AnchorProvider(
      connection,
      wallet,
      { commitment: 'processed' }
    );
    
    return new Program(programIDL as Idl, provider);
  };

  // Get the counter PDA
  const getCounterPDA = async (program: anchor.Program | null) => {
    if (!program) return null;
    
    const [counterPDA] = PublicKey.findProgramAddressSync(
      [Buffer.from(TEST_PDA_SEED)],
      program.programId
    );
    
    return counterPDA;
  };

  // Fetch the current count
  const fetchCount = async () => {
    try {
      const program = getProgram();
      if (!program) return;
      
      const counterPDA = await getCounterPDA(program);
      if (!counterPDA) return;
      
      // @ts-expect-error - Using generic fetch until we have IDL
      const account = await program.account.counter.fetch(counterPDA) as CounterAccount;
      setCount(account.count.toNumber());
      setInitialized(true);
    } catch (error) {
      console.error('Error fetching count:', error);
      setInitialized(false);
    }
  };

  // Initialize the counter
  const initialize = async () => {
    try {
      setLoading(true);
      const program = getProgram();
      if (!program) return;
      
      const counterPDA = await getCounterPDA(program);
      if (!counterPDA) return;
      
      const userPublicKey = wallet?.publicKey;
      if (!userPublicKey) return;
      
      await program.methods
        .initialize()
        .accounts({
          counter: counterPDA,
          user: userPublicKey,
          systemProgram: anchor.web3.SystemProgram.programId,
        })
        .rpc();
      
      // Call delegate after initialization
      await program.methods
        .delegate()
        .accounts({
          payer: userPublicKey,
          pda: counterPDA,
        })
        .rpc();
      
      setInitialized(true);
      await fetchCount();
    } catch (error) {
      console.error('Error initializing counter:', error);
    } finally {
      setLoading(false);
    }
  };

  // Increment the counter
  const increment = async () => {
    try {
      setLoading(true);
      const program = getProgram();
      if (!program) return;
      
      const counterPDA = await getCounterPDA(program);
      if (!counterPDA) return;
      
      await program.methods
        .increment()
        .accounts({
          counter: counterPDA,
        })
        .rpc();
      
      await fetchCount();
    } catch (error) {
      console.error('Error incrementing counter:', error);
    } finally {
      setLoading(false);
    }
  };

  // Decrement the counter (this is a custom implementation as the contract doesn't have a decrement function)
  // We'll implement this by incrementing it multiple times until it wraps around to the desired value
  const decrement = async () => {
    if (count === null || count === 0) return;
    
    try {
      setLoading(true);
      const program = getProgram();
      if (!program) return;
      
      const counterPDA = await getCounterPDA(program);
      if (!counterPDA) return;
      
      // We know from the contract that if count > 1000, it resets to 0
      // So we can increment it until it wraps back around to count - 1
      const incrementsNeeded = count === 0 ? 1000 : 1000 - count + 1;
      
      // This is not efficient but demonstrates the concept
      for (let i = 0; i < incrementsNeeded; i++) {
        await program.methods
          .increment()
          .accounts({
            counter: counterPDA,
          })
          .rpc();
      }
      
      await fetchCount();
    } catch (error) {
      console.error('Error decrementing counter:', error);
    } finally {
      setLoading(false);
    }
  };

  // Effect to load the counter when wallet connects
  useEffect(() => {
    if (wallet) {
      fetchCount();
    }
  }, [wallet, connection]);

  if (!wallet) {
    return <div className="counter-container">Please connect your wallet to continue</div>;
  }

  return (
    <div className="counter-container">
      <h2>Solana Counter</h2>
      
      {!initialized ? (
        <div>
          <p>Counter needs to be initialized</p>
          <button 
            onClick={initialize} 
            disabled={loading || !wallet}
            className="btn btn-primary"
          >
            {loading ? 'Initializing...' : 'Initialize Counter'}
          </button>
        </div>
      ) : (
        <div className="counter">
          <div className="count-display">{count !== null ? count : 'Loading...'}</div>
          <div className="counter-controls">
            <button 
              onClick={decrement} 
              disabled={loading || !wallet || count === 0}
              className="btn btn-secondary"
            >
              -
            </button>
            <button 
              onClick={increment} 
              disabled={loading || !wallet}
              className="btn btn-primary"
            >
              +
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 