import { useTranslation } from 'react-i18next'

// Formato de data de cada idioma
const formatosData = { pt: 'pt-PT', es: 'es-ES', en: 'en-GB' }

function formatarData(iso, idioma) {
  if (!iso) return ''
  return new Date(iso + 'T00:00').toLocaleDateString(formatosData[idioma] || 'pt-PT', {
    day: '2-digit',
    month: 'short',
  })
}

function Card({ tarefa, equipe, onEditar }) {
  const { t, i18n } = useTranslation()

  const membro = equipe.find((m) => m.nome === tarefa.responsable)
  const cor = membro ? membro.cor : 'var(--texto-suave)'

  const hoje = new Date().toISOString().slice(0, 10)
  const atrasada =
    tarefa.status !== 'feito' && tarefa.fecha_limite && tarefa.fecha_limite < hoje

  function teclado(e) {
    if (e.key === 'Enter') onEditar(tarefa)
  }

  return (
    <article
      className="card-tarefa p-3 rounded-3"
      onClick={() => onEditar(tarefa)}
      onKeyDown={teclado}
      role="button"
      tabIndex={0}
    >
      <span className={`etiqueta ${tarefa.prioridad}`}>
        {t(`prioridade.${tarefa.prioridad}`)}
      </span>

      <h3 className="h6 mt-2 mb-1">{tarefa.titulo}</h3>
      {tarefa.descripcion && (
        <p className="small text-body-secondary mb-0">{tarefa.descripcion}</p>
      )}

      <div className="d-flex align-items-center justify-content-between mt-3">
        {tarefa.fecha_limite ? (
          <small className={atrasada ? 'text-danger fw-semibold' : 'text-body-secondary'}>
            <i className="bi bi-calendar3 me-1" />
            {formatarData(tarefa.fecha_limite, i18n.resolvedLanguage)}
            {atrasada && ` · ${t('card.atrasada')}`}
          </small>
        ) : (
          <span />
        )}

        <span className="avatar" style={{ backgroundColor: cor }} title={tarefa.responsable}>
          {tarefa.responsable[0]}
        </span>
      </div>
    </article>
  )
}

export default Card