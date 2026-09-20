import type { Metadata } from 'next';
import Script from 'next/script';
import { AppShell } from '@/components/app-shell';
import { AuthProvider } from '@/components/auth-provider';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hawker Menu Intelligence',
  description: 'AI-assisted hawker discovery for Malaysian food around Kuala Lumpur.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <head>
        {/* Suppress unhandled errors from browser extensions (e.g. Safari AdBlock webkit-masked-url useCache bug) from triggering Next.js dev overlay */}
        <Script
          id="suppress-extension-errors"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              if (typeof window !== 'undefined') {
                window.addEventListener('error', function(event) {
                  var file = event.filename || '';
                  var stack = (event.error && event.error.stack) || '';
                  var msg = event.message || '';
                  var isExtension = file.indexOf('webkit-masked-url') !== -1 ||
                                    stack.indexOf('webkit-masked-url') !== -1 ||
                                    file.indexOf('moz-extension') !== -1 ||
                                    file.indexOf('chrome-extension') !== -1;
                  var isAdBlockCacheBug = msg.indexOf('useCache') !== -1 || stack.indexOf('useCache') !== -1;
                  if (isExtension && isAdBlockCacheBug) {
                    event.stopImmediatePropagation();
                    event.preventDefault();
                  }
                }, true);
              }
            `,
          }}
        />
      </head>
      <body className="bg-[#f5f5f7]">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
