import { useMemo, useRef, useState } from 'react';
import type { Stream } from '../types';
import StreamControls from './StreamControls';
import type { DragHandleProps } from './SortableTile';

type Props = {
  stream: Stream;
  parent: string;
  onToggleMute: () => void;
  onToggleMinimize: () => void;
  onToggleHideVideo: () => void;
  onClose: () => void;
  onFocus?: () => void;
  thumbnail?: boolean;
  dragHandle?: DragHandleProps;
};

function embedSrc(username: string, muted: boolean, parent: string) {
  return `https://player.twitch.tv/?channel=${encodeURIComponent(username)}&parent=${encodeURIComponent(parent)}&muted=${muted ? 'true' : 'false'}`;
}

export default function StreamTile({
  stream,
  parent,
  onToggleMute,
  onToggleMinimize,
  onToggleHideVideo,
  onClose,
  onFocus,
  thumbnail = false,
  dragHandle,
}: Props) {
  const src = useMemo(
    () => embedSrc(stream.username, stream.muted, parent),
    [stream.username, stream.muted, parent]
  );
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Swipe-to-close (mobile)
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
    const el = iframeRef.current;
    if (!el) return;
    try {
      const win = el.contentWindow;
      const doc = win?.document;
      const video = doc?.querySelector('video') as HTMLVideoElement | null;
      if (video && 'requestPictureInPicture' in video) {
        await video.requestPictureInPicture();
      } else {
        alert('Picture-in-picture not available for this stream.');
      }
    } catch {
      alert('Picture-in-picture blocked by Twitch iframe.');
    }
  }

  if (stream.minimized) {
    return (
      <div className="relative flex items-center justify-between px-3 py-2 rounded-xl border border-white/10 bg-neutral-900/70 hover:border-white/20 transition-colors group">
        {dragHandle && (
          <button
            ref={dragHandle.ref}
            {...dragHandle.attributes}
            {...dragHandle.listeners}
            className="mr-2 text-neutral-500 hover:text-neutral-200 cursor-grab active:cursor-grabbing"
            aria-label="Drag to reorder"
          >
            ⠿
          </button>
        )}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          <span className="h-2 w-2 rounded-full bg-neutral-500" />
          <span className="truncate text-sm font-medium">{stream.username}</span>
          <span className="text-xs text-neutral-500">(minimized)</span>
        </div>
        <div className="flex gap-1">
          <button
            className="min-h-8 px-2 text-xs rounded-md bg-white/5 hover:bg-white/10 border border-white/10"
            onClick={onToggleMinimize}
          >
            Restore
          </button>
          <button
            className="min-h-8 px-2 text-xs rounded-md bg-white/5 hover:bg-red-600/60 border border-white/10"
            onClick={onClose}
          >
            ✕
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative aspect-video rounded-xl overflow-hidden border border-white/10 bg-black hover:border-white/20 hover:shadow-2xl hover:shadow-black/50 transition-all duration-200 group touch-pan-y"
      style={swipeX ? { transform: `translateX(${swipeX}px)`, opacity: 1 + swipeX / 400 } : undefined}
      onTouchStart={onTouchStart}
      onTouchMove={onTouchMove}
      onTouchEnd={onTouchEnd}
    >
      <iframe
        ref={iframeRef}
        title={`${stream.username} stream`}
        src={src}
        allow="autoplay; fullscreen; picture-in-picture"
        allowFullScreen
        className={
          'w-full h-full border-0 ' +
          (stream.hideVideo ? 'opacity-0 pointer-events-none' : '')
        }
      />

      {stream.hideVideo && (
        <div className="absolute inset-0 flex items-center justify-center bg-neutral-900 text-neutral-400 text-sm pointer-events-none">
          Video hidden — audio still playing
        </div>
      )}

      {/* Top gradient + username */}
      <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-b from-black/70 to-transparent opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none" />
      <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity text-sm font-semibold tracking-tight pointer-events-none">
        {stream.username}
      </div>

      {dragHandle && (
        <button
          ref={dragHandle.ref}
          {...dragHandle.attributes}
          {...dragHandle.listeners}
          className="tile-handle absolute top-2 left-2 z-20 inline-flex items-center justify-center min-h-9 min-w-9 px-2 rounded-md bg-black/60 backdrop-blur text-neutral-200 hover:bg-black/80 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing"
          aria-label="Drag to reorder"
          title="Drag to reorder"
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
