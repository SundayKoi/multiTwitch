import { useEffect, useMemo, useRef, useState } from 'react';
import type { Stream } from '../types';
import StreamTile from './StreamTile';
import { computeRects } from '../utils/layout';
import { useTileDrag } from '../hooks/useTileDrag';

type Actions = {
  onToggleMute: (id: string) => void;
  onToggleMinimize: (id: string) => void;
  onToggleHideVideo: (id: string) => void;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onReorder: (fromId: string, toId: string) => void;
};

type Props = {
  streams: Stream[];
  parent: string;
  layout: 'grid' | 'focus' | 'theater';
  focusedId: string | null;
  focusSplit: number;
  setFocusSplit: (n: number) => void;
  actions: Actions;
};

const GAP = 0.6; // percent of container

export default function StreamStage({
  streams,
  parent,
  layout,
  focusedId,
  focusSplit,
  setFocusSplit,
  actions,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [vw, setVw] = useState<number>(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );
  const [dragging, setDragging] = useState(false);

  useEffect(() => {
    const onResize = () => setVw(window.innerWidth);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  // Split active (non-minimized) from minimized streams.
  // Minimized streams render above the stage in their own strip so the stage
  // only needs to position active streams.
  const active = streams.filter(s => !s.minimized);
  const minimized = streams.filter(s => s.minimized);

  const isMobile = vw < 768;
  const isTablet = vw < 1280;

  const rects = useMemo(
    () =>
      computeRects({
        ids: active.map(s => s.id),
        layout,
        focusedId,
        split: focusSplit,
        isMobile,
        isTablet,
      }),
    [active, layout, focusedId, focusSplit, isMobile, isTablet]
  );

  // Divider drag for focus mode
  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const pct = ((e.clientX - r.left) / r.width) * 100;
      setFocusSplit(Math.max(60, Math.min(85, pct)));
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, setFocusSplit]);

  const showDivider = layout === 'focus' && active.length >= 2 && !isMobile;

  const focusedActive =
    focusedId && active.some(s => s.id === focusedId)
      ? focusedId
      : active[0]?.id ?? null;

  const drag = useTileDrag(actions.onReorder);
  const dndEnabled = layout === 'grid' && active.length >= 2;

  return (
    <div className="flex-1 flex flex-col min-h-0">
      {minimized.length > 0 && (
        <div className="px-3 pt-2 flex flex-wrap gap-2">
          {minimized.map(s => (
            <MinimizedBar
              key={s.id}
              stream={s}
              onRestore={() => actions.onToggleMinimize(s.id)}
              onClose={() => actions.onClose(s.id)}
            />
          ))}
        </div>
      )}

      <div
        ref={containerRef}
        className="relative flex-1 m-3 min-h-0"
        style={{ minHeight: 0 }}
      >
        {active.map(s => {
          const r = rects[s.id];
          if (!r) return null;
          const pad = GAP;
          const dragging = drag.isDragging(s.id);
          const over = drag.isOver(s.id);
          const offset = drag.dragOffset(s.id);
          const style: React.CSSProperties = {
            position: 'absolute',
            left: `calc(${r.x}% + ${pad}%)`,
            top: `calc(${r.y}% + ${pad}%)`,
            width: `calc(${r.w}% - ${pad * 2}%)`,
            height: `calc(${r.h}% - ${pad * 2}%)`,
            transition: dragging
              ? 'none'
              : 'left 250ms ease, top 250ms ease, width 250ms ease, height 250ms ease, opacity 200ms ease',
            opacity: r.hidden ? 0 : dragging ? 0.85 : 1,
            pointerEvents: r.hidden ? 'none' : 'auto',
            zIndex: dragging ? 50 : s.id === focusedActive ? 2 : 1,
            transform: offset
              ? `translate(${offset.x}px, ${offset.y}px) scale(1.02)`
              : undefined,
            outline: over ? '2px solid var(--color-accent)' : undefined,
            outlineOffset: over ? '2px' : undefined,
          };
          const isThumbnail = layout !== 'grid' && s.id !== focusedActive;
          return (
            <div key={s.id} style={style} data-stream-tile={s.id}>
              <StreamTile
                stream={s}
                parent={parent}
                thumbnail={isThumbnail}
                dragHandleProps={dndEnabled ? drag.getHandleProps(s.id) : undefined}
                onToggleMute={() => actions.onToggleMute(s.id)}
                onToggleMinimize={() => actions.onToggleMinimize(s.id)}
                onToggleHideVideo={() => actions.onToggleHideVideo(s.id)}
                onClose={() => actions.onClose(s.id)}
                onFocus={() => actions.onFocus(s.id)}
              />
            </div>
          );
        })}

        {showDivider && (
          <div
            role="separator"
            aria-orientation="vertical"
            onMouseDown={() => setDragging(true)}
            className={`absolute top-0 bottom-0 w-2 -ml-1 cursor-col-resize z-10 ${
              dragging ? 'bg-[var(--color-accent)]/80' : 'bg-transparent hover:bg-white/20'
            } transition-colors`}
            style={{ left: `${focusSplit}%` }}
            title="Drag to resize"
          />
        )}
      </div>
    </div>
  );
}

function MinimizedBar({
  stream,
  onRestore,
  onClose,
}: {
  stream: Stream;
  onRestore: () => void;
  onClose: () => void;
}) {
  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-neutral-900/70">
      <span className="h-2 w-2 rounded-full bg-neutral-500" />
      <span className="text-sm font-medium">{stream.username}</span>
      <span className="text-xs text-neutral-500">(minimized)</span>
      <button
        className="min-h-7 px-2 text-xs rounded-md bg-white/5 hover:bg-white/10 border border-white/10"
        onClick={onRestore}
      >
        Restore
      </button>
      <button
        className="min-h-7 px-2 text-xs rounded-md bg-white/5 hover:bg-red-600/60 border border-white/10"
        onClick={onClose}
      >
        ✕
      </button>
    </div>
  );
}
