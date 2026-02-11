'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { matches, predictions, type Match, type Prediction, type BettingLine } from '@/lib/api';
import { useLiveMatches } from '@/lib/socket';

export default function MatchDetailPage() {
  const params = useParams();
  const id = params?.id as string;
  const [match, setMatch] = useState<Match | null>(null);
  const [prediction, setPrediction] = useState<Prediction | null>(null);
  const [loading, setLoading] = useState(true);

  useLiveMatches((updated) => {
    if (updated.id === id) {
      setMatch(updated as Match);
      predictions.forMatch(id).then(setPrediction).catch(() => {});
    }
  });

  useEffect(() => {
    if (!id) return;
    Promise.all([matches.one(id), predictions.forMatch(id).catch(() => null)])
      .then(([m, p]) => {
        setMatch(m);
        setPrediction(p || null);
      })
      .catch(() => setMatch(null))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-zinc-400">Carregando partida...</p>
      </div>
    );
  }

  if (!match) {
    return (
      <div className="text-center py-12">
        <p className="text-zinc-400 mb-4">Partida não encontrada.</p>
        <Link href="/dashboard" className="text-[var(--accent)] hover:underline">Voltar ao dashboard</Link>
      </div>
    );
  }

  const isLive = match.status === 'live';
  const teamAPlayers = match.players?.filter((p) => p.team === 'A') ?? [];
  const teamBPlayers = match.players?.filter((p) => p.team === 'B') ?? [];
  const isGsi = match.id === 'gsi_live';
  const isHltv = match.id.startsWith('hltv_');
  const hasDetailedStats = match.players && match.players.length > 0;

  return (
    <div className="space-y-8">
      <div className="flex items-center gap-4">
        <Link href="/dashboard" className="text-zinc-400 hover:text-white text-sm">← Dashboard</Link>
      </div>

      <header className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">{match.league || 'CS2'}</span>
          <div className="flex items-center gap-2">
            {isGsi && (
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Sua partida (GSI)</span>
            )}
            {isHltv && (
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">HLTV</span>
            )}
            {isLive && (
              <span className="flex items-center gap-1.5 text-xs text-red-400">
                <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                AO VIVO
              </span>
            )}
            {match.status === 'scheduled' && (
              <span className="text-sm text-zinc-500">
                {match.startTime ? new Date(match.startTime).toLocaleString('pt-BR') : 'Agendada'}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center justify-between gap-6">
          <div className="flex-1 text-left">
            <h1 className="text-2xl font-bold">{match.teamA}</h1>
            <p className="text-zinc-500">{match.map || 'Mapa a definir'}</p>
          </div>
          <div className="text-4xl font-bold text-[var(--accent)] shrink-0">
            {match.teamAScore} × {match.teamBScore}
          </div>
          <div className="flex-1 text-right">
            <h1 className="text-2xl font-bold">{match.teamB}</h1>
          </div>
        </div>
        {match.halfTimeScore !== undefined && (
          <p className="text-sm text-zinc-500 mt-2 text-center">
            Placar 1º tempo (HT): {match.halfTimeScore.teamA} × {match.halfTimeScore.teamB}
          </p>
        )}
      </header>

      {match.players && match.players.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Jogadores em tempo real</h2>
          <div className="grid md:grid-cols-2 gap-6">
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
              <div className="px-4 py-2 bg-white/5 border-b border-[var(--border)] font-medium">
                {match.teamA}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-zinc-500 border-b border-[var(--border)]">
                      <th className="text-left p-3">Jogador</th>
                      <th className="p-3">K</th>
                      <th className="p-3">D</th>
                      <th className="p-3">A</th>
                      <th className="p-3">$</th>
                      <th className="text-left p-3">Armas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamAPlayers.map((p) => (
                      <tr key={p.name} className="border-b border-[var(--border)]/50">
                        <td className="p-3 font-medium">{p.name}</td>
                        <td className="p-3 text-green-400">{p.kills}</td>
                        <td className="p-3 text-red-400">{p.deaths}</td>
                        <td className="p-3 text-zinc-400">{p.assists}</td>
                        <td className="p-3 text-yellow-500">${p.money}</td>
                        <td className="p-3 text-zinc-500 text-xs">{p.weapons.join(', ') || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
              <div className="px-4 py-2 bg-white/5 border-b border-[var(--border)] font-medium">
                {match.teamB}
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-zinc-500 border-b border-[var(--border)]">
                      <th className="text-left p-3">Jogador</th>
                      <th className="p-3">K</th>
                      <th className="p-3">D</th>
                      <th className="p-3">A</th>
                      <th className="p-3">$</th>
                      <th className="text-left p-3">Armas</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teamBPlayers.map((p) => (
                      <tr key={p.name} className="border-b border-[var(--border)]/50">
                        <td className="p-3 font-medium">{p.name}</td>
                        <td className="p-3 text-green-400">{p.kills}</td>
                        <td className="p-3 text-red-400">{p.deaths}</td>
                        <td className="p-3 text-zinc-400">{p.assists}</td>
                        <td className="p-3 text-yellow-500">${p.money}</td>
                        <td className="p-3 text-zinc-500 text-xs">{p.weapons.join(', ') || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      {match.rounds && match.rounds.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Rounds</h2>
          <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
            <div className="overflow-x-auto max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-[var(--card)]">
                  <tr className="text-zinc-500 border-b border-[var(--border)]">
                    <th className="text-left p-3">Round</th>
                    <th className="p-3">{match.teamA}</th>
                    <th className="p-3">{match.teamB}</th>
                    <th className="p-3">Vencedor</th>
                  </tr>
                </thead>
                <tbody>
                  {match.rounds.map((r) => (
                    <tr key={r.roundNumber} className="border-b border-[var(--border)]/50">
                      <td className="p-3 font-medium">{r.roundNumber}</td>
                      <td className="p-3">{r.teamAKills}</td>
                      <td className="p-3">{r.teamBKills}</td>
                      <td className="p-3">
                        {r.winner === 'A' ? match.teamA : r.winner === 'B' ? match.teamB : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {prediction && prediction.lines && prediction.lines.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Linhas de aposta (palpites em tempo real)</h2>
          <div className="space-y-4">
            {prediction.lines.map((line, i) => (
              <LineCard key={i} line={line} teamA={match.teamA} teamB={match.teamB} />
            ))}
          </div>
        </section>
      )}

      {!hasDetailedStats && match.status === 'scheduled' && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-zinc-500">
          Detalhes dos jogadores e rounds aparecerão quando a partida começar (ao vivo).
        </div>
      )}

      {!hasDetailedStats && match.status === 'live' && isHltv && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-8 text-center text-zinc-500">
          Estatísticas detalhadas (kills, deaths, dinheiro, armas) estão disponíveis apenas para partidas conectadas via <strong>GSI</strong> (sua partida no PC). Partidas da HLTV trazem apenas placar e evento.
        </div>
      )}

      {!hasDetailedStats && match.status === 'finished' && isHltv && (
        <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 text-center text-zinc-500 text-sm">
          Resultado final da HLTV. Para ver jogadores e rounds em tempo real, use o GSI na sua partida.
        </div>
      )}
    </div>
  );
}

function LineCard({ line, teamA, teamB }: { line: BettingLine; teamA: string; teamB: string }) {
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4">
      <p className="text-sm font-medium mb-2">{line.label}</p>
      {line.reason && <p className="text-xs text-zinc-500 mb-3">{line.reason}</p>}
      <div className="flex flex-wrap gap-3">
        {line.options.map((opt, j) => (
          <div
            key={j}
            className="flex items-center gap-3 rounded-lg bg-white/5 px-4 py-2 border border-[var(--border)]"
          >
            <span className="font-medium">{opt.label}</span>
            <span className="text-[var(--accent)]">{opt.odds}x</span>
            {opt.confidencePercent !== undefined && (
              <span className="text-xs text-zinc-400">{opt.confidencePercent}% chance</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
