import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type { AppState, Layout, Stream } from './types';
import { isValidUsername, normalizeUsername } from './utils/validation';
import { readUrl, useUrlSync } from './hooks/useUrlSync';
import Toolbar from './components/Toolbar';
import StreamStage from './components/StreamStage';
import ChatPanel from './components/ChatPanel';
import EmptyState from './components/EmptyState';
import PresetMenu from './components/PresetMenu';
import { usePresets } from './hooks/usePresets';

const RECENT_KEY = 'multitwitch:recent';
const SPLIT_KEY = 'multitwitch:focusSplit';
const MAX_RECENT = 8;

function makeStream(username: string): Stream {
  return {
    id: `${username}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    username,
    minimized: false,
    muted: true, // autoplay policies require muted
    hideVideo: false,
  };
}

function loadRecent(): string[] {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    if (!raw) return [];
    const v = JSON.parse(raw);
    return Array.isArray(v) ? v.filter(x => typeof x === 'string') : [];
  } catch {
    return [];
  }
}

function saveRecent(list: string[]) {
  try {
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, MAX_RECENT)));
  } catch { /* ignore */ }
}

function loadSplit(): number {
  try {
    const raw = localStorage.getItem(SPLIT_KEY);
    const n = raw ? parseFloat(raw) : NaN;
    if (!Number.isFinite(n)) return 75;
    return Math.max(60, Math.min(85, n));
  } catch {
    return 75;
  }
}

export default function App() {
  const parent = typeof window !== 'undefined' ? window.location.hostname || 'localhost' : 'localhost';

  const [state, setState] = useState<AppState>(() => {
    const url = readUrl();
    const streams = url.streams
      .filter(isValidUsername)
      .map(makeStream);
    const focused = url.focus && isValidUsername(url.focus)
      ? streams.find(s => s.username === url.focus)?.id ?? null
      : null;
    return {
      streams,
      focusedId: focused,
      layout: url.layout,
      chatVisible: url.chat,
      chatUsername: focused
        ? streams.find(s => s.id === focused)?.username ?? null
        : streams[0]?.username ?? null,
      focusSplit: loadSplit(),
    };
  });

  const [recent, setRecent] = useState<string[]>(loadRecent);
  const inputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);
  const { presets, save: savePreset, remove: removePreset } = usePresets();

  useUrlSync(state);

  useEffect(() => {
    saveRecent(recent);
  }, [recent]);

  useEffect(() => {
    try { localStorage.setItem(SPLIT_KEY, String(state.focusSplit)); } catch { /* ignore */ }
  }, [state.focusSplit]);

  const addStream = useCallback(
    (raw: string): { ok: boolean; error?: string } => {
      const username = normalizeUsername(raw);
      if (!isValidUsername(username)) return { ok: false, error: 'Invalid username' };
      let added = false;
      setState(prev => {
        if (prev.streams.some(s => s.username === username)) {
          return prev;
        }
        added = true;
        const s = makeStream(username);
        return {
          ...prev,
          streams: [...prev.streams, s],
          chatUsername: prev.chatUsername ?? username,
        };
      });
      if (!added) return { ok: false, error: 'Already added' };
      setRecent(prev => [username, ...prev.filter(n => n !== username)].slice(0, MAX_RECENT));
      return { ok: true };
    },
    []
  );

  const closeStream = useCallback((id: string) => {
    setState(prev => {
      const streams = prev.streams.filter(s => s.id !== id);
      const focusedId = prev.focusedId === id ? null : prev.focusedId;
      const removed = prev.streams.find(s => s.id === id);
      const chatUsername =
        removed && prev.chatUsername === removed.username
          ? streams[0]?.username ?? null
          : prev.chatUsername;
      return { ...prev, streams, focusedId, chatUsername };
    });
  }, []);

  const mutate = (id: string, fn: (s: Stream) => Stream) =>
    setState(prev => ({
      ...prev,
      streams: prev.streams.map(s => (s.id === id ? fn(s) : s)),
    }));

  const actions = useMemo(
    () => ({
      onToggleMute: (id: string) => mutate(id, s => ({ ...s, muted: !s.muted })),
      onToggleMinimize: (id: string) => mutate(id, s => ({ ...s, minimized: !s.minimized })),
      onToggleHideVideo: (id: string) => mutate(id, s => ({ ...s, hideVideo: !s.hideVideo })),
      onClose: closeStream,
      onFocus: (id: string) =>
        setState(prev => {
          const s = prev.streams.find(x => x.id === id);
          return {
            ...prev,
            focusedId: id,
            chatUsername: s?.username ?? prev.chatUsername,
          };
        }),
      onReorder: (fromId: string, toId: string) =>
        setState(prev => {
          const from = prev.streams.findIndex(s => s.id === fromId);
          const to = prev.streams.findIndex(s => s.id === toId);
          if (from < 0 || to < 0 || from === to) return prev;
          const next = prev.streams.slice();
          const [moved] = next.splice(from, 1);
          next.splice(to, 0, moved);
          return { ...prev, streams: next };
        }),
    }),
    [closeStream]
  );

  const loadPreset = useCallback((usernames: string[]) => {
    setState(prev => {
      const existing = new Map(prev.streams.map(s => [s.username, s]));
      const streams = usernames
        .filter(isValidUsername)
        .map(u => existing.get(u) ?? makeStream(u));
      return {
        ...prev,
        streams,
        focusedId: streams[0]?.id ?? null,
        chatUsername: streams[0]?.username ?? null,
      };
    });
    setRecent(prev => {
      const merged = [...usernames, ...prev];
      return Array.from(new Set(merged)).slice(0, MAX_RECENT);
    });
  }, []);

  const setLayout = useCallback((layout: Layout) => {
    setState(prev => {
      let focusedId = prev.focusedId;
      if ((layout === 'focus' || layout === 'theater') && !focusedId) {
        focusedId = prev.streams[0]?.id ?? null;
      }
      return { ...prev, layout, focusedId };
    });
  }, []);

  const setFocusSplit = useCallback(
    (n: number) => setState(prev => ({ ...prev, focusSplit: n })),
    []
  );

  const muteAll = () =>
    setState(prev => ({ ...prev, streams: prev.streams.map(s => ({ ...s, muted: true })) }));
  const unmuteAll = () =>
    setState(prev => ({ ...prev, streams: prev.streams.map(s => ({ ...s, muted: false })) }));

  const toggleChat = () =>
    setState(prev => ({
      ...prev,
      chatVisible: !prev.chatVisible,
      chatUsername: prev.chatUsername ?? prev.streams[0]?.username ?? null,
    }));

  const clearAll = () => {
    if (!confirm('Remove all streams?')) return;
    setState(prev => ({ ...prev, streams: [], focusedId: null, chatUsername: null }));
  };

  const focusInput = () => inputRef.current?.focus();

  const share = async () => {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      setToast('Link copied');
    } catch {
      setToast(url);
    }
    setTimeout(() => setToast(null), 2000);
  };

  // Keyboard shortcuts
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null;
      if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) {
        if (e.key === 'Escape') (t as HTMLInputElement).blur();
        return;
      }
      if (e.key === 'm') muteAll();
      else if (e.key === 'u') unmuteAll();
      else if (e.key === '/') {
        e.preventDefault();
        focusInput();
      } else if (e.key === 'Escape' && state.layout !== 'grid') {
        setLayout('grid');
      } else if (/^[1-9]$/.test(e.key)) {
        const i = parseInt(e.key, 10) - 1;
        const s = state.streams[i];
        if (s) {
          setState(prev => ({ ...prev, focusedId: s.id, chatUsername: s.username }));
          if (state.layout === 'grid') setLayout('focus');
        }
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [state.streams, state.layout, setLayout]);

  const hasStreams = state.streams.length > 0;

  return (
    <div className="flex flex-col h-full min-h-screen">
      <Toolbar
        ref={inputRef}
        streams={state.streams}
        layout={state.layout}
        chatVisible={state.chatVisible}
        onAdd={addStream}
        onMuteAll={muteAll}
        onUnmuteAll={unmuteAll}
        onLayoutChange={setLayout}
        onToggleChat={toggleChat}
        onShare={share}
        onClearAll={clearAll}
        presetSlot={
          <PresetMenu
            presets={presets}
            currentStreams={state.streams.map(s => s.username)}
            onSave={savePreset}
            onRemove={removePreset}
            onLoad={loadPreset}
          />
        }
      />
      <main className="flex-1 flex flex-col lg:flex-row min-h-0">
        {hasStreams ? (
          <StreamStage
            streams={state.streams}
            parent={parent}
            layout={state.layout}
            focusedId={state.focusedId}
            focusSplit={state.focusSplit}
            setFocusSplit={setFocusSplit}
            actions={actions}
          />
        ) : (
          <EmptyState
            onPick={name => addStream(name)}
            focusInput={focusInput}
            recent={recent}
          />
        )}
        {state.chatVisible && (
          <ChatPanel
            streams={state.streams}
            chatUsername={state.chatUsername}
            parent={parent}
            onClose={toggleChat}
            onPick={name => setState(prev => ({ ...prev, chatUsername: name }))}
          />
        )}
      </main>

      {toast && (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 px-4 py-2 rounded-md bg-neutral-900 border border-white/15 text-sm shadow-xl">
          {toast}
        </div>
      )}

      <footer className="text-[11px] text-neutral-500 text-center py-2 border-t border-white/5">
        multitwitch — unofficial, zero-backend. Press <kbd className="px-1 rounded bg-white/5 border border-white/10">/</kbd> to add a stream,
        <kbd className="mx-1 px-1 rounded bg-white/5 border border-white/10">m</kbd>/<kbd className="px-1 rounded bg-white/5 border border-white/10">u</kbd> mute/unmute all,
        <kbd className="mx-1 px-1 rounded bg-white/5 border border-white/10">1–9</kbd> focus stream,
        <kbd className="mx-1 px-1 rounded bg-white/5 border border-white/10">esc</kbd> back to grid.
      </footer>
    </div>
  );
}
