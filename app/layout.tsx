import { RootProvider } from 'fumadocs-ui/provider/next';
import './global.css';
import { withBasePath } from '@/lib/base-path.mjs';

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider
          theme={{ attribute: ['class', 'data-theme'] }}
          search={{ options: { type: 'static', api: withBasePath('/api/search') } }}
        >
          {children}
        </RootProvider>
      </body>
    </html>
  );
}
