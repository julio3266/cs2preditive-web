import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-[var(--border)] bg-[var(--bg)]/80 backdrop-blur sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-xl font-bold text-[var(--accent)]">CS2 Preditive</span>
          <nav className="flex items-center gap-6">
            <Link href="/#features" className="text-sm text-zinc-400 hover:text-white transition">
              Recursos
            </Link>
            <Link href="/pricing" className="text-sm text-zinc-400 hover:text-white transition">
              Preços
            </Link>
            <Link
              href="/login"
              className="text-sm text-zinc-400 hover:text-white transition"
            >
              Entrar
            </Link>
            <Link
              href="/pricing"
              className="rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black hover:bg-orange-400 transition"
            >
              Começar agora
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="max-w-6xl mx-auto px-4 py-24 text-center">
          <h1 className="text-4xl md:text-6xl font-bold tracking-tight mb-6">
            Análises de <span className="text-[var(--accent)]">CS2</span> em tempo real
          </h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto mb-10">
            Dados ao vivo, previsões e sugestões para você tomar decisões mais inteligentes. 
            Partidas, placares e odds atualizados na hora.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/register"
              className="rounded-xl bg-[var(--accent)] px-8 py-4 text-lg font-semibold text-black hover:bg-orange-400 transition"
            >
              Criar conta grátis
            </Link>
            <Link
              href="/pricing"
              className="rounded-xl border border-[var(--border)] px-8 py-4 text-lg font-medium hover:bg-white/5 transition"
            >
              Ver planos — R$ 30/mês
            </Link>
          </div>
        </section>

        <section id="features" className="border-t border-[var(--border)] py-24">
          <div className="max-w-6xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-16">O que você tem acesso</h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-8">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] text-2xl mb-4">
                  ◉
                </div>
                <h3 className="text-lg font-semibold mb-2">Partidas ao vivo</h3>
                <p className="text-zinc-400 text-sm">
                  Acompanhe placares e eventos das partidas em tempo real, sem atraso.
                </p>
              </div>
              <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-8">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] text-2xl mb-4">
                  ◐
                </div>
                <h3 className="text-lg font-semibold mb-2">Previsões e sugestões</h3>
                <p className="text-zinc-400 text-sm">
                  Análises preditivas e sugestões baseadas no andamento da partida e métricas.
                </p>
              </div>
              <div className="rounded-2xl bg-[var(--card)] border border-[var(--border)] p-8">
                <div className="w-12 h-12 rounded-xl bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)] text-2xl mb-4">
                  ⚡
                </div>
                <h3 className="text-lg font-semibold mb-2">Atualização contínua</h3>
                <p className="text-zinc-400 text-sm">
                  WebSockets para receber atualizações instantâneas na sua tela.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-[var(--border)] py-24">
          <div className="max-w-3xl mx-auto px-4 text-center">
            <h2 className="text-3xl font-bold mb-4">R$ 30 por mês</h2>
            <p className="text-zinc-400 mb-8">
              Acesso completo às partidas ao vivo, previsões e sugestões. Cancele quando quiser.
            </p>
            <Link
              href="/pricing"
              className="inline-flex rounded-xl bg-[var(--accent)] px-8 py-4 text-lg font-semibold text-black hover:bg-orange-400 transition"
            >
              Assinar agora
            </Link>
          </div>
        </section>
      </main>

      <footer className="border-t border-[var(--border)] py-8">
        <div className="max-w-6xl mx-auto px-4 flex flex-wrap items-center justify-between gap-4">
          <span className="text-zinc-500 text-sm">© CS2 Preditive</span>
          <div className="flex gap-6 text-sm text-zinc-500">
            <Link href="/login">Entrar</Link>
            <Link href="/register">Cadastro</Link>
            <Link href="/pricing">Preços</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
