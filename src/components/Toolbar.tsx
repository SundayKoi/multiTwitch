import { forwardRef, useState, type ReactNode } from 'react';
import type { Layout, Stream } from '../types';
import { isValidUsername, normalizeUsername } from '../utils/validation';

type Props = {
  streams: Stream[];
  layout: Layout;
  chatVisible: boolean;
  onAdd: (username: string) => { ok: boolean; error?: string };
  onMuteAll: () => void;
  onUnmuteAll: () => void;
  onLayoutChange: (l: Layout) => void;
  onToggleChat: () => void;
  onShare: () => void;
  onClearAll: () => void;
  presetSlot?: ReactNode;
};

const Toolbar = forwardRef<HTMLInputElement, Props>(function Toolbar(
  {
    streams,
    layout,
    chatVisible,
    onAdd,
    onMuteAll,
    onUnmuteAll,
    onLayoutChange,
    onToggleChat,
    onShare,
    onClearAll,
    presetSlot,
  },
  ref
) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const name = normalizeUsername(value);
    if (!name) return;
    if (!isValidUsername(name)) {
      setError('Invalid username (4–25 chars, a–z, 0–9, _)');
      return;
    }
    const res = onAdd(name);
    if (!res.ok) {
      setError(res.error || 'Could not add');
      return;
    }
    setValue('');
    setError(null);
  }

  return (
    <header className="sticky top-0 z-30 bg-[#0a0a0a]/90 backdrop-blur border-b border-white/10">
      <div className="flex flex-wrap items-center gap-2 px-3 py-2">
        <div className="flex items-center gap-2 mr-2">
          <div className="h-6 w-6 rounded bg-accent/90" style={{ background: 'var(--color-accent)' }} />
          <span className="font-semibold tracking-tight">multitwitch</span>
        </div>

        <form onSubmit={submit} className="flex items-center gap-1 flex-1 min-w-[220px]">
          <input
            ref={ref}
            value={value}
            onChange={e => {
              setValue(e.target.value);
              if (error) setError(null);
            }}
            placeholder="Add Twitch username…"
            spellCheck={false}
            autoCapitalize="off"
            autoCorrect="off"
            className="flex-1 min-w-0 px-3 py-2 rounded-md bg-white/5 border border-white/10 focus:border-[var(--color-accent)] focus:outline-none text-sm"
          />
          <button
            type="submit"
            className="px-3 py-2 rounded-md text-sm font-medium bg-[var(--color-accent)] text-black hover:brightness-110"
          >
            Add
          </button>
        </form>

        <div className="flex items-center gap-1">
          <select
            value={layout}
            onChange={e => onLayoutChange(e.target.value as Layout)}
            className="px-2 py-2 rounded-md border border-white/10 text-sm text-neutral-100"
            style={{ backgroundColor: '#1a1a1a', colorScheme: 'dark' }}
            title="Layout"
          >
            <option value="grid" style={{ background: '#1a1a1a', color: '#f5f5f5' }}>Grid</option>
            <option value="focus" style={{ background: '#1a1a1a', color: '#f5f5f5' }}>Focus</option>
            <option value="theater" style={{ background: '#1a1a1a', color: '#f5f5f5' }}>Theater</option>
          </select>
          <button className="tb-btn" onClick={onMuteAll} title="Mute all (m)">🔇 All</button>
          <button className="tb-btn" onClick={onUnmuteAll} title="Unmute all (u)">🔊 All</button>
          <button
            className={'tb-btn ' + (chatVisible ? 'tb-btn-active' : '')}
            onClick={onToggleChat}
            title="Toggle chat"
          >
            💬 Chat
          </button>
          <button className="tb-btn" onClick={onShare} title="Copy shareable link">🔗 Share</button>
          {presetSlot}
          {streams.length > 0 && (
            <button
              className="tb-btn hover:!bg-red-600/30"
              onClick={onClearAll}
              title="Remove all streams"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="px-3 pb-2 text-xs text-red-400">{error}</div>
      )}
      {streams.length >= 6 && (
        <div className="px-3 pb-2 text-xs text-amber-400/90">
          Heads up: {streams.length} streams — browser performance may suffer past ~6.
        </div>
      )}

      <style>{`
        .tb-btn {
          padding: 0.5rem 0.625rem;
          border-radius: 0.375rem;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.1);
          font-size: 0.8125rem;
          line-height: 1;
          color: #e5e5e5;
          transition: background 0.15s, border-color 0.15s;
        }
        .tb-btn:hover { background: rgba(255,255,255,0.08); border-color: rgba(255,255,255,0.2); }
        .tb-btn-active { background: rgba(0,229,160,0.15); border-color: rgba(0,229,160,0.4); color: white; }
      `}</style>
    </header>
  );
});

export default Toolbar;
