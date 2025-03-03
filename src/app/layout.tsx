import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { Nav } from '@/components/nav';
import { ClerkProvider } from '@clerk/nextjs';
import { dark } from '@clerk/themes';

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
    <ClerkProvider 
      appearance={{
        baseTheme: dark,
        variables: {
          colorPrimary: '#0ea5e9',
          colorBackground: '#09090b',
          colorText: '#ffffff',
          colorInputBackground: '#18181b',
          colorInputText: '#ffffff',
        },
        elements: {
          formButtonPrimary: 'bg-primary hover:bg-primary/90',
          footerActionLink: 'text-primary hover:text-primary/90',
          card: 'bg-background',
          navbar: 'bg-background',
          userButtonPopoverCard: 'bg-background text-foreground',
          userButtonPopoverActionButton: 'text-foreground hover:bg-accent',
          userButtonPopoverActionButtonIcon: 'text-foreground',
          userButtonPopoverFooter: 'bg-background',
        }
      }}
    >
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
    </ClerkProvider>
  );
}
