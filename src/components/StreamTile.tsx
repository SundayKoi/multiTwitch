import { useRef, useState } from 'react';
import type { Stream } from '../types';
import StreamControls from './StreamControls';
import TwitchPlayer from './TwitchPlayer';

type Props = {
  stream: Stream;
  parent: string;
  thumbnail?: boolean;
  dragHandleProps?: React.HTMLAttributes<HTMLButtonElement>;
  onToggleMute: () => void;
  onToggleMinimize: () => void;
  onToggleHideVideo: () => void;
  onClose: () => void;
  onFocus?: () => void;
};

export default function StreamTile({
  stream,
  parent,
  thumbnail = false,
  dragHandleProps,
  onToggleMute,
  onToggleMinimize,
  onToggleHideVideo,
  onClose,
  onFocus,
}: Props) {
  const swipe = useRef<{ x: number; y: number } | null>(null);
  const [swipeX, setSwipeX] = useState(0);

  function onTouchStart(e: React.TouchEvent) {
    const t = e.touches[0];
    swipe.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchMove(e: React.TouchEvent) {
    if (!swipe.current) return;
    const dx = e.touches[0].clientX - swipe.current.x;
    const dy = Math.abs(e.touches[0].clientY - swipe.current.y);
    if (dy < 40 && dx < 0) setSwipeX(dx);
  }
  function onTouchEnd() {
    if (swipeX < -120) {
      setSwipeX(0);
      swipe.current = null;
      onClose();
      return;
    }
    setSwipeX(0);
    swipe.current = null;
  }

  async function pip() {
    const el = (document.activeElement as HTMLElement | null);
    const iframe = el?.closest('.tile-root')?.querySelector('iframe') as HTMLIFrameElement | null;
    if (!iframe) return;
    try {
      const video = iframe.contentWindow?.document?.querySelector('video') as HTMLVideoElement | null;
      if (video && 'requestPictureInPicture' in video) await video.requestPictureInPicture();
      else alert('Picture-in-picture not available for this stream.');
    } catch {
      alert('Picture-in-picture blocked by Twitch iframe.');
    }
  }

  return (
    <div
      className="tile-root relative w-full h-full rounded-xl overflow-hidden border border-white/10 bg-black hover:border-white/20 hover:shadow-2xl hover:shadow-black/50 transition-colors duration-150 group touch-pan-y"
      style={swipeX ? { transform: `translateX(${swipeX}px)` } : undefined}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <TwitchPlayer
        channel={stream.username}
        parent={parent}
        muted={stream.muted}
        hidden={stream.hideVideo}
      />

      {stream.hideVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 text-neutral-400 text-sm pointer-events-none">
          Video hidden — audio still playing
        </div>
      )}

      <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-semibold tracking-tight pointer-events-none">
        {stream.username}
      </div>

      {dragHandleProps && (
        <button
          {...dragHandleProps}
          aria-label="Drag to reorder"
          title="Drag to reorder"
          className="absolute top-2 left-2 z-20 inline-flex items-center justify-center min-h-9 min-w-9 px-2 rounded-md bg-black/60 backdrop-blur text-neutral-200 hover:bg-black/80 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing touch-none"
        >
          ⠿
        </button>
      )}

      <StreamControls
        stream={stream}
        onToggleMute={onToggleMute}
        onToggleMinimize={onToggleMinimize}
        onToggleHideVideo={onToggleHideVideo}
        onClose={onClose}
        onFocus={thumbnail ? onFocus : undefined}
        onPip={pip}
      />
    </div>
  );
}
