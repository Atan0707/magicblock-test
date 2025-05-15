# Solana Counter App

A simple React application that interacts with a Solana counter smart contract. This application demonstrates basic interactions with the Solana blockchain using the Anchor framework.

## Features

- Connect to a Solana wallet (Phantom)
- Initialize a counter PDA
- Increment the counter
- Decrement the counter (emulated through multiple increments due to contract limitations)

## Getting Started

### Prerequisites

- Node.js 16+
- Yarn or npm
- Solana CLI tools
- Phantom Wallet (or other compatible Solana wallet)

### Installation

1. Clone the repository
2. Install dependencies:

```bash
cd app
yarn install
```

### Running the Development Server

```bash
yarn dev
```

This will start a development server at http://localhost:5173 (or another port if 5173 is in use).

## How It Works

This application interacts with a Solana smart contract built using the Anchor framework. The contract maintains a counter that can be incremented. The decrement functionality is emulated client-side by incrementing until wrapping around.

### Key Files

- `src/App.tsx`: Main application component with wallet connection setup
- `src/components/Counter.tsx`: Counter component that interacts with the Solana contract
- `programs/magicblock-test/src/lib.rs`: The Solana smart contract (Anchor program)

## Contract Details

The contract defines a PDA (Program Derived Address) that stores a counter value. Key functions include:

- `initialize`: Sets up the counter with an initial value of 0
- `increment`: Increments the counter by 1 (wraps to 0 after 1000)

## Development Notes

- The IDL for the contract is not included, so there are some type assertions in the code
- The decrement function is simulated client-side by incrementing until wrap-around
- The app is configured to connect to Solana's devnet by default
