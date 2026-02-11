'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { matches, predictions, type Match, type Prediction } from '@/lib/api';
import { useLiveMatches } from '@/lib/socket';

export default function DashboardPage() {
  const [matchList, setMatchList] = useState<Match[]>([]);
  const [predictionList, setPredictionList] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const searchParams = useSearchParams();

  useLiveMatches((match) => {
    setMatchList((prev) => {
      const idx = prev.findIndex((m) => m.id === match.id);
      const next = [...prev];
      if (idx >= 0) next[idx] = match;
      else next.push(match);
      return next;
    });
  });

  useEffect(() => {
    if (searchParams.get('success') === '1') {
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    Promise.all([matches.list(), predictions.list()])
      .then(([m, p]) => {
        setMatchList(m);
        setPredictionList(p);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-zinc-400">Carregando partidas...</p>
      </div>
    );
  }

  const liveMatches = matchList.filter((m) => m.status === 'live');
  const scheduled = matchList.filter((m) => m.status === 'scheduled');
  const predMap = new Map(predictionList.map((p) => [p.matchId, p]));

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-zinc-400 text-sm">
          Partidas e previsões em tempo real. Atualizações automáticas via WebSocket.
        </p>
      </div>

      {liveMatches.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Ao vivo
          </h2>
          <div className="grid gap-4 md:grid-cols-2">
            {liveMatches.map((m) => (
              <MatchCard key={m.id} match={m} prediction={predMap.get(m.id)} />
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-lg font-semibold mb-4">Todas as partidas</h2>
        <div className="grid gap-4 md:grid-cols-2">
          {matchList.map((m) => (
            <MatchCard key={m.id} match={m} prediction={predMap.get(m.id)} />
          ))}
        </div>
      </section>

      {matchList.length === 0 && (
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-12 text-center text-zinc-400">
          Nenhuma partida no momento. Em produção, partidas serão alimentadas por integrações (HLTV, Steam API, etc.).
        </div>
      )}
    </div>
  );
}

function MatchCard({ match, prediction }: { match: Match; prediction?: Prediction }) {
  const isLive = match.status === 'live';
  return (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-xs text-zinc-500 uppercase tracking-wider">
          {match.league || 'CS2'}
        </span>
        {isLive && (
          <span className="flex items-center gap-1.5 text-xs text-red-400">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            AO VIVO
          </span>
        )}
        {match.status === 'scheduled' && (
          <span className="text-xs text-zinc-500">Agendada</span>
        )}
      </div>
      <div className="flex items-center justify-between gap-4">
        <div className="flex-1 text-left">
          <p className="font-medium">{match.teamA}</p>
          <p className="text-sm text-zinc-500">{match.map || '—'}</p>
        </div>
        <div className="text-center shrink-0">
          <p className="text-2xl font-bold text-[var(--accent)]">
            {match.teamAScore} × {match.teamBScore}
          </p>
        </div>
        <div className="flex-1 text-right">
          <p className="font-medium">{match.teamB}</p>
        </div>
      </div>
      {prediction && (
        <div className="mt-4 pt-4 border-t border-[var(--border)]">
          <p className="text-xs text-zinc-500 mb-1">Sugestão</p>
          <p className="text-sm">
            {prediction.suggestedPick === 'skip'
              ? 'Aguardar'
              : prediction.suggestedPick === 'teamA'
              ? match.teamA
              : match.teamB}{' '}
            — {Math.round(prediction.confidence * 100)}% confiança
          </p>
          <p className="text-xs text-zinc-500 mt-1">{prediction.reason}</p>
          {prediction.odds && (
            <p className="text-xs text-zinc-500 mt-1">
              Odds estimadas: {match.teamA} {prediction.odds.teamA}x — {match.teamB} {prediction.odds.teamB}x
            </p>
          )}
        </div>
      )}
    </div>
  );
}
