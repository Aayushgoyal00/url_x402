import type { Metadata } from "next";
import { Inter } from 'next/font/google';
import "./globals.css";
import { WalletProvider } from "@/providers/WalletProvider";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: "URL Shortener x402 | Decentralized URL Shortening",
  description: "Shorten URLs with crypto payments using x402 protocol. On-chain storage, analytics, and custom links.",
  keywords: "URL shortener, x402, crypto payments, blockchain, Web3",
  openGraph: {
    title: "URL Shortener x402",
    description: "Decentralized URL shortening with x402 payments",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    siteName: "URL Shortener x402",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} antialiased`}>
        <WalletProvider>
          {children}
          <Toaster 
            position="bottom-right"
            toastOptions={{
              style: {
                background: 'rgb(31 41 55)',
                color: 'white',
                border: '1px solid rgb(55 65 81)',
              },
            }}
          />
        </WalletProvider>
      </body>
    </html>
  );
}
