'use client';

import { useEffect, useState, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { matches, predictions, type Match, type Prediction, type BettingLine } from '@/lib/api';
import { useLiveMatches } from '@/lib/socket';

function getMatchSource(match: Match): 'gsi' | 'hltv' | null {
  if (match.id === 'gsi_live') return 'gsi';
  if (match.id.startsWith('hltv_')) return 'hltv';
  return null;
}

export default function DashboardPage() {
  const [matchList, setMatchList] = useState<Match[]>([]);
  const [predictionList, setPredictionList] = useState<Prediction[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const searchParams = useSearchParams();

  useLiveMatches((match) => {
    setMatchList((prev) => {
      const idx = prev.findIndex((m) => m.id === match.id);
      const next = [...prev];
      if (idx >= 0) next[idx] = match as Match;
      else next.push(match as Match);
      return next.filter((m) => m.status === 'live' || m.status === 'scheduled');
    });
  });

  useEffect(() => {
    if (searchParams.get('success') === '1') {
      window.history.replaceState({}, '', '/dashboard');
    }
  }, [searchParams]);

  const fetchMatches = useCallback(() => {
    const token = localStorage.getItem('token');
    if (!token) return Promise.resolve();
    return Promise.all([matches.upcoming(), matches.live(), predictions.list()])
      .then(([upcoming, live, p]) => {
        setPredictionList(p);
        setMatchList((prev) => {
          const byId = new Map<string, Match>();
          prev.forEach((m) => byId.set(m.id, m));
          upcoming.forEach((m) => byId.set(m.id, m));
          live.forEach((m) => byId.set(m.id, m));
          const merged = Array.from(byId.values()).filter(
            (m) => m.status === 'live' || m.status === 'scheduled'
          );
          return merged.sort((a, b) => {
            if (a.status === 'live' && b.status !== 'live') return -1;
            if (a.status !== 'live' && b.status === 'live') return 1;
            return (b.updatedAt || '').localeCompare(a.updatedAt || '');
          });
        });
      })
      .catch((err) => {
        setLoadError(err instanceof Error ? err.message : 'Erro ao carregar partidas.');
      });
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) {
      setLoading(false);
      return;
    }
    setLoadError(null);
    fetchMatches().finally(() => setLoading(false));
  }, [fetchMatches]);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (!token) return;
    const interval = setInterval(() => {
      fetchMatches();
    }, 25_000);
    return () => clearInterval(interval);
  }, [fetchMatches]);

  const liveMatches = matchList.filter((m) => m.status === 'live');
  const scheduledMatches = matchList.filter((m) => m.status === 'scheduled');
  const predMap = new Map(predictionList.map((p) => [p.matchId, p]));
  const isEmpty = liveMatches.length === 0 && scheduledMatches.length === 0;

  const calendarByDate = useMemo(() => {
    const map = new Map<string, Match[]>();
    scheduledMatches.forEach((m) => {
      if (!m.startTime) return;
      const date = m.startTime.slice(0, 10);
      if (!map.has(date)) map.set(date, []);
      map.get(date)!.push(m);
    });
    const entries = Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
    return entries;
  }, [scheduledMatches]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-zinc-400">Carregando partidas...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-zinc-400 text-sm">
          Partidas ao vivo (GSI) e próximos jogos (HLTV). Atualizações em tempo real via WebSocket.
        </p>
      </div>

      {loadError && (
        <div className="rounded-xl border border-amber-500/50 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
          {loadError} Verifique se a API está rodando e tente novamente.
        </div>
      )}

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
        <h2 className="text-lg font-semibold mb-4">Próximos jogos</h2>
        {isEmpty ? (
          <EmptyState />
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {scheduledMatches.map((m) => (
              <MatchCard key={m.id} match={m} prediction={predMap.get(m.id)} />
            ))}
          </div>
        )}
      </section>

      {calendarByDate.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold mb-4">Calendário — próximas datas</h2>
          <div className="space-y-6">
            {calendarByDate.map(([date, games]) => (
              <div key={date} className="rounded-xl border border-[var(--border)] bg-[var(--card)] overflow-hidden">
                <div className="px-4 py-3 bg-white/5 border-b border-[var(--border)] flex items-center justify-between">
                  <span className="font-medium">{formatCalendarDate(date)}</span>
                  <span className="text-sm text-zinc-500">{games.length} jogo(s)</span>
                </div>
                <div className="divide-y divide-[var(--border)]">
                  {games.map((m) => (
                    <Link
                      key={m.id}
                      href={`/dashboard/match/${m.id}`}
                      className="flex items-center justify-between px-4 py-3 hover:bg-white/5 transition"
                    >
                      <span className="font-medium">{m.teamA} vs {m.teamB}</span>
                      <span className="text-sm text-zinc-500">
                        {m.startTime ? new Date(m.startTime).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '—'}
                      </span>
                    </Link>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function EmptyState() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--card)] p-8 md:p-12">
      <div className="max-w-lg mx-auto text-center space-y-6">
        <p className="text-zinc-300">
          Nenhuma partida ao vivo ou agendada no momento.
        </p>
        <div className="text-left rounded-xl bg-white/5 border border-[var(--border)] p-4 space-y-3 text-sm text-zinc-400">
          <p><strong className="text-zinc-200">De onde vêm as partidas?</strong></p>
          <ul className="list-disc list-inside space-y-1">
            <li><strong>HLTV</strong> — a API busca agendados e resultados reais ao iniciar.</li>
            <li><strong>Sua partida (GSI)</strong> — quando você joga CS2 com o GSI configurado, sua partida aparece aqui ao vivo com kills, deaths, dinheiro e armas.</li>
          </ul>
        </div>
        <Link
          href="/dashboard/gsi-setup"
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)]/20 text-[var(--accent)] px-4 py-2 text-sm font-medium hover:bg-[var(--accent)]/30 transition"
        >
          Como conectar minha partida (GSI) →
        </Link>
      </div>
    </div>
  );
}

function formatCalendarDate(iso: string): string {
  const d = new Date(iso);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  d.setHours(0, 0, 0, 0);
  if (d.getTime() === today.getTime()) return 'Hoje';
  if (d.getTime() === tomorrow.getTime()) return 'Amanhã';
  return d.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' });
}

function MatchCard({ match, prediction }: { match: Match; prediction?: Prediction }) {
  const isLive = match.status === 'live';
  const source = getMatchSource(match);
  return (
    <Link href={`/dashboard/match/${match.id}`} className="block">
      <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-6 hover:border-[var(--accent)]/50 transition">
        <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
          <span className="text-xs text-zinc-500 uppercase tracking-wider">
            {match.league || 'CS2'}
          </span>
          <div className="flex items-center gap-2">
            {source === 'gsi' && (
              <span className="text-xs px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Sua partida</span>
            )}
            {source === 'hltv' && (
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-blue-400">HLTV</span>
            )}
            {isLive && (
              <span className="flex items-center gap-1.5 text-xs text-red-400">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                AO VIVO
              </span>
            )}
            {match.status === 'scheduled' && (
              <span className="text-xs text-zinc-500">
                {match.startTime ? new Date(match.startTime).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : 'Agendada'}
              </span>
            )}
          </div>
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
                Odds: {match.teamA} {prediction.odds.teamA}x — {match.teamB} {prediction.odds.teamB}x
              </p>
            )}
            {prediction.lines && prediction.lines.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-2">
                {prediction.lines.slice(0, 3).map((line, i) => (
                  <span key={i} className="text-xs px-2 py-0.5 rounded bg-white/10 text-zinc-400">
                    {line.type === 'handicap' ? 'Handicap' : line.type === 'ht' ? 'HT' : line.type === 'overtime' ? 'OT' : 'Vencedor'}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}
        <p className="text-xs text-[var(--accent)] mt-3 opacity-80">Ver detalhes →</p>
      </div>
    </Link>
  );
}
