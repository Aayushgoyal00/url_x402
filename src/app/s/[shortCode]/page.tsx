'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';

export default function RedirectPage() {
  const params = useParams();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const shortCode = params.shortCode as string;

  useEffect(() => {
    if (!shortCode) {
      setError('Invalid short code');
      return;
    }

    const redirect = async () => {
      try {
        // Call API to get original URL
        const response = await fetch(`/api/redirect/${shortCode}`);
        
        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'URL not found');
        }

        const data = await response.json();
        setOriginalUrl(data.originalUrl);
        
        // Perform the redirect
        window.location.href = data.originalUrl;
      } catch (err: any) {
        console.error('Redirect error:', err);
        setError(err.message || 'Failed to redirect');
      }
    };

    redirect();
  }, [shortCode]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
        <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl max-w-md w-full">
          <div className="text-center">
            <div className="text-red-500 mb-4">
              <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              URL Not Found
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              {error}
            </p>
            <button
              onClick={() => router.push('/')}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Go Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-xl">
        <div className="flex flex-col items-center space-y-4">
          <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Redirecting...
          </h2>
          {originalUrl && (
            <p className="text-sm text-gray-600 dark:text-gray-400 text-center max-w-xs truncate">
              Taking you to: {originalUrl}
            </p>
          )}
          <p className="text-xs text-gray-500 dark:text-gray-500">
            If you are not redirected, 
            <a href={originalUrl || '#'} className="text-blue-600 hover:underline ml-1">
              click here
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}
