import { useEffect, useRef, useState } from 'react';

const LINKS = [
  {
    name: 'uBlock Origin',
    desc: 'General ad blocker, works on Twitch with default filters.',
    url: 'https://ublockorigin.com/',
  },
  {
    name: 'TTV Ad Block (browser ext.)',
    desc: 'Dedicated Twitch ad blocker. Search your browser store.',
    url: 'https://github.com/pixeltris/TwitchAdSolutions',
  },
  {
    name: 'Alternate Player for Twitch.tv',
    desc: 'Replaces the player and skips most ads. Chrome/Firefox.',
    url: 'https://chromewebstore.google.com/detail/alternate-player-for-twit/bhplkbgoehhhddaoolmakpocnenplmhf',
  },
  {
    name: 'Twitch Turbo',
    desc: 'Official, paid — ad-free across all of Twitch.',
    url: 'https://www.twitch.tv/turbo',
  },
];

export default function AdBlockHelp() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        className="tb-btn"
        onClick={() => setOpen(v => !v)}
        title="How to block Twitch ads"
      >
        🚫 Ads
      </button>
      {open && (
        <div className="absolute right-0 mt-1 w-80 z-40 rounded-lg border border-white/10 bg-neutral-950 shadow-2xl p-3 text-sm">
          <div className="font-semibold mb-1">Blocking Twitch ads</div>
          <p className="text-xs text-neutral-400 mb-3">
            This app can't block ads inside Twitch's player (cross-origin iframe).
            Install one of these at the browser level — it'll work here too.
          </p>
          <ul className="space-y-2">
            {LINKS.map(l => (
              <li key={l.url}>
                <a
                  href={l.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block rounded-md px-2 py-1.5 hover:bg-white/5"
                >
                  <div className="text-sm font-medium text-neutral-100">{l.name} ↗</div>
                  <div className="text-xs text-neutral-500">{l.desc}</div>
                </a>
              </li>
            ))}
          </ul>
          <div className="mt-3 pt-2 border-t border-white/10 text-xs text-neutral-400">
            In-app workarounds during ads: press <kbd className="px-1 rounded bg-white/10 border border-white/10">m</kbd> to
            mute all, use <span className="text-neutral-200">Hide Video</span> to keep audio,
            or <span className="text-neutral-200">Minimize</span> to fully stop the stream.
          </div>
        </div>
      )}
    </div>
  );
}
