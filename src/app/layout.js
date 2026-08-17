import './globals.css';
import { Inter } from 'next/font/google';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata = {
  title: 'Vyapar Care Admin — Consultancy Services Management',
  description: 'Enterprise Admin Web Panel for Vyapar Care Consultancy legal, tax, and registration operations.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="antialiased min-h-screen bg-[#F5F5F5] text-slate-800">
        {children}
      </body>
    </html>
  );
}
