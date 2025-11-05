import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Smart contract ABI
const CONTRACT_ABI = [
  "function createShortUrl(string memory _originalUrl, address _creator, string memory _shortCode) external returns (bool)",
  "function isShortCodeTaken(string memory _shortCode) external view returns (bool)"
];

// Validate custom short code
function validateCustomCode(code: string): boolean {
  // Only allow alphanumeric characters, min 3, max 20 chars
  const regex = /^[a-zA-Z0-9]{3,20}$/;
  return regex.test(code);
}

export async function POST(request: NextRequest) {
  try {
    // Parse request body
    const body = await request.json();
    const { url, customCode } = body;

    // Validate inputs
    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Invalid URL provided' },
        { status: 400 }
      );
    }

    if (!customCode || typeof customCode !== 'string') {
      return NextResponse.json(
        { error: 'Custom code is required' },
        { status: 400 }
      );
    }

    // Validate custom code format
    if (!validateCustomCode(customCode)) {
      return NextResponse.json(
        { error: 'Custom code must be 3-20 alphanumeric characters' },
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
    const payerAddress = request.headers.get('x-payer-address') || '0x0000000000000000000000000000000000000000';

    // Connect to smart contract
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || 'https://ethereum-sepolia-rpc.publicnode.com'
    );

    const serverWallet = new ethers.Wallet(
      process.env.SERVER_PRIVATE_KEY || '0x0000000000000000000000000000000000000000000000000000000000000000',
      provider
    );

    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
      CONTRACT_ABI,
      serverWallet
    );

    // Check if custom code is already taken
    const isTaken = await contract.isShortCodeTaken(customCode);
    if (isTaken) {
      return NextResponse.json(
        { error: 'This custom code is already taken' },
        { status: 409 }
      );
    }

    // Store URL with custom code in smart contract
    try {
      const tx = await contract.createShortUrl(url, payerAddress, customCode);
      await tx.wait();
    } catch (error: any) {
      console.error('Contract error:', error);
      return NextResponse.json(
        { error: 'Failed to store URL on blockchain' },
        { status: 500 }
      );
    }

    // Construct the short URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const shortUrl = `${baseUrl}/s/${customCode}`;

    // Return success response
    return NextResponse.json({
      success: true,
      shortUrl,
      shortCode: customCode,
      originalUrl: url,
      custom: true,
      message: 'Custom URL created successfully!',
      transaction: {
        payer: payerAddress,
        paymentVerified: true,
        premium: true
      }
    });

  } catch (error: any) {
    console.error('Error in custom URL creation:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// GET request to check custom URL pricing
export async function GET() {
  return NextResponse.json({
    service: 'Custom URL Shortener with x402',
    status: 'operational',
    payment: {
      required: true,
      price: '$0.002',
      network: 'base-sepolia',
      protocol: 'x402',
      note: 'Custom URLs cost 2x the standard price'
    },
    rules: {
      minLength: 3,
      maxLength: 20,
      allowedCharacters: 'alphanumeric only (a-z, A-Z, 0-9)',
      caseSensitive: true
    }
  });
}
