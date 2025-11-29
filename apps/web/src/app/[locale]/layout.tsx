import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { ReactNode } from 'react';
import { Inter } from 'next/font/google';
import { Toaster } from 'react-hot-toast';
import { QueryProvider } from '@/lib/providers/query-provider';
import { AuthProvider } from '@/lib/context/auth-context';
import { Navigation } from '@/components/layout/Navigation';
import '../globals.css';

const inter = Inter({ subsets: ['latin'] });

type LocaleLayoutProps = {
  children: ReactNode;
  params: { locale: string };
};

export async function generateMetadata(_params: LocaleLayoutProps) {
  return {
    title: 'InFocus - Media Tracking & Recommendations',
    description:
      'Track your favorite movies and TV shows, get personalized recommendations, and share with family.',
  };
}

export default async function LocaleLayout({
  children,
  params: { locale }
}: LocaleLayoutProps) {
  // Providing all messages to the client
  // side is the easiest way to get started
  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className={inter.className}>
        <NextIntlClientProvider messages={messages}>
          <QueryProvider>
            <AuthProvider>
              <Navigation />
              <main className="min-h-screen bg-gray-50">{children}</main>
              <Toaster position="top-right" />
            </AuthProvider>
          </QueryProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}