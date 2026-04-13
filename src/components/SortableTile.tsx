import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { ReactNode } from 'react';

type SortableReturn = ReturnType<typeof useSortable>;
export type DragHandleProps = {
  ref: SortableReturn['setActivatorNodeRef'];
  attributes: SortableReturn['attributes'];
  listeners: SortableReturn['listeners'];
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
        attributes,
        listeners,
      })}
    </div>
  );
}
