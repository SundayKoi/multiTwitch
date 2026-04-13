import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';

export type DragHandleProps = {
  ref: (el: HTMLElement | null) => void;
  attributes: Record<string, unknown>;
  listeners: Record<string, unknown> | undefined;
};

type Props = {
  id: string;
  children: (handle: DragHandleProps) => ReactNode;
};

export default function SortableTile({ id, children }: Props) {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 30 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style}>
      {children({
        ref: setActivatorNodeRef,
        attributes: attributes as Record<string, unknown>,
        listeners: listeners as Record<string, unknown> | undefined,
      })}
    </div>
  );
}
