import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Hawker Menu Intelligence',
  description: 'AI-assisted hawker discovery for Malaysian food around Kuala Lumpur.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
