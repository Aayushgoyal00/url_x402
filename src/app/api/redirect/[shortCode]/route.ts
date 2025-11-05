import { NextRequest, NextResponse } from 'next/server';
import { ethers } from 'ethers';

// Smart contract ABI (minimalist version)
const CONTRACT_ABI = [
  "function getOriginalUrl(string memory _shortCode) external view returns (string memory)",
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

    // Connect to smart contract on Base Sepolia (read-only, no wallet needed)
    const provider = new ethers.JsonRpcProvider(
      process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || 'https://sepolia.base.org'
    );

    const contract = new ethers.Contract(
      process.env.NEXT_PUBLIC_CONTRACT_ADDRESS || '',
      CONTRACT_ABI,
      provider
    );

    try {
      // Get the original URL from the smart contract
      const originalUrl = await contract.getOriginalUrl(shortCode);

      if (!originalUrl) {
        return NextResponse.json(
          { error: 'URL not found' },
          { status: 404 }
        );
      }

      // Note: Click tracking removed in minimalist contract version
      // Analytics can be handled off-chain if needed

      return NextResponse.json({
        success: true,
        originalUrl,
        shortCode
      });

    } catch (contractError) {
      console.error('Contract error:', contractError);
      
      if (contractError instanceof Error && contractError.message?.includes('URL not found')) {
        return NextResponse.json(
          { error: 'Short URL does not exist' },
          { status: 404 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to retrieve URL' },
        { status: 500 }
      );
    }

  } catch (error) {
    console.error('Error in redirect:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
