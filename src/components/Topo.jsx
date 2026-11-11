function Topo({ filtros, onMudarFiltro, equipe, onNovaTarefa }) {
  return (
    <header className="topo d-flex flex-wrap align-items-center gap-2 px-4 py-3 border-bottom">
      <div className="me-auto">
        <h1 className="h3 mb-0">Kanguin</h1>
        <small className="text-body-secondary">Sprint 1 · Novembro</small>
      </div>

      <div className="input-group busca">
        <span className="input-group-text">
          <i className="bi bi-search" />
        </span>
        <input
          type="search"
          className="form-control"
          placeholder="Buscar tarefa..."
          value={filtros.busca}
          onChange={(e) => onMudarFiltro('busca', e.target.value)}
        />
      </div>

      <select
        className="form-select w-auto"
        value={filtros.prioridade}
        onChange={(e) => onMudarFiltro('prioridade', e.target.value)}
      >
        <option value="">Todas as prioridades</option>
        <option value="alta">Alta</option>
        <option value="media">Média</option>
        <option value="baja">Baixa</option>
      </select>

      <select
        className="form-select w-auto"
        value={filtros.responsavel}
        onChange={(e) => onMudarFiltro('responsavel', e.target.value)}
      >
        <option value="">Todos</option>
        {equipe.map((membro) => (
          <option key={membro.nome} value={membro.nome}>
            {membro.nome}
          </option>
        ))}
      </select>

      <button className="btn btn-primary" onClick={onNovaTarefa}>
        <i className="bi bi-plus-lg me-1" />
        Nova tarefa
      </button>
    </header>
  )
}

export default Topo