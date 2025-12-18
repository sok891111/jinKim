import type { ReactNode } from 'react'
import { useDroppable } from '@dnd-kit/core'

export function DroppableSlot({
  id,
  children,
  label,
  state,
}: {
  id: string
  label: string
  children?: ReactNode
  state?: 'neutral' | 'correct' | 'wrong'
}) {
  const { isOver, setNodeRef } = useDroppable({ id })

  const className = [
    'droppableSlot',
    isOver ? 'isOver' : '',
    state === 'correct' ? 'isCorrect' : '',
    state === 'wrong' ? 'isWrong' : '',
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <span ref={setNodeRef} className={className} aria-label={label}>
      {children ?? <span className="slotPlaceholder">_____</span>}
    </span>
  )
}
