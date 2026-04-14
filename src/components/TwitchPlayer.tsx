import { useEffect, useRef } from 'react';

type TwitchPlayerApi = { setMuted(m: boolean): void };

let sdkPromise: Promise<void> | null = null;
function loadSDK(): Promise<void> {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    if (window.Twitch?.Embed) return resolve();
    const existing = document.querySelector<HTMLScriptElement>('script[data-twitch-embed-sdk]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Twitch SDK failed to load')));
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://embed.twitch.tv/embed/v1.js';
    s.async = true;
    s.dataset.twitchEmbedSdk = '1';
    s.onload = () => resolve();
    s.onerror = () => reject(new Error('Twitch SDK failed to load'));
    document.head.appendChild(s);
  });
  return sdkPromise;
}

type Props = {
  channel: string;
  parent: string;
  muted: boolean;
  hidden: boolean;
};

export default function TwitchPlayer({ channel, parent, muted, hidden }: Props) {
  const hostRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<TwitchPlayerApi | null>(null);
  const initStarted = useRef(false);
  const latestMuted = useRef(muted);

  useEffect(() => {
    if (initStarted.current) return;
    initStarted.current = true;
    let cancelled = false;

    loadSDK()
      .then(() => {
        if (cancelled || !hostRef.current || !window.Twitch) return;
        const embed = new window.Twitch.Embed(hostRef.current, {
          width: '100%',
          height: '100%',
          channel,
          parent: [parent],
          muted: latestMuted.current,
          autoplay: true,
          layout: 'video',
          theme: 'dark',
        });
        embed.addEventListener(window.Twitch.Embed.VIDEO_READY, () => {
          try {
            const p = embed.getPlayer() as TwitchPlayerApi;
            playerRef.current = p;
            p.setMuted(latestMuted.current);
          } catch { /* ignore */ }
        });
      })
      .catch(() => { /* ignore */ });

    return () => {
      cancelled = true;
      const el = hostRef.current;
      if (el) el.innerHTML = '';
      playerRef.current = null;
    };
  }, [channel, parent]);

  useEffect(() => {
    latestMuted.current = muted;
    const p = playerRef.current;
    if (p) {
      try { p.setMuted(muted); } catch { /* ignore */ }
    }
  }, [muted]);

  return (
    <div
      ref={hostRef}
      className={
        'absolute inset-0 w-full h-full ' +
        (hidden ? 'opacity-0 pointer-events-none' : '')
      }
    />
  );
}
