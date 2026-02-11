'use client';

import Link from 'next/link';

export default function GsiSetupPage() {
  const apiUrl = typeof window !== 'undefined' ? (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000') : 'http://localhost:4000';
  const gsiUrl = `${apiUrl.replace(/\/$/, '')}/gsi`;

  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <Link href="/dashboard" className="text-zinc-400 hover:text-white text-sm">← Dashboard</Link>
      </div>

      <div>
        <h1 className="text-2xl font-bold mb-2">Conectar sua partida (GSI)</h1>
        <p className="text-zinc-400 text-sm">
          O CS2 envia o estado da partida em tempo real para a API. Assim sua partida aparece ao vivo no dashboard com kills, deaths, dinheiro e armas.
        </p>
      </div>

      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 space-y-6">
        <h2 className="font-semibold text-lg">1. Onde colocar o arquivo</h2>
        <p className="text-zinc-400 text-sm">
          Copie um arquivo de configuração para a pasta <strong className="text-zinc-300">cfg</strong> do Counter-Strike 2:
        </p>
        <ul className="text-sm text-zinc-400 list-disc list-inside space-y-1">
          <li><strong className="text-zinc-300">Windows (Steam):</strong> <code className="bg-white/10 px-1 rounded">...\Steam\steamapps\common\Counter-Strike Global Offensive\game\csgo\cfg\</code></li>
          <li>Ou: <code className="bg-white/10 px-1 rounded">...\Counter-Strike 2\game\csgo\cfg\</code></li>
        </ul>

        <h2 className="font-semibold text-lg">2. Conteúdo do arquivo</h2>
        <p className="text-zinc-400 text-sm">
          Crie um arquivo chamado <code className="bg-white/10 px-1 rounded">gamestate_integration_cs2preditive.cfg</code> com o conteúdo abaixo. Troque a URL se a API não estiver no mesmo PC (use o IP da máquina da API).
        </p>
        <pre className="bg-black/40 rounded-lg p-4 text-xs text-zinc-300 overflow-x-auto">
{`"CS2 Preditive"
{
  "uri"           "${gsiUrl}"
  "timeout"       "5.0"
  "buffer"        "0.1"
  "throttle"      "0.1"
  "heartbeat"     "30.0"
  "data"
  {
    "provider"             "1"
    "map"                  "1"
    "round"                "1"
    "player_id"            "1"
    "player_state"         "1"
    "player_weapons"       "1"
    "player_match_stats"   "1"
    "allplayers_id"        "1"
    "allplayers_state"     "1"
    "allplayers_weapons"   "1"
    "allplayers_match_stats" "1"
  }
}`}
        </pre>

        <h2 className="font-semibold text-lg">3. URL da API</h2>
        <p className="text-zinc-400 text-sm">
          A API deve receber os dados em: <code className="bg-white/10 px-1 rounded break-all">{gsiUrl}</code>
        </p>
        <ul className="text-sm text-zinc-400 space-y-1">
          <li>• <strong className="text-zinc-300">Mesmo PC:</strong> use <code className="bg-white/10 px-1 rounded">http://localhost:4000/gsi</code></li>
          <li>• <strong className="text-zinc-300">API em outro PC na rede:</strong> use <code className="bg-white/10 px-1 rounded">http://IP_DO_PC:4000/gsi</code></li>
        </ul>

        <h2 className="font-semibold text-lg">4. Ativar</h2>
        <p className="text-zinc-400 text-sm">
          Reinicie o CS2 ou, no console do jogo, execute: <code className="bg-white/10 px-1 rounded">exec gamestate_integration_cs2preditive</code>
        </p>

        <p className="text-zinc-500 text-sm pt-2">
          Depois disso, ao entrar em uma partida, ela aparecerá em &quot;Ao vivo&quot; no dashboard com o badge &quot;Sua partida&quot; e dados em tempo real.
        </p>
      </div>

      <Link
        href="/dashboard"
        className="inline-block rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-black hover:bg-orange-400 transition"
      >
        Voltar ao dashboard
      </Link>
    </div>
  );
}
