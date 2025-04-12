import type {Metadata} from 'next';
import {Geist, Geist_Mono} from 'next/font/google';
import './globals.css';
import {Toaster} from "@/components/ui/toaster";
// Import SessionProvider at the top
import { ReactNode } from 'react';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'VerdantAI',
  description: 'Your AI-powered companion for plant care.',
  manifest: '/manifest.json',
};

// Create a Client-Side component to wrap children with SessionProvider
import { SessionProvider } from "next-auth/react";
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';
const ClientSessionProvider = ({ children }: { children: ReactNode }) => {
  return (
    <SessionProvider>
      {children}
    </SessionProvider>
  );
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Wrap the children with ClientSessionProvider */}
        <ClientSessionProvider>
          {children}
          <Toaster/>
        </ClientSessionProvider>
      </body>
    </html>
  );
}

