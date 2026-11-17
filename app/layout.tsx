import type { Metadata } from 'next';
import localFont from 'next/font/local';

import { QueryProvider } from '@/shared/api/query-provider';
import {
  SITE_DESCRIPTION,
  SITE_NAME,
  SITE_ORIGIN,
  SOCIAL_IMAGE,
} from '@/shared/lib/page-metadata';
import { ToastProvider } from '@/shared/ui/toast-provider';

import './globals.css';

const pretendard = localFont({
  src: './fonts/PretendardVariable.woff2',
  variable: '--font-pretendard',
  weight: '100 900',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: SITE_ORIGIN,
  title: SITE_NAME,
  description: SITE_DESCRIPTION,
  openGraph: {
    type: 'website',
    siteName: SITE_NAME,
    locale: 'ko_KR',
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: [SOCIAL_IMAGE],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={`${pretendard.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-background font-sans text-on-background">
        <QueryProvider>
          <ToastProvider>{children}</ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
