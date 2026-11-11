function Sidebar({ equipe }) {
  return (
    <aside className="sidebar d-none d-md-flex flex-column gap-4 p-3 border-end">
      <div className="d-flex align-items-center gap-2 fw-bold fs-5">
        <div className="logo-icone">▦</div>
        Kanban Flow
      </div>

      <nav>
        <p className="menu-titulo">Menu</p>
        <ul className="nav nav-pills flex-column gap-1">
          <li className="nav-item">
            <a href="#" className="nav-link active">📋 Quadro</a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">📊 Estatísticas</a>
          </li>
          <li className="nav-item">
            <a href="#" className="nav-link">📅 Calendário</a>
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

      <button className="btn btn-outline-secondary mt-auto">🌙 Tema escuro</button>
    </aside>
  )
}

export default Sidebar