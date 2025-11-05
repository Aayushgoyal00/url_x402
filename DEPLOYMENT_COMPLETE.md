# 🚀 URL Shortener x402 - Complete Deployment Guide

## ✅ Project Setup Complete

Your URL shortener application with x402 payment integration is now ready! The application properly uses the x402 protocol for micropayments instead of building a custom payment system.

## 📦 What We've Built

### 1. **Smart Contract (`URLStorage_x402.sol`)**
   - Stores URLs on-chain (Ethereum Sepolia)
   - Handles URL creation, retrieval, and analytics
   - Authorization system for trusted servers
   - No payment logic (handled by x402)

### 2. **x402 Payment Integration**
   - Middleware configured for Next.js
   - Automatic HTTP 402 payment handling
   - Three payment tiers:
     - Standard URL: $0.001
     - Custom URL: $0.002
     - Analytics: $0.0001

### 3. **Frontend Application**
   - Next.js with TypeScript
   - RainbowKit wallet integration
   - Real-time payment processing via x402
   - Beautiful, responsive UI

## 🔧 Configuration Steps

### Step 1: Environment Variables

Create a `.env.local` file in the root directory:

```env
# Smart Contract Configuration (Ethereum Sepolia)
NEXT_PUBLIC_CONTRACT_ADDRESS=<YOUR_DEPLOYED_CONTRACT>
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
SERVER_PRIVATE_KEY=<YOUR_SERVER_PRIVATE_KEY>

# x402 Payment Configuration
X402_PAYMENT_ADDRESS=<YOUR_PAYMENT_RECEIVER_ADDRESS>

# Application
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CHAIN_ID=11155111

# Optional: WalletConnect
NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID=<YOUR_PROJECT_ID>
```

### Step 2: Deploy Smart Contract

1. **Via Remix IDE:**
   - Copy `contracts/URLStorage_x402.sol` to Remix
   - Compile with Solidity 0.8.24
   - Deploy to Ethereum Sepolia testnet
   - Copy the contract address

2. **Authorize Server Wallet:**
   - In Remix, call `setServerAuthorization()`
   - Pass your SERVER_PRIVATE_KEY's address
   - Set `authorized` to `true`

### Step 3: Install Dependencies

```bash
# If you haven't already
pnpm install
```

### Step 4: Run the Application

```bash
# Development mode
pnpm dev

# Production build
pnpm build
pnpm start
```

## 🌐 How x402 Works in This App

### Payment Flow:

1. **User Action**: User enters URL and clicks "Shorten"
2. **x402 Middleware**: Intercepts request, returns 402 Payment Required
3. **Frontend**: Automatically handles payment via wallet
4. **Payment Verification**: x402 verifies payment
5. **API Execution**: URL is stored in smart contract
6. **Result**: User receives shortened URL

### Key Components:

- **`src/middleware.ts`**: x402 payment configuration
- **`src/hooks/useX402Payment.ts`**: Payment handling hook
- **`src/app/api/shorten/route.ts`**: URL shortening API
- **`src/app/api/redirect/[shortCode]/route.ts`**: Redirect handler (free)

## 🧪 Testing the Application

### 1. Get Test Funds:
   - **Base Sepolia USDC**: For x402 payments
   - **Sepolia ETH**: For gas fees (contract interaction)

### 2. Test Flow:
   1. Connect wallet
   2. Enter a URL
   3. Approve payment ($0.001 in USDC)
   4. Receive shortened URL
   5. Test redirect functionality

### 3. Custom URLs:
   - Check "Use custom short code"
   - Enter desired code (3-20 alphanumeric)
   - Pay $0.002 (2x price)

## 📊 Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Frontend  │────▶│ x402 Middleware│────▶│   API Routes │
└─────────────┘     └──────────────┘     └─────────────┘
       │                    │                      │
       │              402 Payment             Smart Contract
       │               Required                 Interaction
       │                    │                      │
       ▼                    ▼                      ▼
┌─────────────┐     ┌──────────────┐     ┌─────────────┐
│   Wallet    │────▶│ x402 Facilitator│   │  URLStorage  │
└─────────────┘     └──────────────┘     └─────────────┘
```

## 🔗 Network Information

- **Payment Network**: Base Sepolia (Chain ID: 84532)
- **Storage Network**: Ethereum Sepolia (Chain ID: 11155111)
- **x402 Facilitator**: https://x402.org/facilitator

## 🛠️ Troubleshooting

### Common Issues:

1. **"Payment Required" Error**
   - Ensure wallet has USDC on Base Sepolia
   - Check wallet is connected

2. **"Failed to store URL"**
   - Verify SERVER_PRIVATE_KEY is authorized in contract
   - Check server wallet has ETH for gas

3. **"Contract not found"**
   - Verify NEXT_PUBLIC_CONTRACT_ADDRESS is correct
   - Ensure contract is deployed on Sepolia

## 📚 Additional Resources

- [x402 Documentation](https://x402.org)
- [x402 GitHub](https://github.com/coinbase/x402)
- [Discord Support](https://discord.gg/invite/cdp)

## 🎯 Next Steps

1. **Deploy to Production**:
   - Switch to mainnet networks
   - Update RPC URLs and chain IDs
   - Set production payment address

2. **Custom Features**:
   - Add QR code generation
   - Implement bulk URL shortening
   - Add advanced analytics

3. **Monitoring**:
   - Set up error tracking
   - Monitor payment success rates
   - Track URL creation metrics

## ✨ Success!

Your URL shortener with x402 payments is ready to use. The application properly integrates the x402 protocol for handling micropayments, ensuring a seamless payment experience for users.

**Remember**: x402 handles all payment complexity - you just need to configure the middleware and let it work its magic!
