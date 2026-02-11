const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('token');
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(err.message || 'Erro na requisição');
  }
  return res.json();
}

export const auth = {
  login: (email: string, password: string) =>
    api<{ access_token: string; user: { id: string; email: string } }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
  register: (email: string, password: string) =>
    api<{ access_token: string; user: { id: string; email: string } }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

export const users = {
  me: () =>
    api<{
      id: string;
      email: string;
      subscriptionStatus: string | null;
      currentPeriodEnd: string | null;
      hasAccess: boolean;
    }>('/users/me'),
};

export const stripe = {
  createCheckoutSession: (successUrl: string, cancelUrl: string) =>
    api<{ url: string }>('/stripe/create-checkout-session', {
      method: 'POST',
      body: JSON.stringify({ successUrl, cancelUrl }),
    }),
  createPortalSession: (returnUrl: string) =>
    api<{ url: string }>('/stripe/create-portal-session', {
      method: 'POST',
      body: JSON.stringify({ returnUrl }),
    }),
};

export const matches = {
  list: () => api<Array<Match>>('/matches'),
  live: () => api<Array<Match>>('/matches/live'),
  /** Apenas ao vivo + agendadas (para dashboard e calendário) */
  upcoming: () => api<Array<Match>>('/matches/upcoming'),
  one: (id: string) => api<Match>(`/matches/${id}`),
};

export const predictions = {
  list: () => api<Array<Prediction>>('/predictions'),
  forMatch: (matchId: string) => api<Prediction>(`/predictions/${matchId}`),
};

export interface PlayerState {
  name: string;
  team: 'A' | 'B';
  kills: number;
  deaths: number;
  assists: number;
  money: number;
  weapons: string[];
}

export interface RoundState {
  roundNumber: number;
  winner?: 'A' | 'B';
  teamAKills: number;
  teamBKills: number;
}

export interface Match {
  id: string;
  teamA: string;
  teamB: string;
  teamAScore: number;
  teamBScore: number;
  map?: string;
  status: 'live' | 'scheduled' | 'finished';
  league?: string;
  startTime?: string;
  updatedAt: string;
  players?: PlayerState[];
  rounds?: RoundState[];
  currentRound?: number;
  halfTimeScore?: { teamA: number; teamB: number };
}

export interface BettingLine {
  type: 'winner' | 'handicap' | 'ht' | 'overtime';
  label: string;
  options: { label: string; odds: number; pick?: 'teamA' | 'teamB' | 'yes' | 'no'; confidencePercent?: number }[];
  reason?: string;
}

export interface Prediction {
  matchId: string;
  suggestedPick: 'teamA' | 'teamB' | 'skip';
  confidence: number;
  reason: string;
  odds?: { teamA: number; teamB: number };
  lines?: BettingLine[];
}
