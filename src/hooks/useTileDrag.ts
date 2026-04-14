import { useCallback, useEffect, useRef, useState } from 'react';

type DragState = {
  id: string;
  startX: number;
  startY: number;
  dx: number;
  dy: number;
  overId: string | null;
  active: boolean; // true once movement exceeds threshold
};

const ACTIVATION_THRESHOLD = 4; // px

export function useTileDrag(onReorder: (fromId: string, toId: string) => void) {
  const [state, setState] = useState<DragState | null>(null);
  const stateRef = useRef<DragState | null>(null);
  stateRef.current = state;

  function findTileIdUnder(x: number, y: number): string | null {
    const el = document.elementFromPoint(x, y);
    if (!el) return null;
    const tile = (el as Element).closest('[data-stream-tile]');
    return tile ? tile.getAttribute('data-stream-tile') : null;
  }

  useEffect(() => {
    if (!state) return;
    function onMove(e: PointerEvent) {
      const s = stateRef.current;
      if (!s) return;
      const dx = e.clientX - s.startX;
      const dy = e.clientY - s.startY;
      const active = s.active || Math.hypot(dx, dy) >= ACTIVATION_THRESHOLD;
      const overId = active ? findTileIdUnder(e.clientX, e.clientY) : null;
      setState({ ...s, dx, dy, active, overId });
    }
    function onUp() {
      const s = stateRef.current;
      if (s && s.active && s.overId && s.overId !== s.id) {
        onReorder(s.id, s.overId);
      }
      setState(null);
    }
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
    window.addEventListener('pointercancel', onUp);
    return () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      window.removeEventListener('pointercancel', onUp);
    };
  }, [state, onReorder]);

  const getHandleProps = useCallback(
    (id: string) => ({
      onPointerDown: (e: React.PointerEvent) => {
        if (e.button !== 0 && e.pointerType === 'mouse') return;
        e.preventDefault();
        e.stopPropagation();
        setState({
          id,
          startX: e.clientX,
          startY: e.clientY,
          dx: 0,
          dy: 0,
          overId: null,
          active: false,
        });
      },
    }),
    []
  );

  return {
    state,
    getHandleProps,
    isDragging: (id: string) => state?.active === true && state.id === id,
    isOver: (id: string) =>
      state?.active === true && state.overId === id && state.id !== id,
    dragOffset: (id: string) =>
      state?.id === id && state.active ? { x: state.dx, y: state.dy } : null,
  };
}
