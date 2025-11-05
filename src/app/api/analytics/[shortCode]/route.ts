import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Smart contract ABI (minimalist version - no clickCount or getUserUrls)
const CONTRACT_ABI = [
  "function getUrlRecord(string memory _shortCode) external view returns (string memory, address, uint256)"
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ shortCode: string }> }
) {
  try {
    const { shortCode } = await params;

    if (!shortCode) {
      return NextResponse.json(
        { error: 'Short code is required' },
        { status: 400 }
      );
    }

    // Payment verified by x402 middleware before reaching here
    const paymentResponseHeader = request.headers.get('x-payment-response');
    
    let payerAddress = 'anonymous';
    
    if (paymentResponseHeader) {
      try {
        const paymentResponse = JSON.parse(Buffer.from(paymentResponseHeader, 'base64').toString());
        payerAddress = paymentResponse.payer || payerAddress;
      } catch (error) {
        console.error('Failed to parse payment response:', error);
      }
    }

    // Connect to smart contract on Base Sepolia
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
    );

    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
      CONTRACT_ABI,
      provider
    );

    try {
      // Get detailed URL record from smart contract (no clickCount in minimalist version)
      const [originalUrl, creator, createdAt] = await contract.getUrlRecord(shortCode);

      if (!originalUrl) {
        return NextResponse.json(
          { error: 'URL analytics not found' },
          { status: 404 }
        );
      }

      // Calculate days since creation
      const createdDate = new Date(Number(createdAt) * 1000);
      const daysSinceCreation = Math.floor((Date.now() - createdDate.getTime()) / (1000 * 60 * 60 * 24));

      // Build the short URL - use request headers to get the actual domain
      const host = request.headers.get('host') || 'localhost:3000';
      const protocol = request.headers.get('x-forwarded-proto') || 'http';
      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || `${protocol}://${host}`;
      const shortUrl = `${baseUrl}/s/${shortCode}`;

      return NextResponse.json({
        success: true,
        analytics: {
          shortCode,
          shortUrl,
          originalUrl,
          creator,
          createdAt: createdDate.toISOString(),
          daysSinceCreation,
          // Note: Click tracking removed in minimalist contract
          message: 'Click analytics not available in minimalist version',
          suggestion: 'Implement off-chain analytics if click tracking is needed'
        },
        payment: {
          payer: payerAddress,
          service: 'Premium Analytics',
          timestamp: new Date().toISOString()
        }
      });

    } catch (contractError) {
      console.error('Contract error:', contractError);
      
      if (contractError instanceof Error && contractError.message?.includes('URL not found')) {
        return NextResponse.json(
          { error: 'Analytics not available for this URL' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to retrieve analytics' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST endpoint - getUserUrls not available in minimalist contract
export async function POST(request: NextRequest) {
  try {
    // Payment verified by x402 middleware
    const paymentResponseHeader = request.headers.get('x-payment-response');
    
    let payerAddress = 'anonymous';
    
    if (paymentResponseHeader) {
      try {
        const paymentResponse = JSON.parse(Buffer.from(paymentResponseHeader, 'base64').toString());
        payerAddress = paymentResponse.payer || payerAddress;
      } catch (error) {
        console.error('Failed to parse payment response:', error);
      }
    }

    const body = await request.json();
    const { userAddress } = body;

    if (!userAddress || !ethers.isAddress(userAddress)) {
      return NextResponse.json(
        { error: 'Valid Ethereum address is required' },
        { status: 400 }
      );
    }

    // getUserUrls functionality removed in minimalist contract
    return NextResponse.json({
      success: false,
      message: 'User URL list not available in minimalist contract version',
      userAddress,
      note: 'The getUserUrls() function has been removed for gas optimization',
      suggestion: 'Track user URLs off-chain if this feature is needed',
      payment: {
        payer: payerAddress,
        service: 'User Analytics Dashboard (Unavailable)',
        timestamp: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('Error in user analytics:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
