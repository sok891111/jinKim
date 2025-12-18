import type { CSSProperties } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'

export function WordCard({
  id,
  text,
  disabled,
  onClick,
  isSelected,
}: {
  id: string
  text: string
  disabled?: boolean
  onClick?: () => void
  isSelected?: boolean
}) {
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
      className={['wordCard', isSelected ? 'isSelected' : ''].filter(Boolean).join(' ')}
      style={style}
      type="button"
      onClick={onClick}
      {...listeners}
      {...attributes}
      aria-disabled={disabled}
    >
      {text}
    </button>
  )
}
