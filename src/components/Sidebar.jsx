function Sidebar({ equipe, tema, onAlternarTema }) {
  return (
    <aside className="sidebar d-none d-md-flex flex-column gap-4 p-3 border-end">
      <div className="d-flex align-items-center gap-2 fw-bold fs-5">
        <img src="/logo_1.png" alt="" width="36" height="36" />
        Kanguin
      </div>
      

      <nav>
        <p className="menu-titulo">Menu</p>
        <ul className="nav nav-pills flex-column gap-1">
          <li className="nav-item">
            <a href="#" className="nav-link active">
              <i className="bi bi-columns-gap me-2" />
              Quadro
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <i className="bi bi-bar-chart-line me-2" />
              Estatísticas
            </a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">
              <i className="bi bi-calendar3 me-2" />
              Calendário
            </a>
          </li>
        </ul>
      </nav>

      <div>
        <p className="menu-titulo">Equipe</p>
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

      <button className="btn btn-outline-secondary mt-auto" onClick={onAlternarTema}>
        <i className={tema === 'light' ? 'bi bi-moon-stars me-2' : 'bi bi-sun me-2'} />
        {tema === 'light' ? 'Tema escuro' : 'Tema claro'}
      </button>
    </aside>
  )
}

export default Sidebar