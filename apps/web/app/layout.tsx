import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Celesnity Factory Platform',
  description: 'Factory data and production line platform',
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
