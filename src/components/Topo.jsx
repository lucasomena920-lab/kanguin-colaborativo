import { useTranslation } from 'react-i18next'

const prioridades = ['alta', 'media', 'baja']

function Topo({ filtros, onMudarFiltro, equipe, onNovaTarefa }) {
  const { t } = useTranslation()

  return (
    <header className="topo d-flex flex-wrap align-items-center gap-2 px-4 py-3 border-bottom">
      <div className="me-auto">
        <h1 className="h3 mb-0">{t('topo.titulo')}</h1>
        <small className="text-body-secondary">{t('topo.subtitulo')}</small>
      </div>

      <div className="input-group busca">
        <span className="input-group-text">
          <i className="bi bi-search" />
        </span>
        <input
          type="search"
          className="form-control"
          placeholder={t('topo.buscar')}
          value={filtros.busca}
          onChange={(e) => onMudarFiltro('busca', e.target.value)}
        />
      </div>

      <select
        className="form-select w-auto"
        value={filtros.prioridade}
        onChange={(e) => onMudarFiltro('prioridade', e.target.value)}
      >
        <option value="">{t('topo.todasPrioridades')}</option>
        {prioridades.map((p) => (
          <option key={p} value={p}>{t(`prioridade.${p}`)}</option>
        ))}
      </select>

      <select
        className="form-select w-auto"
        value={filtros.responsavel}
        onChange={(e) => onMudarFiltro('responsavel', e.target.value)}
      >
        <option value="">{t('topo.todos')}</option>
        {equipe.map((membro) => (
          <option key={membro.nome} value={membro.nome}>{membro.nome}</option>
        ))}
      </select>

      <button className="btn btn-primary" onClick={onNovaTarefa}>
        <i className="bi bi-plus-lg me-1" />
        {t('topo.novaTarefa')}
      </button>
    </header>
  )
}

export default Topo