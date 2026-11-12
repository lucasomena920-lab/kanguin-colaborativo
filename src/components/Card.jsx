import { useTranslation } from 'react-i18next'
import { formatarHoras } from '../utils/formatar.js'

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
  // Tem um nome de responsável, mas essa pessoa não está mais na equipe
  const responsavelRemovido = Boolean(tarefa.responsable) && !membro

  const hoje = new Date().toISOString().slice(0, 10)
  const atrasada =
    tarefa.status !== 'feito' && tarefa.fecha_limite && tarefa.fecha_limite < hoje

  // ===== PRAZO: horas, data ou nada =====
  let prazo = <span />

  if (tarefa.tipo_prazo === 'horas' && tarefa.horas) {
    prazo = (
      <small className="text-body-secondary">
        <i className="bi bi-clock me-1" />
        {formatarHoras(tarefa.horas)}
      </small>
    )
  } else if (tarefa.fecha_limite) {
    prazo = (
      <small className={atrasada ? 'text-danger fw-semibold' : 'text-body-secondary'}>
        <i className="bi bi-calendar3 me-1" />
        {formatarData(tarefa.fecha_limite, i18n.resolvedLanguage)}
        {atrasada && ` · ${t('card.atrasada')}`}
      </small>
    )
  }

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
      {responsavelRemovido && (
        <p className="alerta-responsavel small mb-1">
          <i className="bi bi-exclamation-triangle-fill me-1" />
          {t('card.responsavelRemovido', { nome: tarefa.responsable })}
        </p>
      )}
      {tarefa.descripcion && (
        <p className="small text-body-secondary mb-0">{tarefa.descripcion}</p>
      )}

      <div className="d-flex align-items-center justify-content-between mt-3">
        {prazo}

        {membro ? (
          <span className="avatar" style={{ backgroundColor: membro.cor }} title={membro.nome}>
            {membro.nome[0].toUpperCase()}
          </span>
        ) : (
          <span
            className="avatar avatar-vazio"
            title={responsavelRemovido ? tarefa.responsable : t('card.semResponsavel')}
          >
            <i className={responsavelRemovido ? 'bi bi-exclamation-lg' : 'bi bi-person'} />
          </span>
        )}
      </div>
    </article>
  )
}

export default Card
