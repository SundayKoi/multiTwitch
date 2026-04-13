import { useEffect, useRef, useState } from 'react';
import {
  DndContext,
  PointerSensor,
  TouchSensor,
  closestCenter,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
} from '@dnd-kit/sortable';
import type { Stream } from '../types';
import StreamTile from './StreamTile';
import SortableTile from './SortableTile';
import { getGridClasses, getMaxWidth } from '../utils/grid';

type Actions = {
  onToggleMute: (id: string) => void;
  onToggleMinimize: (id: string) => void;
  onToggleHideVideo: (id: string) => void;
  onClose: (id: string) => void;
  onFocus: (id: string) => void;
  onReorder: (ids: string[]) => void;
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

export default function StreamGrid({
  streams,
  parent,
  layout,
  focusedId,
  focusSplit,
  setFocusSplit,
  actions,
}: Props) {
  if (layout === 'theater') {
    const focused = streams.find(s => s.id === focusedId) || streams[0];
    if (!focused) return null;
    return (
      <div className="flex-1 p-4">
        <StreamTile
          stream={focused}
          parent={parent}
          onToggleMute={() => actions.onToggleMute(focused.id)}
          onToggleMinimize={() => actions.onToggleMinimize(focused.id)}
          onToggleHideVideo={() => actions.onToggleHideVideo(focused.id)}
          onClose={() => actions.onClose(focused.id)}
        />
      </div>
    );
  }

  if (layout === 'focus' && streams.length >= 2) {
    const focused = streams.find(s => s.id === focusedId) || streams[0];
    const rest = streams.filter(s => s.id !== focused.id);
    return (
      <FocusLayout
        focused={focused}
        rest={rest}
        parent={parent}
        split={focusSplit}
        setSplit={setFocusSplit}
        actions={actions}
      />
    );
  }

  return (
    <GridLayout streams={streams} parent={parent} actions={actions} />
  );
}

function GridLayout({
  streams,
  parent,
  actions,
}: {
  streams: Stream[];
  parent: string;
  actions: Actions;
}) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 8 } })
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    const ids = streams.map(s => s.id);
    const from = ids.indexOf(active.id as string);
    const to = ids.indexOf(over.id as string);
    if (from < 0 || to < 0) return;
    actions.onReorder(arrayMove(ids, from, to));
  }

  const count = streams.length;
  const gridClasses = getGridClasses(count);
  const mw = getMaxWidth(count);

  return (
    <div className={`flex-1 p-4 w-full mx-auto ${mw}`}>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={streams.map(s => s.id)} strategy={rectSortingStrategy}>
          <div className={`grid gap-3 ${gridClasses}`}>
            {streams.map(s => (
              <SortableTile key={s.id} id={s.id}>
                {handle => (
                  <StreamTile
                    stream={s}
                    parent={parent}
                    dragHandle={handle}
                    onToggleMute={() => actions.onToggleMute(s.id)}
                    onToggleMinimize={() => actions.onToggleMinimize(s.id)}
                    onToggleHideVideo={() => actions.onToggleHideVideo(s.id)}
                    onClose={() => actions.onClose(s.id)}
                  />
                )}
              </SortableTile>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}

function FocusLayout({
  focused,
  rest,
  parent,
  split,
  setSplit,
  actions,
}: {
  focused: Stream;
  rest: Stream[];
  parent: string;
  split: number;
  setSplit: (n: number) => void;
  actions: Actions;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragging, setDragging] = useState(false);
  const [isMobile, setIsMobile] = useState(
    typeof window !== 'undefined' ? window.innerWidth < 1024 : false
  );

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    if (!dragging) return;
    const onMove = (e: MouseEvent) => {
      const el = containerRef.current;
      if (!el) return;
      const r = el.getBoundingClientRect();
      const pct = ((e.clientX - r.left) / r.width) * 100;
      setSplit(Math.max(60, Math.min(85, pct)));
    };
    const onUp = () => setDragging(false);
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [dragging, setSplit]);

  if (isMobile) {
    return (
      <div className="flex-1 flex flex-col p-3 gap-3 min-h-0">
        <div className="w-full">
          <StreamTile
            stream={focused}
            parent={parent}
            onToggleMute={() => actions.onToggleMute(focused.id)}
            onToggleMinimize={() => actions.onToggleMinimize(focused.id)}
            onToggleHideVideo={() => actions.onToggleHideVideo(focused.id)}
            onClose={() => actions.onClose(focused.id)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-2">
          {rest.map(s => (
            <div key={s.id} className="w-64 shrink-0">
              <StreamTile
                stream={s}
                parent={parent}
                thumbnail
                onToggleMute={() => actions.onToggleMute(s.id)}
                onToggleMinimize={() => actions.onToggleMinimize(s.id)}
                onToggleHideVideo={() => actions.onToggleHideVideo(s.id)}
                onClose={() => actions.onClose(s.id)}
                onFocus={() => actions.onFocus(s.id)}
              />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div ref={containerRef} className="flex-1 flex p-3 gap-0 min-h-0">
      <div style={{ width: `${split}%` }} className="pr-2 min-w-0">
        <StreamTile
          stream={focused}
          parent={parent}
          onToggleMute={() => actions.onToggleMute(focused.id)}
          onToggleMinimize={() => actions.onToggleMinimize(focused.id)}
          onToggleHideVideo={() => actions.onToggleHideVideo(focused.id)}
          onClose={() => actions.onClose(focused.id)}
        />
      </div>
      <div
        role="separator"
        aria-orientation="vertical"
        className={`w-1.5 cursor-col-resize rounded-full mx-1 ${dragging ? 'bg-[var(--color-accent)]' : 'bg-white/10 hover:bg-white/30'} transition-colors`}
        onMouseDown={() => setDragging(true)}
      />
      <div style={{ width: `${100 - split}%` }} className="pl-2 flex flex-col gap-2 overflow-y-auto min-w-0">
        {rest.map(s => (
          <StreamTile
            key={s.id}
            stream={s}
            parent={parent}
            thumbnail
            onToggleMute={() => actions.onToggleMute(s.id)}
            onToggleMinimize={() => actions.onToggleMinimize(s.id)}
            onToggleHideVideo={() => actions.onToggleHideVideo(s.id)}
            onClose={() => actions.onClose(s.id)}
            onFocus={() => actions.onFocus(s.id)}
          />
        ))}
      </div>
    </div>
  );
}
