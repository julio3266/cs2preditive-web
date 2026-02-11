'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { users } from '@/lib/api';
// Stripe desativado em desenvolvimento (descomente em produção)
// import { stripe } from '@/lib/api';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [user, setUser] = useState<{ email: string; hasAccess: boolean } | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.replace('/login?redirect=/dashboard');
      return;
    }
    users
      .me()
      .then((me) => {
        setUser(me);
        // Stripe desativado: não redirecionar para /pricing (reativar em produção)
        // if (!me.hasAccess && pathname === '/dashboard') router.replace('/pricing');
      })
      .catch(() => router.replace('/login?redirect=/dashboard'))
      .finally(() => setLoading(false));
  }, [router]);

  // Stripe desativado em desenvolvimento
  // async function handleManageSubscription() {
  //   try {
  //     const { url } = await stripe.createPortalSession(
  //       typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : '/dashboard'
  //     );
  //     if (url) window.location.href = url;
  //   } catch (e) {
  //     alert((e as Error).message || 'Erro ao abrir portal');
  //   }
  // }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-zinc-400">Carregando...</div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--bg)]/90 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/dashboard" className="text-xl font-bold text-[var(--accent)]">
            CS2 Preditive
          </Link>
          <div className="flex items-center gap-4">
            <span className="text-sm text-zinc-400">{user.email}</span>
            {/* Stripe desativado: botão de assinatura/portal comentado
            {user.hasAccess ? (
              <button onClick={handleManageSubscription} className="text-sm text-[var(--accent)] hover:underline">
                Gerenciar assinatura
              </button>
            ) : (
              <Link href="/pricing" className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black">
                Assinar — R$ 30/mês
              </Link>
            )}
            */}
            <button
              onClick={() => {
                localStorage.removeItem('token');
                router.push('/');
              }}
              className="text-sm text-zinc-400 hover:text-white"
            >
              Sair
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">{children}</main>
    </div>
  );
}
