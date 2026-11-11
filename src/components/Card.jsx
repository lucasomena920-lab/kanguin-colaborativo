const nomesPrioridade = { alta: 'Alta', media: 'Média', baja: 'Baixa' }

function formatarData(iso) {
  if (!iso) return ''
  return new Date(iso + 'T00:00').toLocaleDateString('pt-PT', {
    day: '2-digit',
    month: 'short',
  })
}

function Card({ tarefa, equipe }) {
  const membro = equipe.find((m) => m.nome === tarefa.responsable)
  const cor = membro ? membro.cor : 'var(--texto-suave)'

  const hoje = new Date().toISOString().slice(0, 10)
  const atrasada =
    tarefa.status !== 'feito' && tarefa.fecha_limite && tarefa.fecha_limite < hoje

  return (
    <article className="card-tarefa p-3 rounded-3">
      <span className={`etiqueta ${tarefa.prioridad}`}>
        {nomesPrioridade[tarefa.prioridad]}
      </span>

      <h3 className="h6 mt-2 mb-1">{tarefa.titulo}</h3>
      <p className="small text-body-secondary mb-0">{tarefa.descripcion}</p>

      <div className="d-flex align-items-center justify-content-between mt-3">
        <small className={atrasada ? 'text-danger fw-semibold' : 'text-body-secondary'}>
          <i className="bi bi-calendar3 me-1" />
          {formatarData(tarefa.fecha_limite)}
          {atrasada && ' · atrasada'}
        </small>

        <span className="avatar" style={{ backgroundColor: cor }} title={tarefa.responsable}>
          {tarefa.responsable[0]}
        </span>
      </div>
    </article>
  )
}

export default Card