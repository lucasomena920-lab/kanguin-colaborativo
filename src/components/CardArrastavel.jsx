import { useDraggable } from '@dnd-kit/core'
import Card from './Card.jsx'
import { usePermissoes } from '../contexts/permissoes.js'

function CardArrastavel({ tarefa, equipe, onEditar }) {
  const { podeEditar } = usePermissoes()
  // Quem não pode mexer na tarefa também não pode arrastar
  const { setNodeRef, listeners, isDragging } = useDraggable({ id: tarefa.id, disabled: !podeEditar(tarefa) })

  return (
    <div ref={setNodeRef} {...listeners} className={isDragging ? 'arrastando' : ''}>
      <Card tarefa={tarefa} equipe={equipe} onEditar={onEditar} />
    </div>
  )
}

export default CardArrastavel