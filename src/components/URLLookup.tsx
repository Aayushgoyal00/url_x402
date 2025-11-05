'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Search, ExternalLink, Loader2, Clock, User } from 'lucide-react';
import { toast } from 'sonner';
import { ethers } from 'ethers';
import { BASE_SEPOLIA_RPC_URL, CONTRACT_ADDRESS, URL_STORAGE_ABI } from '@/lib/contracts';

interface LookupFormData {
  shortCode: string;
}

interface URLRecord {
  originalUrl: string;
  creator: string;
  createdAt: Date;
  exists: boolean;
}

export default function URLLookup() {
  const [urlRecord, setUrlRecord] = useState<URLRecord | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm<LookupFormData>();

  const lookupShortCode = async (data: LookupFormData) => {
    const { shortCode } = data;

    if (!shortCode || shortCode.trim().length === 0) {
      toast.error('Please enter a short code');
      return;
    }

    setIsSearching(true);
    setUrlRecord(null);

    try {
      // Connect to smart contract (read-only)
      const provider = new ethers.JsonRpcProvider(BASE_SEPOLIA_RPC_URL);
      const contract = new ethers.Contract(
        CONTRACT_ADDRESS,
        URL_STORAGE_ABI,
        provider
      );

      console.log('Checking if short code exists:', shortCode);

      // First check if the short code exists
      const exists = await contract.isShortCodeTaken(shortCode.trim());
      
      console.log('Short code exists:', exists);

      if (!exists) {
        toast.error('Short code not found!');
        setUrlRecord({
          originalUrl: '',
          creator: '',
          createdAt: new Date(),
          exists: false
        });
        setIsSearching(false);
        return;
      }

      // Get the URL record
      console.log('Fetching URL record...');
      const [originalUrl, creator, createdAtTimestamp] = await contract.getUrlRecord(shortCode.trim());

      console.log('URL Record:', { originalUrl, creator, createdAtTimestamp });

      if (!originalUrl || originalUrl === '') {
        toast.error('URL not found or has been deleted');
        setUrlRecord({
          originalUrl: '',
          creator: '',
          createdAt: new Date(),
          exists: false
        });
        setIsSearching(false);
        return;
      }

      const createdAt = new Date(Number(createdAtTimestamp) * 1000);

      setUrlRecord({
        originalUrl,
        creator,
        createdAt,
        exists: true
      });

      toast.success('URL found successfully!');

    } catch (error) {
      console.error('Error looking up short code:', error);
      
      if (error instanceof Error) {
        if (error.message.includes('URL not found')) {
          toast.error('This short code does not exist');
        } else {
          toast.error('Failed to lookup short code. Please try again.');
        }
      } else {
        toast.error('An unexpected error occurred');
      }

      setUrlRecord(null);
    } finally {
      setIsSearching(false);
    }
  };

  const openUrl = (url: string) => {
    if (url) {
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  const formatAddress = (address: string) => {
    if (!address) return '';
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold bg-linear-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
          URL Lookup
        </h1>
        <p className="text-gray-600 dark:text-gray-400 text-lg">
          Enter a short code to retrieve the original URL from the blockchain
        </p>
      </div>

      {/* Lookup Form */}
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8 mb-8">
        <form onSubmit={handleSubmit(lookupShortCode)} className="space-y-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <input
                {...register('shortCode', {
                  required: 'Short code is required',
                  minLength: {
                    value: 3,
                    message: 'Short code must be at least 3 characters'
                  },
                  maxLength: {
                    value: 20,
                    message: 'Short code must be less than 20 characters'
                  },
                  pattern: {
                    value: /^[a-zA-Z0-9-_]+$/,
                    message: 'Short code can only contain letters, numbers, hyphens, and underscores'
                  }
                })}
                type="text"
                placeholder="Enter short code (e.g., abc123)"
                className="w-full px-6 py-4 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all text-gray-900 dark:text-white placeholder-gray-400"
                disabled={isSearching}
              />
              {errors.shortCode && (
                <p className="text-red-500 text-sm mt-2">{errors.shortCode.message}</p>
              )}
            </div>
            
            <button
              type="submit"
              disabled={isSearching}
              className="px-8 py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 whitespace-nowrap shadow-lg"
            >
              {isSearching ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Searching...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Lookup
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      {urlRecord && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {urlRecord.exists ? (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <div className="flex items-start justify-between mb-6">
                <h3 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  URL Found
                </h3>
              </div>

              {/* Original URL */}
              <div className="mb-6">
                <label className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 block">
                  Original URL:
                </label>
                <div className="flex items-center gap-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex-1 break-all text-gray-900 dark:text-white font-mono text-sm">
                    {urlRecord.originalUrl}
                  </div>
                  <button
                    onClick={() => openUrl(urlRecord.originalUrl)}
                    className="p-2 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors shrink-0"
                    title="Open URL"
                  >
                    <ExternalLink className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                  </button>
                </div>
              </div>

              {/* Metadata */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                {/* Creator */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                    <User className="w-4 h-4" />
                    <span className="text-sm font-semibold">Created By:</span>
                  </div>
                  <a
                    href={`https://sepolia.basescan.org/address/${urlRecord.creator}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-mono text-sm hover:underline"
                  >
                    {formatAddress(urlRecord.creator)}
                  </a>
                </div>

                {/* Created At */}
                <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-xl border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 mb-2">
                    <Clock className="w-4 h-4" />
                    <span className="text-sm font-semibold">Created On:</span>
                  </div>
                  <p className="text-gray-900 dark:text-white text-sm">
                    {formatDate(urlRecord.createdAt)}
                  </p>
                </div>
              </div>

              {/* Action Button */}
              <button
                onClick={() => openUrl(urlRecord.originalUrl)}
                className="w-full py-4 bg-linear-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-semibold hover:from-blue-700 hover:to-indigo-700 focus:ring-4 focus:ring-blue-200 transition-all flex items-center justify-center gap-2 shadow-lg"
              >
                <ExternalLink className="w-5 h-5" />
                Visit Original URL
              </button>
            </div>
          ) : (
            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-8">
              <div className="text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-red-100 dark:bg-red-900/30 rounded-full mb-4">
                  <Search className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  Short Code Not Found
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  This short code does not exist in the blockchain. Please check the code and try again.
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-linear-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 rounded-xl p-6 border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <span className="font-semibold">💡 Tip:</span> This lookup is completely free! 
          We are reading directly from the blockchain without requiring any payment.
        </p>
      </div>
    </div>
  );
}

