import type { Metadata } from 'next';
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
      <body className="bg-[#f5f5f7]">
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
      </body>
    </html>
  );
}
