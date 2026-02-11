'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { auth } from '@/lib/api';

function RegisterForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/pricing';

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await auth.register(email, password);
      const token = res.access_token;
      if (!token) {
        setError('Resposta do servidor inválida');
        return;
      }
      localStorage.setItem('token', token);
      window.location.href = redirect;
    } catch (e) {
      setError((e as Error).message || 'Falha no cadastro');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <Link href="/" className="inline-block text-xl font-bold text-[var(--accent)] mb-8">
          CS2 Preditive
        </Link>
        <h1 className="text-2xl font-bold mb-6">Criar conta</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <p className="text-sm text-red-400 bg-red-400/10 rounded-lg p-3">{error}</p>
          )}
          <input
            type="email"
            placeholder="E-mail"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg bg-[var(--card)] border border-[var(--border)] px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            required
          />
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full rounded-lg bg-[var(--card)] border border-[var(--border)] px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
            required
            minLength={6}
          />
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-[var(--accent)] py-3 font-medium text-black hover:bg-orange-400 disabled:opacity-50"
          >
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
        <p className="mt-6 text-center text-sm text-zinc-400">
          Já tem conta?{' '}
          <Link href={`/login?redirect=${encodeURIComponent(redirect)}`} className="text-[var(--accent)] hover:underline">
            Entrar
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center text-zinc-400">Carregando...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
