import type { CSSProperties } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

export function WordCard({ id, text, disabled }: { id: string; text: string; disabled?: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useDraggable({
    id,
    disabled,
  })

  const style: CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
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
