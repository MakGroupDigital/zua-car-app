
'use client';

import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from "@/components/ui/toaster"
import { FirebaseClientProvider } from '@/firebase/client-provider';
import { RegisterServiceWorker } from '@/components/pwa/register-sw';
import { useTheme } from '@/hooks/use-theme';
import { useEffect } from 'react';

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const { theme, mounted } = useTheme();

  useEffect(() => {
    // Apply theme on mount
    if (mounted) {
      const root = document.documentElement;
      if (theme === 'dark') {
        root.classList.add('dark');
      } else {
        root.classList.remove('dark');
      }
    }
  }, [theme, mounted]);

  return <>{children}</>;
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <title>Zua-Car - Solutions Automobiles Tout-en-Un en RDC</title>
        <meta name="description" content="Zua-Car propose des services automobiles de premier ordre, notamment la maintenance, la réparation et la vente de voitures en République Démocratique du Congo." />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no" />
        
        {/* PWA Meta Tags */}
        <meta name="theme-color" content="#003366" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Zua-Car" />
        <meta name="mobile-web-app-capable" content="yes" />
        
        {/* Icons */}
        <link rel="icon" href="/icon.jpg" />
        <link rel="apple-touch-icon" href="/icon.jpg" />
        <link rel="manifest" href="/manifest.json" />
        
        {/* Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700&display=swap" rel="stylesheet" />
      </head>
      <body className={cn("font-body antialiased", "min-h-screen bg-background font-sans")}>
        <ThemeProvider>
          <RegisterServiceWorker />
          <FirebaseClientProvider>
            {children}
          </FirebaseClientProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
