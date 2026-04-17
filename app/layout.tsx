import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import ParticleSwarm from '@/components/ParticleSwarm';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'KimiClean — Enterprise Cleaning with 3D AR Tours',
  description: 'Premium cleaning services powered by WebXR visualization and AI-powered booking',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <ParticleSwarm particleCount={3000} color="#3b82f6" />
        {children}
      </body>
    </html>
  );
}
