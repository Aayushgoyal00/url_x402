import { useState, useCallback } from 'react';
import { withPaymentInterceptor } from 'x402-axios';
import axios from 'axios';
import { useAccount, useSwitchChain } from 'wagmi';
import { createWalletClient, custom } from 'viem';
import { baseSepolia } from 'viem/chains';
import { toast } from 'sonner';

interface PaymentInfo {
  price: string;
  network: string;
  recipient: string;
  [key: string]: unknown;
}

interface PaymentOptions<T = unknown> {
  onSuccess?: (data: T) => void;
  onError?: (error: Error | unknown) => void;
  onPaymentRequired?: (details: PaymentInfo) => void;
}

export function useX402Payment() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState<PaymentInfo | null>(null);
  const { address, isConnected, chain } = useAccount();
  const { switchChainAsync } = useSwitchChain();

  const makePaymentRequest = useCallback(async <T = unknown>(
    endpoint: string,
    method: 'GET' | 'POST' = 'POST',
    data?: unknown,
    options?: PaymentOptions<T>
  ): Promise<T> => {
    if (!isConnected || !address) {
      const error = new Error('Please connect your wallet first');
      toast.error('Please connect your wallet first');
      options?.onError?.(error);
      throw error;
    }

    // Check if user is on Base Sepolia network (chain ID: 84532)
    if (chain?.id !== baseSepolia.id) {
      toast.warning('Switching to Base Sepolia network for payment...', { duration: 3000 });
      try {
        await switchChainAsync?.({ chainId: baseSepolia.id });
        toast.success('Network switched successfully!', { duration: 2000 });
      } catch {
        const error = new Error('Please switch to Base Sepolia network to make payments');
        toast.error('Please switch to Base Sepolia network in your wallet');
        options?.onError?.(error);
        throw error;
      }
    }

    // Check if MetaMask/wallet is available
    if (typeof window === 'undefined' || !window.ethereum) {
      const error = new Error('No Ethereum wallet detected. Please install MetaMask.');
      toast.error('No wallet detected. Please install MetaMask.');
      options?.onError?.(error);
      throw error;
    }

    setIsProcessing(true);
    toast.info('Preparing payment request...', { duration: 2000 });
    
    console.log('Creating wallet client for address:', address);
    console.log('Chain:', baseSepolia);
    
    try {
      // Create wallet client for signing
      const walletClient = createWalletClient({
        chain: baseSepolia, // x402 payments on Base Sepolia
        transport: custom(window.ethereum as never),
        account: address as `0x${string}`,
      });
      
      console.log('Wallet client created successfully');

      // Create axios instance with payment interceptor
      const api = withPaymentInterceptor(
        axios.create({
          baseURL: process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        }),
        walletClient as unknown as Parameters<typeof withPaymentInterceptor>[1]
      );

      toast.info('Processing payment... Please check your wallet', { duration: 3000 });
      
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
        toast.success('Payment completed!', { duration: 2000 });
      }

      options?.onSuccess?.(response.data);
      return response.data;

    } catch (error) {
      console.error('Payment request error:', error);
      console.error('Error details:', axios.isAxiosError(error) ? {
        status: error.response?.status,
        data: error.response?.data,
        headers: error.response?.headers,
        message: error.message,
        code: error.code
      } : error);
      
      // Check if it's a 402 Payment Required error
      if (axios.isAxiosError(error) && error.response?.status === 402) {
        const paymentInfo = error.response.data;
        console.log('402 Payment Required - Payment Info:', paymentInfo);
        setPaymentDetails(paymentInfo);
        toast.warning('Payment Required - Please check your wallet for payment prompt', { duration: 5000 });
        options?.onPaymentRequired?.(paymentInfo);
      } else {
        // Check if user rejected the payment
        const errorMessage = axios.isAxiosError(error) 
          ? error.message 
          : error instanceof Error ? error.message : 'Unknown error';
        
        console.log('Error message:', errorMessage);
        
        if (errorMessage.includes('User rejected') || errorMessage.includes('user rejected') || errorMessage.includes('User denied')) {
          toast.error('Payment cancelled by user');
        } else if (errorMessage.includes('ERR_BAD_REQUEST')) {
          toast.error('Payment configuration error. Please check console for details.');
        } else {
          options?.onError?.(error);
        }
      }
      
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [isConnected, address, chain?.id, switchChainAsync]);

  const shortenUrl = useCallback(async (
    url: string,
    customCode?: string
  ) => {
    const endpoint = customCode ? '/api/shorten/custom' : '/api/shorten';
    const data = customCode ? { url, customCode } : { url };
    
    return makePaymentRequest(endpoint, 'POST', data, {
      onSuccess: () => {
        toast.success('URL shortened successfully!');
      },
      onError: (error) => {
        const message = axios.isAxiosError(error) 
          ? error.response?.data?.error || 'Failed to shorten URL'
          : 'Failed to shorten URL';
        toast.error(message);
      },
      onPaymentRequired: (details) => {
        toast.info('Payment required: ' + details.price);
      }
    });
  }, [makePaymentRequest]);

  const getAnalytics = useCallback(async (shortCode: string) => {
    return makePaymentRequest(`/api/analytics/${shortCode}`, 'GET', undefined, {
      onSuccess: () => {
        toast.success('Analytics retrieved');
      },
      onError: () => {
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
