import { Fragment } from 'react'
import { useTranslation } from 'react-i18next'
import Dropdown from 'react-bootstrap/Dropdown'

// Sininho com a lista de prazos que precisam de atenção
function Notificacoes({ alertas, onAbrirTarefa, alinhamento = 'start' }) {
  const { t } = useTranslation()
  const total = alertas.reduce((soma, grupo) => soma + grupo.itens.length, 0)

  return (
    <Dropdown align={alinhamento}>
      <Dropdown.Toggle
        bsPrefix="sino"
        variant=""
        className={`btn position-relative ${total > 0 ? 'tem-alertas' : ''}`}
        aria-label={total > 0 ? `${t('notificacoes.titulo')}: ${total}` : t('notificacoes.titulo')}
        title={t('notificacoes.titulo')}
      >
        <i className={`bi ${total > 0 ? 'bi-bell-fill' : 'bi-bell'} fs-5`} />
        {total > 0 && <span className="contador-sino">{total > 9 ? '9+' : total}</span>}
      </Dropdown.Toggle>

      <Dropdown.Menu className="menu-notificacoes shadow">
        <Dropdown.Header className="fw-semibold">{t('notificacoes.titulo')}</Dropdown.Header>

        {total === 0 ? (
          <p className="px-3 py-2 small text-body-secondary mb-0">
            <i className="bi bi-check2-circle me-1" />
            {t('notificacoes.nada')}
          </p>
        ) : (
          alertas
            .filter((grupo) => grupo.itens.length > 0)
            .map((grupo) => (
              <Fragment key={grupo.id}>
                <div className="grupo-notificacao" style={{ color: grupo.cor }}>
                  <i className={`bi ${grupo.icone} me-1`} />
                  {t(`notificacoes.${grupo.id}`)} ({grupo.itens.length})
                </div>
                {grupo.itens.map((tarefa) => (
                  <Dropdown.Item key={tarefa.id} onClick={() => onAbrirTarefa(tarefa)} className="text-truncate">
                    {tarefa.titulo}
                  </Dropdown.Item>
                ))}
              </Fragment>
            ))
        )}
      </Dropdown.Menu>
    </Dropdown>
  )
}

export default Notificacoes
