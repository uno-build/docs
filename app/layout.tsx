import { RootProvider } from 'fumadocs-ui/provider/next';
import Script from 'next/script';
import type { Metadata } from 'next';
import './global.css';
import { withBasePath } from '@/lib/base-path.mjs';

export const metadata: Metadata = {
  title: {
    default: 'uno',
    template: '%s - uno',
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider
          theme={{ attribute: ['class', 'data-theme'], defaultTheme: 'dark' }}
          search={{ options: { type: 'static', api: withBasePath('/api/search') } }}
        >
          {children}
        </RootProvider>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-GBMPB1RCRW"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());
            gtag('config', 'G-GBMPB1RCRW');
          `}
        </Script>
      </body>
    </html>
  );
}
