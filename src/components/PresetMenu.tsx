import { useEffect, useRef, useState } from 'react';
import type { Preset } from '../hooks/usePresets';

type Props = {
  presets: Preset[];
  currentStreams: string[];
  onSave: (name: string, streams: string[]) => void;
  onRemove: (name: string) => void;
  onLoad: (streams: string[]) => void;
};

export default function PresetMenu({ presets, currentStreams, onSave, onRemove, onLoad }: Props) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    return () => document.removeEventListener('mousedown', onDoc);
  }, [open]);

  function doSave(e: React.FormEvent) {
    e.preventDefault();
    const n = name.trim();
    if (!n || currentStreams.length === 0) return;
    onSave(n, currentStreams);
    setName('');
  }

  return (
    <div className="relative" ref={ref}>
      <button
        className="tb-btn"
        onClick={() => setOpen(v => !v)}
        title="Saved groups of streams"
      >
        ★ Presets
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-72 z-40 rounded-lg border border-white/10 bg-neutral-950 shadow-2xl p-2">
          <div className="text-xs uppercase tracking-wider text-neutral-500 px-1 pb-1">Saved</div>
          {presets.length === 0 ? (
            <div className="text-xs text-neutral-500 px-1 py-2">No presets yet.</div>
          ) : (
            <ul className="max-h-60 overflow-y-auto">
              {presets.map(p => (
                <li key={p.name} className="flex items-center gap-1 px-1 py-1 rounded hover:bg-white/5">
                  <button
                    className="flex-1 min-w-0 text-left"
                    onClick={() => { onLoad(p.streams); setOpen(false); }}
                    title={p.streams.join(', ')}
                  >
                    <div className="text-sm truncate">{p.name}</div>
                    <div className="text-xs text-neutral-500 truncate">
                      {p.streams.join(', ') || '(empty)'}
                    </div>
                  </button>
                  <button
                    className="text-xs text-neutral-500 hover:text-red-400 px-2"
                    onClick={() => onRemove(p.name)}
                    title="Delete preset"
                  >
                    ✕
                  </button>
                </li>
              ))}
            </ul>
          )}
          <form onSubmit={doSave} className="mt-2 flex gap-1 pt-2 border-t border-white/10">
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder={currentStreams.length ? 'Preset name…' : 'Add streams first'}
              disabled={currentStreams.length === 0}
              className="flex-1 min-w-0 px-2 py-1.5 rounded-md bg-white/5 border border-white/10 text-sm disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={!name.trim() || currentStreams.length === 0}
              className="px-2 py-1.5 rounded-md text-sm font-medium bg-[var(--color-accent)] text-black disabled:opacity-40"
            >
              Save
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
