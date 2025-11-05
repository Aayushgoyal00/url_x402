'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useAccount } from 'wagmi';
import { Link2, Copy, ExternalLink, Loader2, Shield, BarChart3 } from 'lucide-react';
import { toast } from 'sonner';
import { useX402Payment } from '@/hooks/useX402Payment';
import { isValidUrl, isValidShortCode, copyToClipboard } from '@/lib/utils';
import { cn } from '@/lib/utils';

interface FormData {
  url: string;
  customCode?: string;
}

interface ShortenUrlResponse {
  success: boolean;
  shortUrl: string;
  shortCode: string;
  originalUrl: string;
  message?: string;
}

export default function URLShortener() {
  const [shortenedUrl, setShortenedUrl] = useState<string>('');
  const [shortCode, setShortCode] = useState<string>('');
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const { isConnected } = useAccount();
  const { shortenUrl, isProcessing } = useX402Payment();
  
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    if (!isConnected) {
      toast.error('Please connect your wallet first');
      return;
    }

    try {
      const result = await shortenUrl(data.url, data.customCode) as ShortenUrlResponse;
      if (result.success) {
        setShortenedUrl(result.shortUrl);
        setShortCode(result.shortCode);
        reset();
      }
    } catch (error) {
      console.error('Error shortening URL:', error);
    }
  };

  const handleCopy = async () => {
    if (await copyToClipboard(shortenedUrl)) {
      setCopied(true);
      toast.success('Copied to clipboard!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          URL Shortener with x402
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Pay with crypto to create short, memorable links
        </p>
      </div>

      {/* Features
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <Zap className="w-8 h-8 text-yellow-500" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Instant Creation</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">$0.001 per URL</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <Shield className="w-8 h-8 text-green-500" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">On-Chain Storage</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Permanent & Secure</p>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
          <BarChart3 className="w-8 h-8 text-blue-500" />
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white">Analytics</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">Track clicks</p>
          </div>
        </div>
      </div> */}

      {/* Main Form */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 mb-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Enter your long URL
            </label>
            <input
              {...register('url', {
                required: 'URL is required',
                validate: (value) => isValidUrl(value) || 'Please enter a valid URL'
              })}
              type="text"
              placeholder="https://example.com/very-long-url-that-needs-shortening"
              className={cn(
                "w-full px-4 py-3 rounded-lg border transition-colors",
                "bg-white dark:bg-gray-900 text-gray-900 dark:text-white",
                "border-gray-300 dark:border-gray-600",
                "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                "placeholder-gray-400 dark:placeholder-gray-500",
                errors.url && "border-red-500"
              )}
            />
            {errors.url && (
              <p className="mt-1 text-sm text-red-600">{errors.url.message}</p>
            )}
          </div>

          {/* Custom Code Toggle */}
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="customMode"
              checked={isCustomMode}
              onChange={(e) => setIsCustomMode(e.target.checked)}
              className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
            />
            <label htmlFor="customMode" className="text-sm text-gray-700 dark:text-gray-300">
              Use custom short code (2x price: $0.002)
            </label>
          </div>

          {/* Custom Code Input */}
          {isCustomMode && (
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Custom short code
              </label>
              <input
                {...register('customCode', {
                  validate: (value) => {
                    if (!isCustomMode) return true;
                    if (!value) return 'Custom code is required when enabled';
                    return isValidShortCode(value) || 'Must be 3-20 alphanumeric characters';
                  }
                })}
                type="text"
                placeholder="my-custom-link"
                className={cn(
                  "w-full px-4 py-3 rounded-lg border transition-colors",
                  "bg-white dark:bg-gray-900 text-gray-900 dark:text-white",
                  "border-gray-300 dark:border-gray-600",
                  "focus:ring-2 focus:ring-blue-500 focus:border-transparent",
                  "placeholder-gray-400 dark:placeholder-gray-500",
                  errors.customCode && "border-red-500"
                )}
              />
              {errors.customCode && (
                <p className="mt-1 text-sm text-red-600">{errors.customCode.message}</p>
              )}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isProcessing || !isConnected}
            className={cn(
              "w-full py-3 px-4 rounded-lg font-semibold transition-all",
              "bg-linear-to-r from-blue-600 to-indigo-600",
              "hover:from-blue-700 hover:to-indigo-700",
              "text-white shadow-lg hover:shadow-xl",
              "disabled:opacity-50 disabled:cursor-not-allowed",
              "flex items-center justify-center space-x-2"
            )}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Processing payment...</span>
              </>
            ) : (
              <>
                <Link2 className="w-5 h-5" />
                <span>
                  {isConnected 
                    ? `Shorten URL (${isCustomMode ? '$0.002' : '$0.001'})`
                    : 'Connect Wallet to Continue'
                  }
                </span>
              </>
            )}
          </button>
        </form>

        {/* x402 Badge */}
        <div className="mt-4 flex items-center justify-center text-sm text-gray-500 dark:text-gray-400">
          <Shield className="w-4 h-4 mr-1" />
          Powered by x402 Protocol
        </div>
      </div>

      {/* Result Display */}
      {shortenedUrl && (
        <div className="bg-linear-to-r from-blue-50 to-indigo-50 dark:from-gray-800 dark:to-gray-700 rounded-xl p-6 animate-fadeIn">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              Your shortened URL is ready!
            </h3>
            <span className="px-3 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200 rounded-full text-sm font-medium">
              Success
            </span>
          </div>
          
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <a
                href={shortenedUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium flex items-center space-x-2"
              >
                <span>{shortenedUrl}</span>
                <ExternalLink className="w-4 h-4" />
              </a>
              <button
                onClick={handleCopy}
                className={cn(
                  "px-4 py-2 rounded-lg transition-all",
                  "bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700",
                  "text-gray-700 dark:text-gray-300",
                  "flex items-center space-x-2",
                  copied && "bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300"
                )}
              >
                <Copy className="w-4 h-4" />
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
            <span>Short code: <code className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">{shortCode}</code></span>
            <a
              href={`/analytics/${shortCode}`}
              className="text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
            >
              <BarChart3 className="w-4 h-4" />
              <span>View Analytics</span>
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
