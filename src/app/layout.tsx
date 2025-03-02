import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Headache Tracker',
  description: 'Track and analyze your headache patterns',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={inter.variable}>
      <body className={`font-sans antialiased min-h-screen bg-background text-foreground ${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster 
            position="top-right" 
            richColors 
            closeButton 
            toastOptions={{
              style: {
                fontSize: '0.875rem',
                borderRadius: '0.5rem',
                padding: '1rem',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
