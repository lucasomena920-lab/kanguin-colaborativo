import { NavLink } from 'react-router'
import { useTranslation } from 'react-i18next'

const idiomas = [
  { codigo: 'pt', rotulo: 'PT' },
  { codigo: 'es', rotulo: 'ES' },
  { codigo: 'en', rotulo: 'EN' },
]

function Sidebar({ equipe, tema, onAlternarTema }) {
  const { t, i18n } = useTranslation()

  return (
    <aside className="sidebar d-none d-md-flex flex-column gap-4 p-3 border-end">
      <div className="d-flex align-items-center gap-2 fw-bold fs-5">
        <img src="/logo_1.png" alt="" width="36" height="36" />
        Kanguin
      </div>

      <nav>
        <p className="menu-titulo">{t('menu.titulo')}</p>
        <ul className="nav nav-pills flex-column gap-1">
          <li className="nav-item">
            <NavLink to="/" end className="nav-link">
              <i className="bi bi-columns-gap me-2" />
              {t('menu.quadro')}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/estatisticas" className="nav-link">
              <i className="bi bi-bar-chart-line me-2" />
              {t('menu.estatisticas')}
            </NavLink>
          </li>
          <li className="nav-item">
            <NavLink to="/calendario" className="nav-link">
              <i className="bi bi-calendar3 me-2" />
              {t('menu.calendario')}
            </NavLink>
          </li>
        </ul>
      </nav>

      <div>
        <p className="menu-titulo">{t('equipe')}</p>
        <ul className="list-unstyled d-flex flex-column gap-2 px-2">
          {equipe.map((membro) => (
            <li key={membro.nome} className="d-flex align-items-center gap-2">
              <span className="avatar" style={{ backgroundColor: membro.cor }}>
                {membro.nome[0]}
              </span>
              {membro.nome}
            </li>
          ))}
        </ul>
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
    </aside>
  )
}

export default Sidebar