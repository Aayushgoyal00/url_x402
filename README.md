# URLx402 - Blockchain URL Shortener

A decentralized URL shortener powered by x402 micropayments and blockchain storage on Base Sepolia.

## ✨ Features

- 🔗 **URL Shortening** - Pay $0.001 USDC to create shortened URLs
- 🔍 **URL Lookup** - Free blockchain-based URL retrieval
- 💳 **x402 Payments** - Seamless crypto micropayments via MetaMask
- ⛓️ **On-Chain Storage** - Permanent URLs stored on Base Sepolia

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ and pnpm
- MetaMask with Base Sepolia network
- Base Sepolia USDC for payments
- Base Sepolia ETH for gas fees

### Installation

```bash
# Install dependencies
pnpm install

# Copy environment template
cp env.template .env.local
```

### Configuration

Edit `.env.local`:

```env
# Your deployed contract address on Base Sepolia
NEXT_PUBLIC_CONTRACT_ADDRESS=0xYourContractAddress

# Base Sepolia RPC URL
NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL=https://sepolia.base.org

# Server wallet private key (for contract interaction)
SERVER_PRIVATE_KEY=0xYourPrivateKey

# Payment receiver address (must be NEXT_PUBLIC_ for middleware)
NEXT_PUBLIC_X402_PAYMENT_ADDRESS=0xYourPaymentAddress

# App configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_CHAIN_ID=84532
```

### Deploy Smart Contract

1. Open [Remix IDE](https://remix.ethereum.org)
2. Upload `contracts/URLStorage_x402.sol`
3. Compile with Solidity 0.8.24
4. Deploy to **Base Sepolia** testnet
5. Authorize your server wallet:
   ```solidity
   setServerAuthorization(yourServerAddress, true)
   ```

### Run Development Server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎯 How It Works

### Shorten URL (Paid)
1. Connect your MetaMask wallet
2. Enter a URL to shorten
3. Approve $0.001 USDC payment
4. Get your shortened URL instantly

### Lookup URL (Free)
1. Enter any short code
2. Retrieve original URL from blockchain
3. View creator and creation date

## 💰 Pricing

| Feature | Cost | Network |
|---------|------|---------|
| Standard URL | $0.001 USDC | Base Sepolia |
| URL Lookup | Free | Base Sepolia |



## 📚 Resources

- [x402 Documentation](https://x402.org)
- [Base Sepolia Explorer](https://sepolia.basescan.org)
- [x402 GitHub](https://github.com/coinbase/x402)

## 🤝 Contributing

Contributions are welcome! This is a testnet project demonstrating x402 micropayment capabilities.

## 🙏 Acknowledgments

Built with [x402 Protocol](https://x402.org) by Coinbase for seamless HTTP 402 payments.

---

**Note**: This is a testnet application. All transactions use test tokens with no real value.
