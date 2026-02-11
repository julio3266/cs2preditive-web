'use client';

import { useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import type { Match } from './api';

const SOCKET_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

export function useLiveMatches(onMatchUpdate: (match: Match) => void) {
  const callbackRef = useRef(onMatchUpdate);
  callbackRef.current = onMatchUpdate;

  useEffect(() => {
    const socket = io(`${SOCKET_URL}/live`, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
    });
    socket.on('match:update', (match: Match) => {
      callbackRef.current(match);
    });
    return () => {
      socket.disconnect();
    };
  }, []);
}
