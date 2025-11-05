import { paymentMiddleware } from 'x402-next';

// Configure the x402 payment middleware
export const middleware = paymentMiddleware(
  (process.env.NEXT_PUBLIC_X402_PAYMENT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`,
  {
    // Protected routes with their pricing
    '/api/shorten': {
      price: '$0.001', // $0.001 per URL shortening
      network: 'base-sepolia', // Using Base Sepolia testnet
      config: {
        description: 'Create a shortened URL',
        maxTimeoutSeconds: 120,
        mimeType: 'application/json',
      }
    },
    '/api/analytics/[shortCode]': {
      price: '$0.0001', // Small fee for analytics
      network: 'base-sepolia',
      config: {
        description: 'Get analytics for a shortened URL',
        maxTimeoutSeconds: 120,
        mimeType: 'application/json',
      }
    }
  },
  {
    url: "https://x402.org/facilitator",
  }
);

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/api/shorten/:path*',
    '/api/analytics/:path*',
  ]
};

