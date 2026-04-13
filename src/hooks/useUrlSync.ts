import { useEffect, useRef } from 'react';
import type { AppState, Layout } from '../types';

const LAYOUTS: Layout[] = ['grid', 'focus', 'theater'];

export type UrlState = {
  streams: string[];
  layout: Layout;
  focus: string | null;
  chat: boolean;
};

export function readUrl(): UrlState {
  const p = new URLSearchParams(window.location.search);
  const streams = (p.get('streams') || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean);
  const layoutRaw = p.get('layout') as Layout | null;
  const layout: Layout = layoutRaw && LAYOUTS.includes(layoutRaw) ? layoutRaw : 'grid';
  const focus = p.get('focus');
  const chat = p.get('chat') === '1';
  return { streams, layout, focus, chat };
}

export function buildUrlSearch(state: AppState): string {
  const p = new URLSearchParams();
  if (state.streams.length) {
    p.set('streams', state.streams.map(s => s.username).join(','));
  }
  if (state.layout !== 'grid') p.set('layout', state.layout);
  if (state.focusedId) {
    const focused = state.streams.find(s => s.id === state.focusedId);
    if (focused) p.set('focus', focused.username);
  }
  if (state.chatVisible) p.set('chat', '1');
  const s = p.toString();
  return s ? '?' + s : '';
}

export function useUrlSync(state: AppState) {
  const first = useRef(true);
  useEffect(() => {
    const search = buildUrlSearch(state);
    const next = window.location.pathname + search + window.location.hash;
    if (first.current) {
      first.current = false;
      window.history.replaceState(null, '', next);
    } else {
      window.history.replaceState(null, '', next);
    }
  }, [state]);
}
