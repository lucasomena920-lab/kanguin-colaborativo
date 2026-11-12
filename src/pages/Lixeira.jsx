import { useTranslation } from 'react-i18next'

const localidades = { pt: 'pt-PT', es: 'es-ES', en: 'en-GB' }

function Lixeira({ itens, onRestaurar, onEsvaziar }) {
  const { t, i18n } = useTranslation()
  const local = localidades[i18n.resolvedLanguage] || 'pt-PT'

  function formatarQuando(iso) {
    return new Date(iso).toLocaleString(local, {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  function esvaziar() {
    // Esta é a única ação sem volta, por isso pede confirmação
    if (window.confirm(t('lixeira.confirmarEsvaziar'))) onEsvaziar()
  }

  return (
    <main className="p-3 p-md-4">
      <div className="d-flex flex-wrap align-items-center gap-2 mb-2">
        <h1 className="h3 mb-0 me-auto">{t('menu.lixeira')}</h1>
        {itens.length > 0 && (
          <>
            <button className="btn btn-outline-secondary btn-sm" onClick={() => onRestaurar(itens)}>
              <i className="bi bi-arrow-counterclockwise me-1" />
              {t('lixeira.restaurarTudo')}
            </button>
            <button className="btn btn-outline-danger btn-sm" onClick={esvaziar}>
              <i className="bi bi-trash3 me-1" />
              {t('lixeira.esvaziar')}
            </button>
          </>
        )}
      </div>
      <p className="text-body-secondary small mb-4">{t('lixeira.descricao')}</p>

      {itens.length === 0 ? (
        <div className="vazio py-5">
          <i className="bi bi-trash3 fs-1 d-block mb-2" />
          {t('lixeira.vazia')}
        </div>
      ) : (
        <ul className="list-unstyled d-flex flex-column gap-2">
          {itens.map((item) => (
            <li key={item.id} className="painel p-3 d-flex align-items-center gap-3">
              <span className={`etiqueta ${item.prioridad}`}>
                {t(`prioridade.${item.prioridad}`)}
              </span>
              <div className="flex-grow-1 min-w-0">
                <div className="fw-semibold text-truncate">{item.titulo}</div>
                <small className="text-body-secondary">
                  {t('lixeira.excluidaEm', { data: formatarQuando(item.excluida_em) })}
                </small>
              </div>
              <button className="btn btn-sm btn-outline-primary" onClick={() => onRestaurar([item])}>
                <i className="bi bi-arrow-counterclockwise me-1" />
                <span className="d-none d-sm-inline">{t('lixeira.restaurar')}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </main>
  )
}

export default Lixeira
