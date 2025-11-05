// Contract configuration and ABIs

export const CONTRACT_ADDRESS = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '';
export const BASE_SEPOLIA_RPC_URL = process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org';

// URLStorage contract ABI (minimalist version for x402 integration)
export const URL_STORAGE_ABI = [
  // Write functions (require authorization)
  "function createShortUrl(string memory _originalUrl, address _creator, string memory _shortCode) external returns (bool)",
  
  // Read functions (public)
  "function getOriginalUrl(string memory _shortCode) external view returns (string memory)",
  "function getUrlRecord(string memory _shortCode) external view returns (string memory, address, uint256)",
  "function isShortCodeTaken(string memory _shortCode) external view returns (bool)",
  "function getStats() external view returns (uint256, address)",
  
  // Admin functions
  "function setServerAuthorization(address _server, bool _authorized) external",
  "function transferOwnership(address newOwner) external",
  
  // State variables (public getters)
  "function owner() external view returns (address)",
  "function authorizedServers(address) external view returns (bool)",
  "function shortUrlCounter() external view returns (uint256)",
  "function totalUrlsCreated() external view returns (uint256)",
  
  // Events
  "event URLCreated(string indexed shortCode, string originalUrl, address indexed creator, address indexed server, uint256 timestamp)",
  "event ServerAuthorized(address indexed server, bool authorized)",
  "event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)",
] as const;

// Network configuration
export const NETWORK_CONFIG = {
  baseSepolia: {
    chainId: 84532,
    name: 'Base Sepolia',
    rpcUrl: BASE_SEPOLIA_RPC_URL,
    blockExplorer: 'https://sepolia.basescan.org',
    nativeCurrency: {
      name: 'ETH',
      symbol: 'ETH',
      decimals: 18
    }
  }
} as const;

// x402 Configuration
export const X402_CONFIG = {
  facilitatorUrl: 'https://x402.org/facilitator',
  network: 'base-sepolia', // Using Base Sepolia for x402 payments
  prices: {
    standard: '$0.001',
    custom: '$0.002',
    analytics: '$0.0001'
  },
  paymentAddress: process.env.NEXT_PUBLIC_X402_PAYMENT_ADDRESS || '0x0000000000000000000000000000000000000000'
} as const;

// Helper function to format addresses
export function formatAddress(address: string): string {
  if (!address) return '';
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

// Helper function to validate Ethereum address
export function isValidAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}
