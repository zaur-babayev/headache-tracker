import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { Nav } from '@/components/nav';

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
      <body className={`font-sans antialiased bg-background text-foreground ${inter.className}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
          disableTransitionOnChange
        >
          <div className="relative min-h-screen flex flex-col">
            <Nav />
            <main className="flex-1">
              {children}
            </main>
          </div>
          <Toaster 
            position="top-right"
            theme="dark"
            closeButton
            toastOptions={{
              style: {
                background: 'hsl(240 10% 3.9%)',
                color: 'hsl(0 0% 98%)',
                border: '1px solid hsl(240 3.7% 15.9%)',
              },
              success: {
                style: {
                  background: 'hsl(240 10% 3.9%)',
                  color: 'hsl(0 0% 98%)',
                  border: '1px solid hsl(240 3.7% 15.9%)',
                },
                icon: '✓',
              },
              error: {
                style: {
                  background: 'hsl(240 10% 3.9%)',
                  color: 'hsl(0 0% 98%)',
                  border: '1px solid hsl(0 62.8% 30.6%)',
                },
                icon: '✕',
              },
            }}
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
