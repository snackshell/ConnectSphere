import { Inter } from 'next/font/google';
import { Providers } from '@/components/providers/Providers';
import { Header } from '@/components/layout/Header';
import { Toaster } from 'react-hot-toast';
import SessionProvider from '@/providers/SessionProvider';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'ConnectSphere',
  description: 'A modern social media platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider>
          <Providers>
            <div className="min-h-screen bg-gray-50">
              <Header />
              {children}
              <Toaster position="bottom-right" />
            </div>
          </Providers>
        </SessionProvider>
      </body>
    </html>
  );
}
