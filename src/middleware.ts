import { paymentMiddleware } from 'x402-next';

// Log the payment address for debugging (remove in production)
console.log('NEXT_PUBLIC_X402_PAYMENT_ADDRESS:', process.env.NEXT_PUBLIC_X402_PAYMENT_ADDRESS || 'NOT SET');

// Configure the x402 payment middleware
export const middleware = paymentMiddleware(
  (process.env.NEXT_PUBLIC_X402_PAYMENT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`, // Your receiving wallet address
  {
    // Protected routes with their pricing
    '/api/shorten': {
      price: '$0.001', // $0.001 per URL shortening
      network: 'base-sepolia', // Using Base Sepolia testnet
      config: {
        description: 'Create a shortened URL',
        maxTimeoutSeconds: 120, // Increased timeout
        mimeType: 'application/json',
        outputSchema: {
          type: 'object',
          properties: {
            shortUrl: { type: 'string' },
            shortCode: { type: 'string' },
            originalUrl: { type: 'string' },
            message: { type: 'string' }
          }
        }
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
    url: "https://x402.org/facilitator", // x402 facilitator for Base Sepolia testnet
  }
);

// Configure which paths the middleware should run on
export const config = {
  matcher: [
    '/api/shorten/:path*',
    '/api/analytics/:path*',
  ]
};
