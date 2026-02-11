import type { Metadata } from 'next';
import { Space_Grotesk } from 'next/font/google';
import './globals.css';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata: Metadata = {
  title: 'CS2 Preditive — Análises e sugestões em tempo real',
  description: 'Análises preditivas de partidas de CS2 e sugestões de apostas em tempo real. Assine por R$ 30/mês.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR" className={spaceGrotesk.variable}>
      <body className="font-sans antialiased min-h-screen bg-[var(--bg)] text-white">
        {children}
      </body>
    </html>
  );
}
