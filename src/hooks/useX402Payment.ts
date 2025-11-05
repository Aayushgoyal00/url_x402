import { useState, useCallback } from 'react';
import { withPaymentInterceptor } from 'x402-axios';
import axios from 'axios';
import { useAccount } from 'wagmi';
import { createWalletClient, custom } from 'viem';
import { baseSepolia } from 'viem/chains';
import { toast } from 'sonner';

interface PaymentOptions {
  onSuccess?: (data: any) => void;
  onError?: (error: any) => void;
  onPaymentRequired?: (details: any) => void;
}

export function useX402Payment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<any>(null);
  const { address, isConnected } = useAccount();

  const makePaymentRequest = useCallback(async (
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    data?: any,
    options?: PaymentOptions
  ) => {
    if (!isConnected || !address) {
      const error = new Error('Please connect your wallet first');
      options?.onError?.(error);
      throw error;
    }

    setIsProcessing(true);
    
    try {
      // Create wallet client for signing
      const walletClient = createWalletClient({
        chain: baseSepolia, // x402 payments on Base Sepolia
        transport: custom(window.ethereum as any),
        account: address as `0x${string}`,
      });

      // Create axios instance with payment interceptor
      const api = withPaymentInterceptor(
        axios.create({
          baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        }),
        walletClient as any
      );

      let response;
      
      if (method === 'POST') {
        response = await api.post(endpoint, data);
      } else {
        response = await api.get(endpoint, { params: data });
      }

      // Extract payment information from response headers
      const paymentResponse = response.headers['x-payment-response'];
      if (paymentResponse) {
        const decodedPayment = JSON.parse(atob(paymentResponse));
        setPaymentDetails(decodedPayment);
      }

      options?.onSuccess?.(response.data);
      return response.data;

    } catch (error: any) {
      console.error('Payment request error:', error);
      
      // Check if it's a 402 Payment Required error
      if (error.response?.status === 402) {
        const paymentInfo = error.response.data;
        setPaymentDetails(paymentInfo);
        options?.onPaymentRequired?.(paymentInfo);
      } else {
        options?.onError?.(error);
      }
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, address]);

  const shortenUrl = useCallback(async (
    url: string,
    customCode?: string
  ) => {
    const endpoint = customCode ? '/api/shorten/custom' : '/api/shorten';
    const data = customCode ? { url, customCode } : { url };
    
    return makePaymentRequest(endpoint, 'POST', data, {
      onSuccess: (data) => {
        toast.success('URL shortened successfully!');
      },
      onError: (error) => {
        toast.error(error.response?.data?.error || 'Failed to shorten URL');
      },
      onPaymentRequired: (details) => {
        toast.info('Payment required: ' + details.price);
      }
    });
  }, [makePaymentRequest]);

  const getAnalytics = useCallback(async (shortCode: string) => {
    return makePaymentRequest(`/api/analytics/${shortCode}`, 'GET', undefined, {
      onSuccess: (data) => {
        toast.success('Analytics retrieved');
      },
      onError: (error) => {
        toast.error('Failed to get analytics');
      },
      onPaymentRequired: (details) => {
        toast.info('Analytics require payment: ' + details.price);
      }
    });
  }, [makePaymentRequest]);

  return {
    isProcessing,
    paymentDetails,
    makePaymentRequest,
    shortenUrl,
    getAnalytics,
  };
}
