import type { Metadata, Viewport } from 'next';
import { Kanit, Inter } from 'next/font/google';
import './globals.css';
import { SITE_URL } from '@/lib/utils';

const kanit = Kanit({
  subsets: ['latin'],
  weight: ['600', '700', '800', '900'],
  variable: '--font-kanit',
  display: 'swap',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-inter',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Selvi Motors | Quality Pre-Owned Motorcycles', template: '%s | Selvi Motors' },
  description: 'Quality pre-owned motorcycles, inspected and ready for the road. Buy or sell your bike with Selvi Motors.',
  openGraph: { type: 'website', siteName: 'Selvi Motors', locale: 'en_IN', images: [{ url: '/hero.jpg', width: 1479, height: 1056 }] },
  twitter: { card: 'summary_large_image' },
  alternates: { canonical: '/' },
};
export const viewport: Viewport = { themeColor: '#050505' };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${kanit.variable} ${inter.variable}`}>
      <body className="bg-background font-sans text-text antialiased">
        {children}
      </body>
    </html>
  );
}
