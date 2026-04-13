import { useCallback, useEffect, useState } from 'react';

const KEY = 'multitwitch:presets';

export type Preset = { name: string; streams: string[] };

function load(): Preset[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return [];
    const v = JSON.parse(raw);
    if (!Array.isArray(v)) return [];
    return v.filter(
      (p): p is Preset =>
        !!p && typeof p.name === 'string' && Array.isArray(p.streams)
    );
  } catch {
    return [];
  }
}

export function usePresets() {
  const [presets, setPresets] = useState<Preset[]>(load);

  useEffect(() => {
    try { localStorage.setItem(KEY, JSON.stringify(presets)); } catch { /* ignore */ }
  }, [presets]);

  const save = useCallback((name: string, streams: string[]) => {
    setPresets(prev => {
      const others = prev.filter(p => p.name !== name);
      return [...others, { name, streams }].sort((a, b) => a.name.localeCompare(b.name));
    });
  }, []);

  const remove = useCallback((name: string) => {
    setPresets(prev => prev.filter(p => p.name !== name));
  }, []);

  return { presets, save, remove };
}
