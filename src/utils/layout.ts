import type { Layout } from '../types';

export type Rect = {
  x: number; // percent
  y: number;
  w: number;
  h: number;
  hidden?: boolean;
};

function gridDims(count: number, isMobile: boolean, isTablet: boolean) {
  if (count <= 1) return { cols: 1, rows: 1 };
  if (isMobile) return { cols: 1, rows: count };
  if (count === 2) return { cols: 2, rows: 1 };
  if (count === 3) return isTablet ? { cols: 2, rows: 2 } : { cols: 3, rows: 1 };
  if (count === 4) return { cols: 2, rows: 2 };
  if (count <= 6) return { cols: 3, rows: 2 };
  if (count <= 9) return { cols: 3, rows: 3 };
  return { cols: 4, rows: Math.ceil(count / 4) };
}

export function computeRects(args: {
  ids: string[];
  layout: Layout;
  focusedId: string | null;
  split: number;
  isMobile: boolean;
  isTablet: boolean;
}): Record<string, Rect> {
  const { ids, layout, focusedId, split, isMobile, isTablet } = args;
  const out: Record<string, Rect> = {};
  const n = ids.length;
  if (n === 0) return out;

  if (layout === 'theater') {
    const focused = focusedId && ids.includes(focusedId) ? focusedId : ids[0];
    for (const id of ids) {
      if (id === focused) out[id] = { x: 0, y: 0, w: 100, h: 100 };
      else out[id] = { x: 0, y: 0, w: 100, h: 100, hidden: true };
    }
    return out;
  }

  if (layout === 'focus' && n >= 2) {
    const focused = focusedId && ids.includes(focusedId) ? focusedId : ids[0];
    const rest = ids.filter(id => id !== focused);
    if (isMobile) {
      const focusH = 56; // percent
      const railH = 100 - focusH;
      out[focused] = { x: 0, y: 0, w: 100, h: focusH };
      const tileW = Math.max(35, 100 / Math.max(1, Math.min(rest.length, 3)));
      rest.forEach((id, i) => {
        out[id] = { x: i * tileW, y: focusH, w: tileW, h: railH };
      });
    } else {
      out[focused] = { x: 0, y: 0, w: split, h: 100 };
      const railW = 100 - split;
      const cellH = 100 / Math.max(1, rest.length);
      rest.forEach((id, i) => {
        out[id] = { x: split, y: i * cellH, w: railW, h: cellH };
      });
    }
    return out;
  }

  // grid
  const { cols, rows } = gridDims(n, isMobile, isTablet);
  const cellW = 100 / cols;
  const cellH = 100 / rows;
  ids.forEach((id, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    out[id] = { x: col * cellW, y: row * cellH, w: cellW, h: cellH };
  });
  return out;
}
