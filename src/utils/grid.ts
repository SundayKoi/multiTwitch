// Explicit grid class mapping by stream count. See CLAUDE_1.md "Grid math".
// Returns Tailwind utility classes for the grid container.
export function getGridClasses(count: number): string {
  if (count <= 1) return 'grid-cols-1';
  if (count === 2) return 'grid-cols-1 md:grid-cols-2';
  if (count === 3) return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';
  if (count === 4) return 'grid-cols-1 md:grid-cols-2';
  if (count <= 6) return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';
  if (count <= 9) return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-3';
  return 'grid-cols-1 md:grid-cols-2 xl:grid-cols-4';
}

export function getMaxWidth(count: number): string {
  if (count <= 1) return 'max-w-[1600px]';
  return 'max-w-none';
}
