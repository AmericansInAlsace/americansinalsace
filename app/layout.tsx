import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Americans in Alsace',
  description: 'An association for North Americans residing in Alsace, France.',
  icons: {
    icon: '/AIA.png',
    apple: '/AIA.png',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
