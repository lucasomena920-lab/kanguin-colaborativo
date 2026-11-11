import { useDroppable } from '@dnd-kit/core'
import { useTranslation } from 'react-i18next'
import CardArrastavel from './CardArrastavel.jsx'

function Coluna({ coluna, tarefas, equipe, onEditar, onAdicionar }) {
  const { t } = useTranslation()
  const { setNodeRef, isOver } = useDroppable({ id: coluna.id })

  return (
    <section ref={setNodeRef} className={`coluna rounded-3 p-3 ${isOver ? 'alvo' : ''}`}>
      <div className="d-flex align-items-center gap-2 mb-3 px-1">
        <span className="bolinha" style={{ backgroundColor: coluna.cor }} />
        <h2 className="h6 fw-semibold mb-0">{t(`colunas.${coluna.id}`)}</h2>
        <span className="contador ms-auto">{tarefas.length}</span>
      </div>

      <div className="d-flex flex-column gap-2">
        {tarefas.length === 0 ? (
          <p className="vazio">{t('coluna.vazia')}</p>
        ) : (
          tarefas.map((tarefa) => (
            <CardArrastavel
              key={tarefa.id}
              tarefa={tarefa}
              equipe={equipe}
              onEditar={onEditar}
            />
          ))
        )}
      </div>

      <button className="btn btn-add w-100 text-start mt-2" onClick={() => onAdicionar(coluna.id)}>
        <i className="bi bi-plus-lg me-1" />
        {t('coluna.adicionar')}
      </button>
    </section>
  )
}

export default Coluna