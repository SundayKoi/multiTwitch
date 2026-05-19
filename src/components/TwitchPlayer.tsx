import { useEffect, useRef } from 'react';

type TwitchPlayerApi = {
  setMuted(m: boolean): void;
  play(): void;
  addEventListener(event: string, cb: () => void): void;
};

// Load the Twitch *Player* SDK (player.twitch.tv) — the bare player, which
// keeps playing when the tab is backgrounded. The heavier Embed SDK
// (embed.twitch.tv) pauses playback on tab/focus changes.
let sdkPromise: Promise<void> | null = null;
function loadSDK(): Promise<void> {
  if (sdkPromise) return sdkPromise;
  sdkPromise = new Promise((resolve, reject) => {
    if (typeof window === 'undefined') return resolve();
    if (window.Twitch?.Player) return resolve();
    const existing = document.querySelector<HTMLScriptElement>('script[data-twitch-player-sdk]');
    if (existing) {
      existing.addEventListener('load', () => resolve());
      existing.addEventListener('error', () => reject(new Error('Twitch SDK failed to load')));
      return;
    }
    const s = document.createElement('script');
    s.src = 'https://player.twitch.tv/js/embed/v1.js';
    s.async = true;
    s.dataset.twitchPlayerSdk = '1';
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
        if (cancelled || !hostRef.current || !window.Twitch?.Player) return;
        const Player = window.Twitch.Player;
        const player = new Player(hostRef.current, {
          width: '100%',
          height: '100%',
          channel,
          parent: [parent],
          muted: latestMuted.current,
          autoplay: true,
        });
        playerRef.current = player;
        player.addEventListener(Player.READY, () => {
          try { player.setMuted(latestMuted.current); } catch { /* ignore */ }
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

  // Safety net: if the player ever pauses on its own, resume it when the
  // tab is visible again. The bare player rarely does this, but cheap.
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState !== 'visible') return;
      try { playerRef.current?.play(); } catch { /* ignore */ }
    };
    document.addEventListener('visibilitychange', onVisible);
    return () => document.removeEventListener('visibilitychange', onVisible);
  }, []);

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
