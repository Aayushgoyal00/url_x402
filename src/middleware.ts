import { paymentMiddleware } from 'x402-next';

// Configure the x402 payment middleware
export const middleware = paymentMiddleware(
  (process.env.X402_PAYMENT_ADDRESS || "0x0000000000000000000000000000000000000000") as `0x${string}`, // Your receiving wallet address
  {
    // Protected routes with their pricing
    '/api/shorten': {
      price: '$0.001', // $0.001 per URL shortening
      network: 'base-sepolia', // Using Base Sepolia testnet
      config: {
        description: 'Create a shortened URL',
        maxTimeoutSeconds: 60,
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
    '/api/shorten/custom': {
      price: '$0.002', // Double price for custom URLs
      network: 'base-sepolia',
      config: {
        description: 'Create a custom shortened URL',
        maxTimeoutSeconds: 60,
        mimeType: 'application/json',
      }
    },
    '/api/analytics/[shortCode]': {
      price: '$0.0001', // Small fee for analytics
      network: 'base-sepolia',
      config: {
        description: 'Get analytics for a shortened URL',
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
