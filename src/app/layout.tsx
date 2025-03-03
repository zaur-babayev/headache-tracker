import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from 'sonner';
import { ThemeProvider } from '@/components/theme-provider';
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
          colorBackground: '#09090b',
          colorPrimary: '#0ea5e9',
          colorInputBackground: '#18181b',
        },
        elements: {
          card: 'bg-background',
          navbar: 'bg-background',
          formButtonPrimary: 'bg-primary hover:bg-primary/90',
          footerActionLink: 'text-primary hover:text-primary/90',
          userButtonPopoverCard: 'bg-background text-foreground',
          userButtonPopoverActionButton: 'text-foreground hover:bg-accent',
          userButtonPopoverActionButtonIcon: 'text-foreground',
          userButtonPopoverFooter: 'bg-background',
          formFieldInput: 'bg-[#18181b]',
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
