import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import NavbarWrapper from '@/components/NavbarWrapper';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'VanillaArena',
  description: 'Master vanilla JavaScript. Get scored by AI.',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${geist.className} bg-[#0a0a0a] text-white`}>
        <NavbarWrapper />
        {children}
      </body>
    </html>
  );
}