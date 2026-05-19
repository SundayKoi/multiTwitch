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
    const el = document.activeElement as HTMLElement | null;
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
      className="tile-root relative w-full h-full rounded-xl overflow-hidden border border-white/10 bg-black hover:border-white/20 transition-colors duration-150 touch-pan-y"
      style={swipeX ? { transform: `translateX(${swipeX}px)` } : undefined}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      {/* Control bar — kept entirely above the video. Twitch pauses embeds
          that are obscured by other page elements, so nothing may overlap
          the player. */}
      <div className="absolute inset-x-0 top-0 h-9 z-20 flex items-center gap-1 px-1.5 bg-neutral-950 border-b border-white/10">
        {dragHandleProps && (
          <button
            {...dragHandleProps}
            aria-label="Drag to reorder"
            title="Drag to reorder"
            className="shrink-0 inline-flex items-center justify-center h-7 w-7 rounded-md text-neutral-400 hover:text-neutral-100 hover:bg-white/10 cursor-grab active:cursor-grabbing touch-none"
          >
            ⠿
          </button>
        )}
        <span className="min-w-0 flex-1 truncate px-1 text-sm font-semibold tracking-tight">
          {stream.username}
        </span>
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

      {/* Video area — only the player lives here; nothing overlaps it. */}
      <div className="absolute inset-x-0 bottom-0 top-9 bg-black">
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
      </div>
    </div>
  );
}
