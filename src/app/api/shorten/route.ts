import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';
import { nanoid } from 'nanoid';

// Smart contract ABI (simplified)
const CONTRACT_ABI = [
  "function createShortUrl(string memory _originalUrl, address _creator, string memory _shortCode) external returns (bool)",
  "function isShortCodeTaken(string memory _shortCode) external view returns (bool)",
  "function getOriginalUrl(string memory _shortCode) external view returns (string memory)"
];

// Generate a short code
function generateShortCode(): string {
  return nanoid(6); // 6 character short code
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      );
    }

    // Validate URL format
    try {
      new URL(url);
    } catch {
      return NextResponse.json(
        { error: 'Invalid URL format' },
        { status: 400 }
      );
    }

    // Get payment information from headers (x402 adds this after payment)
    const paymentHeader = request.headers.get('x-payment');
    const paymentResponseHeader = request.headers.get('x-payment-response');
    
    console.log('Payment headers:', {
      hasPayment: !!paymentHeader,
      hasPaymentResponse: !!paymentResponseHeader
    });

    // Extract payer address from x-payment-response header
    let payerAddress = '0x0000000000000000000000000000000000000000';
    
    if (paymentResponseHeader) {
      try {
        const paymentResponse = JSON.parse(atob(paymentResponseHeader));
        console.log('Payment response:', paymentResponse);
        payerAddress = paymentResponse.payer || '0x0000000000000000000000000000000000000000';
        console.log('Extracted payer address:', payerAddress);
      } catch (error) {
        console.error('Failed to parse payment response:', error);
      }
    }

    // Validate that payment was processed
    if (!payerAddress || payerAddress === '0x0000000000000000000000000000000000000000') {
      console.error('No valid payer address - payment may not have been processed');
      return NextResponse.json(
        { 
          error: 'Payment verification failed',
          details: 'No payer address found. Please ensure payment was completed.',
          debug: {
            hasPaymentHeader: !!paymentHeader,
            hasPaymentResponse: !!paymentResponseHeader
          }
        },
        { status: 402 }
      );
    }

    // Note: In production, x402 middleware validates payment before request reaches here
    // If we're here, payment has been verified by x402

    // Connect to smart contract on Base Sepolia
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
    );

    // Use a server wallet to interact with contract (this wallet should be authorized in the contract)
    const serverWallet = new ethers.Wallet(
      process.env.SERVER_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000',
      provider
    );

    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
      CONTRACT_ABI,
      serverWallet
    );

    // Generate unique short code
    let shortCode = generateShortCode();
    let attempts = 0;
    
    // Check if code exists and regenerate if needed
    while (await contract.isShortCodeTaken(shortCode)) {
      shortCode = generateShortCode();
      attempts++;
      if (attempts > 10) {
        return NextResponse.json(
          { error: 'Failed to generate unique short code' },
          { status: 500 }
        );
      }
    }

    // Store URL in smart contract
    try {
      const tx = await contract.createShortUrl(url, payerAddress, shortCode);
      await tx.wait();
    } catch (error) {
      console.error('Contract error:', error);
      return NextResponse.json(
        { error: 'Failed to store URL on blockchain' },
        { status: 500 }
      );
    }

    // Construct the short URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shortUrl = `${baseUrl}/s/${shortCode}`;

    // Return success response
    return NextResponse.json({
      success: true,
      shortUrl,
      shortCode,
      originalUrl: url,
      message: 'URL shortened successfully!',
      transaction: {
        payer: payerAddress,
        paymentVerified: true
      }
    });

  } catch (error) {
    console.error('Error in URL shortening:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET request to check if the service is working
export async function GET() {
  return NextResponse.json({
    service: 'URL Shortener with x402',
    status: 'operational',
    payment: {
      required: true,
      price: '$0.001',
      network: 'base-sepolia',
      protocol: 'x402'
    }
  });
}
