import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fix webpack bundling conflicts for Netlify
  webpack: (config, { isServer }) => {
    // Externalize problematic packages to avoid bundling issues
    config.externals.push('pino-pretty', 'lokijs', 'encoding');
    
    // Fix crypto library bundling for browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
      };
    }
    
    // Optimize chunk splitting to avoid duplicate module declarations
    config.optimization = {
      ...config.optimization,
      moduleIds: 'deterministic',
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: false,
          vendors: false,
          // Vendor chunk for node_modules
          vendor: {
            name: 'vendor',
            chunks: 'all',
            test: /node_modules/,
            priority: 20
          },
          // Common chunk for shared code
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 10,
            reuseExistingChunk: true,
            enforce: true
          }
        }
      }
    };
    
    return config;
  },
  
  // Optimize package imports for better bundling
  experimental: {
    optimizePackageImports: ['lucide-react', '@rainbow-me/rainbowkit'],
  },
  
  // Acknowledge Turbopack usage (Next.js 16 default)
  // Webpack config above is kept for fallback compatibility
  turbopack: {},
  
  // Ensure proper CSS handling
  sassOptions: undefined,
};

export default nextConfig;
