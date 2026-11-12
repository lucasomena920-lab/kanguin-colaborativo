import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'

const idiomas = [
  { codigo: 'pt', rotulo: 'PT' },
  { codigo: 'es', rotulo: 'ES' },
  { codigo: 'en', rotulo: 'EN' },
]

function ConteudoMenu({
  equipe,
  tema,
  totalLixeira,
  onAlternarTema,
  onNavegar,
  onAdicionarMembro,
  onRemoverMembro,
}) {
  const { t, i18n } = useTranslation()

  return (
    <>
      <nav>
        <p className="menu-titulo">{t('menu.titulo')}</p>
        <ul className="nav nav-pills flex-column gap-1">
          <li className="nav-item">
            <NavLink to="/" end className="nav-link" onClick={onNavegar}>
              <i className="bi bi-columns-gap me-2" />
              {t('menu.quadro')}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/estatisticas" className="nav-link" onClick={onNavegar}>
              <i className="bi bi-bar-chart-line me-2" />
              {t('menu.estatisticas')}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/calendario" className="nav-link" onClick={onNavegar}>
              <i className="bi bi-calendar3 me-2" />
              {t('menu.calendario')}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/lixeira" className="nav-link d-flex align-items-center" onClick={onNavegar}>
              <i className="bi bi-trash3 me-2" />
              {t('menu.lixeira')}
              {totalLixeira > 0 && (
                <span className="badge rounded-pill contador-lixeira ms-auto">{totalLixeira}</span>
              )}
            </NavLink>
          </li>
        </ul>
      </nav>

      <div>
        <div className="d-flex align-items-center mb-2">
          <p className="menu-titulo mb-0 me-auto">{t('equipe')}</p>
          <button
            type="button"
            className="btn btn-sm btn-icone"
            onClick={onAdicionarMembro}
            aria-label={t('membro.adicionar')}
            title={t('membro.adicionar')}
          >
            <i className="bi bi-person-plus" />
          </button>
        </div>

        {equipe.length === 0 ? (
          <p className="small text-body-secondary px-2 mb-0">{t('membro.vazia')}</p>
        ) : (
          <ul className="list-unstyled d-flex flex-column gap-1 px-2 mb-0">
            {equipe.map((membro) => (
              <li key={membro.nome} className="membro d-flex align-items-center gap-2">
                <span className="avatar" style={{ backgroundColor: membro.cor }}>
                  {membro.nome[0].toUpperCase()}
                </span>
                <span className="me-auto text-truncate">{membro.nome}</span>
                <button
                  type="button"
                  className="btn btn-sm btn-icone btn-remover"
                  onClick={() => onRemoverMembro(membro)}
                  aria-label={t('membro.remover', { nome: membro.nome })}
                  title={t('membro.remover', { nome: membro.nome })}
                >
                  <i className="bi bi-x-lg" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-auto d-flex flex-column gap-3">
        <div>
          <p className="menu-titulo">{t('idioma')}</p>
          <div className="btn-group w-100" role="group" aria-label={t('idioma')}>
            {idiomas.map((idioma) => (
              <button
                key={idioma.codigo}
                type="button"
                className={`btn btn-sm ${
                  i18n.resolvedLanguage === idioma.codigo ? 'btn-primary' : 'btn-outline-secondary'
                }`}
                onClick={() => i18n.changeLanguage(idioma.codigo)}
              >
                {idioma.rotulo}
              </button>
            ))}
          </div>
        </div>

        <button className="btn btn-outline-secondary" onClick={onAlternarTema}>
          <i className={tema === 'light' ? 'bi bi-moon-stars me-2' : 'bi bi-sun me-2'} />
          {tema === 'light' ? t('tema.escuro') : t('tema.claro')}
        </button>
      </div>
    </>
  )
}

export default ConteudoMenu