'use client';

import { ConnectButton } from '@rainbow-me/rainbowkit';
import URLShortener from '@/components/URLShortener';
import { Github, Globe } from 'lucide-react';

export default function Home() {
  return (
    <div className="min-h-screen bg-linear-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Navigation */}
      <nav className="border-b border-gray-200 dark:border-gray-700 bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Globe className="w-8 h-8 text-blue-600" />
              <span className="text-xl font-bold text-gray-900 dark:text-white">
                URL<span className="text-blue-600">x402</span>
              </span>
            </div>
            
            <div className="flex items-center space-x-4">
              <a
                href="https://github.com/coinbase/x402"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white transition-colors"
              >
                <Github className="w-5 h-5" />
              </a>
              <ConnectButton />
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <URLShortener />

        {/* Info Section */}
        {/* <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              How it Works
            </h3>
            <ol className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li>1. Connect your wallet</li>
              <li>2. Enter your long URL</li>
              <li>3. x402 handles payment ($0.001)</li>
              <li>4. Get your shortened URL</li>
            </ol>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Network Information
            </h3>
            <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <p><strong>Payment:</strong> Base Sepolia</p>
              <p><strong>Storage:</strong> Ethereum Sepolia</p>
              <p><strong>Protocol:</strong> x402</p>
              <p><strong>Currency:</strong> USDC/ETH</p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm">
            <h3 className="text-lg font-semibold mb-3 text-gray-900 dark:text-white">
              Features
            </h3>
            <ul className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
              <li className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-green-500" />
                On-chain storage
              </li>
              <li className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-green-500" />
                Permanent URLs
              </li>
              <li className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-green-500" />
                Click analytics
              </li>
              <li className="flex items-center">
                <Shield className="w-4 h-4 mr-2 text-green-500" />
                Custom codes available
              </li>
            </ul>
          </div>
        </div> */}
      </main>

      {/* Footer */}
      {/* <footer className="mt-24 border-t border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-4 md:mb-0">
              © 2024 URLx402. Powered by x402 Protocol.
            </div>
            <div className="flex items-center space-x-6 text-sm">
              <a
                href="https://x402.org"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              >
                x402 Docs
              </a>
              <a
                href="https://sepolia.etherscan.io"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              >
                Etherscan
              </a>
              <a
                href="https://discord.gg/invite/cdp"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-600 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 transition-colors"
              >
                Discord
              </a>
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  );
}