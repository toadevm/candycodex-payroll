# CandyCodex Payroll 🍭

Professional blockchain-based payroll management system built with Next.js, wagmi, and Reown AppKit.

## Features

- 💼 **Employee Management** - Add, remove, update, pause, and resume employees
- 💰 **Payment Execution** - Execute single, batch, or all eligible payments
- 💵 **Fund Management** - Deposit and withdraw ETH and ERC20 tokens
- 🔔 **Real-time Events** - Live notifications for all contract events
- 🎨 **Modern UI** - Compact, professional design with responsive layout
- 🔐 **Secure** - Owner-only controls with proper access management

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Web3**: wagmi v2, viem, Reown AppKit (WalletConnect)
- **Smart Contract**: Solidity 0.8.20, OpenZeppelin
- **Styling**: Tailwind CSS
- **Deployment**: Vercel

## Deployment to Vercel

### Quick Deploy

1. Push this repo to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Click "New Project"
4. Import your GitHub repository
5. Configure environment variables (see below)
6. Deploy!

### Environment Variables for Vercel

Add these in Vercel project settings:

```
NEXT_PUBLIC_REOWN_PROJECT_ID=b0db8a0e9feaf59699896d7c7bfa4c5f
NEXT_PUBLIC_CONTRACT_ADDRESS_SEPOLIA=0x386C10D7E4d76483896614FA912B477c08eEF17E
NEXT_PUBLIC_ENABLE_ANALYTICS=false
```

## Development

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Open http://localhost:3000
```

## Smart Contract

The AutomatedPayroll contract is deployed on:
- **Sepolia Testnet**: `0x386C10D7E4d76483896614FA912B477c08eEF17E`

## Usage

1. **Connect Wallet** - Click the connect button in the header
2. **Add Employee** - Enter employee address, payment amount, and interval
3. **Execute Payments** - Pay eligible employees individually or in batch
4. **Manage Funds** - Deposit ETH or tokens to fund payroll
5. **Monitor Events** - Real-time notifications for all contract activities

---

© 2025 Candy Codex. All rights reserved.
