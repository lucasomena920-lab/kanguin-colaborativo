import { useDraggable } from '@dnd-kit/core'
import Card from './Card.jsx'

function CardArrastavel({ tarefa, equipe, onEditar }) {
  const { setNodeRef, listeners, isDragging } = useDraggable({ id: tarefa.id })

  return (
    <div ref={setNodeRef} {...listeners} className={isDragging ? 'arrastando' : ''}>
      <Card tarefa={tarefa} equipe={equipe} onEditar={onEditar} />
    </div>
  )
}

export default CardArrastavel