# URL Shortener x402 🔗

A decentralized URL shortener that uses the x402 payment protocol for micropayments and stores URLs on the Ethereum blockchain.

## Features ✨

- **Decentralized Storage**: URLs stored permanently on Ethereum Sepolia
- **x402 Payments**: Micropayments handled via x402 protocol on Base Sepolia
- **Custom URLs**: Create custom short codes (premium feature)
- **Analytics**: Track click counts for your shortened URLs
- **Wallet Integration**: Connect with MetaMask or any EVM wallet

## Tech Stack 🛠

- **Frontend**: Next.js 14, TypeScript, TailwindCSS
- **Blockchain**: Solidity smart contracts on Ethereum Sepolia
- **Payments**: x402 protocol on Base Sepolia
- **Wallet**: RainbowKit, wagmi, viem

## Quick Start 🚀

### 1. Install Dependencies

```bash
pnpm install
```

### 2. Deploy Smart Contract

Deploy `contracts/URLStorage_x402.sol` to Ethereum Sepolia using Remix IDE.

### 3. Configure Environment

Create `.env.local` file:

```env
NEXT_PUBLIC_CONTRACT_ADDRESS=<your_deployed_contract>
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
SERVER_PRIVATE_KEY=<authorized_server_wallet_key>
X402_PAYMENT_ADDRESS=<your_payment_receiver_address>
```

### 4. Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the application.

## Pricing 💰

- **Standard URL**: $0.001 (paid in USDC on Base Sepolia)
- **Custom URL**: $0.002 (2x standard price)
- **Analytics**: $0.0001 per query

## How It Works 🔄

1. User connects their wallet
2. User enters a URL to shorten
3. x402 middleware handles payment (HTTP 402)
4. User approves micropayment in their wallet
5. URL is stored on-chain
6. User receives shortened URL

## Networks 🌐

- **Payments**: Base Sepolia (Chain ID: 84532)
- **Storage**: Ethereum Sepolia (Chain ID: 11155111)
- **Facilitator**: https://x402.org/facilitator

## Project Structure 📁

```
url_x402/
├── contracts/           # Solidity smart contracts
├── src/
│   ├── app/            # Next.js app router
│   ├── components/     # React components
│   ├── hooks/          # Custom React hooks
│   ├── lib/            # Utilities and configs
│   └── middleware.ts   # x402 payment middleware
├── public/             # Static assets
└── DEPLOYMENT_COMPLETE.md  # Detailed deployment guide
```

## Documentation 📚

- [Full Deployment Guide](./DEPLOYMENT_COMPLETE.md)
- [x402 Protocol Documentation](https://x402.org)
- [x402 GitHub](https://github.com/coinbase/x402)

## License 📄

MIT