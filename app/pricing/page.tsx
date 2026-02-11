'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { users } from '@/lib/api';
// Stripe desativado em desenvolvimento (descomente em produção)
// import { stripe } from '@/lib/api';

export default function PricingPage() {
  const router = useRouter();

  useEffect(() => {
    const t = localStorage.getItem('token');
    if (!t) return;
    users.me().then((me) => {
      // Stripe desativado: não redirecionar por hasAccess
      // if (me.hasAccess) router.replace('/dashboard');
    }).catch(() => {});
  }, [router]);

  async function handleSubscribe() {
    // Stripe desativado em desenvolvimento — checkout comentado (descomente em produção)
    // const token = localStorage.getItem('token');
    // const base = typeof window !== 'undefined' ? window.location.origin : '';
    // const successUrl = `${base}/dashboard?success=1`;
    // const cancelUrl = `${base}/pricing`;
    // if (!token) {
    //   router.push(`/register?redirect=${encodeURIComponent('/pricing')}`);
    //   return;
    // }
    // try {
    //   const { url } = await stripe.createCheckoutSession(successUrl, cancelUrl);
    //   if (url) window.location.href = url;
    // } catch (e) {
    //   alert((e as Error).message || 'Erro ao abrir checkout');
    // }
    alert('Pagamento via Stripe em breve. Por enquanto use o dashboard após fazer login.');
    router.push('/dashboard');
  }

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)]">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold text-[var(--accent)]">
            CS2 Preditive
          </Link>
          <nav className="flex items-center gap-4">
            <Link href="/login" className="text-sm text-zinc-400 hover:text-white">
              Entrar
            </Link>
            <Link href="/register" className="text-sm text-zinc-400 hover:text-white">
              Cadastrar
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md rounded-2xl bg-[var(--card)] border border-[var(--border)] p-8 shadow-xl">
          <h1 className="text-2xl font-bold mb-2">Plano único</h1>
          <p className="text-zinc-400 text-sm mb-8">
            Acesso total às análises em tempo real e sugestões.
          </p>
          <div className="mb-8">
            <span className="text-4xl font-bold">R$ 30</span>
            <span className="text-zinc-400 ml-1">/mês</span>
          </div>
          <ul className="space-y-3 text-sm text-zinc-300 mb-8">
            <li>✓ Partidas ao vivo</li>
            <li>✓ Previsões e sugestões</li>
            <li>✓ Atualizações em tempo real</li>
            <li>✓ Cancele quando quiser</li>
          </ul>
          <button
            onClick={handleSubscribe}
            className="w-full rounded-xl bg-[var(--accent)] py-4 font-semibold text-black hover:bg-orange-400 transition"
          >
            Assinar (Stripe em breve)
          </button>
          <p className="text-center text-zinc-500 text-xs mt-4">
            Em desenvolvimento: acesso ao dashboard sem pagamento. Em produção: pagamento via Stripe.
          </p>
          <Link
            href="/"
            className="block text-center text-sm text-zinc-400 hover:text-white mt-6"
          >
            ← Voltar
          </Link>
        </div>
      </main>
    </div>
  );
}
