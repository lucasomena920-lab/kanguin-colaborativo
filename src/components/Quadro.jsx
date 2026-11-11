import { useState } from 'react'
import {
  DndContext,
  DragOverlay,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import Coluna from './Coluna.jsx'
import Card from './Card.jsx'

function Quadro({ colunas, tarefas, equipe, onEditar, onAdicionar, onMover }) {
  const [tarefaAtiva, setTarefaAtiva] = useState(null)

  const sensores = useSensors(
    // Mouse: só começa a arrastar depois de mover 5px (assim o clique continua abrindo o modal)
    useSensor(MouseSensor, { activationConstraint: { distance: 5 } }),
    // Toque: segurar 200ms para arrastar (assim dá para rolar a página no celular)
    useSensor(TouchSensor, { activationConstraint: { delay: 200, tolerance: 5 } }),
  )

  function inicioArrasto({ active }) {
    setTarefaAtiva(tarefas.find((item) => item.id === active.id))
  }

  function fimArrasto({ active, over }) {
    setTarefaAtiva(null)
    if (!over) return // soltou fora de qualquer coluna

    const tarefa = tarefas.find((item) => item.id === active.id)
    if (tarefa && tarefa.status !== over.id) {
      onMover(tarefa.id, over.id)
    }
  }

  return (
    <DndContext
      sensors={sensores}
      onDragStart={inicioArrasto}
      onDragEnd={fimArrasto}
      onDragCancel={() => setTarefaAtiva(null)}
    >
      <div className="quadro d-flex gap-3 align-items-start">
        {colunas.map((coluna) => (
          <Coluna
            key={coluna.id}
            coluna={coluna}
            tarefas={tarefas.filter((item) => item.status === coluna.id)}
            equipe={equipe}
            onEditar={onEditar}
            onAdicionar={onAdicionar}
          />
        ))}
      </div>

      <DragOverlay>
        {tarefaAtiva ? (
          <div className="card-overlay">
            <Card tarefa={tarefaAtiva} equipe={equipe} onEditar={() => {}} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  )
}

export default Quadro