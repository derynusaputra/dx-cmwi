"use client";
import { Outfit } from 'next/font/google';
import './globals.css';
import "flatpickr/dist/flatpickr.css";
import { SidebarProvider } from '@/context/SidebarContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Metadata } from 'next';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { apiClient } from '@/lib/axios';
import { useAuthStore } from '@/stores/authStore';

const queryClient = new QueryClient();

const outfit = Outfit({
  subsets: ["latin"],
});



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const { accessToken, setAuth } = useAuthStore();
  const [init, setInit] = useState(false);

  // Silently login user on app hard refresh from local storage if memory is wiped
  useEffect(() => {
    const initializeAuth = async () => {
      if (!accessToken && document.cookie.includes('refresh_token')) {
        try {
          const { data } = await apiClient.post('/auth/refresh');
          setAuth(data.accessToken, data.user);
        } catch (e) {
          // Token expired or not found, proceed rendering unauthenticated
        }
      }
      setInit(true);
    };
    initializeAuth();
  }, [accessToken, setAuth]);
  
  return (
    <html lang="en">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#0f172a" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="apple-mobile-web-app-title" content="QC-CMWI" />
        <link rel="apple-touch-icon" href="/icons/icon-192.png" />
      </head>
      <body className={`${outfit.className} dark:bg-gray-900`}>
        <ThemeProvider>
          <QueryClientProvider client={queryClient}>
            {init ? (
               <SidebarProvider>{children}</SidebarProvider>
            ) : (
                <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading App...</div>
            )}
          </QueryClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
