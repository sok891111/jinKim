import type { CSSProperties } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

export function WordCard({ id, text, disabled }: { id: string; text: string; disabled?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id,
    disabled,
  })

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    // When using DragOverlay, hide the original element while dragging
    // so users don't see a duplicated “two cards” effect.
    opacity: isDragging ? 0 : 1,
    visibility: isDragging ? 'hidden' : 'visible',
    cursor: disabled ? 'not-allowed' : 'grab',
  }

  return (
    <button
      ref={setNodeRef}
      className="wordCard"
      style={style}
      type="button"
      {...listeners}
      {...attributes}
      aria-disabled={disabled}
    >
      {text}
    </button>
  )
}
