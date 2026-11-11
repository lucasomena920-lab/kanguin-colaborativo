import { useState, useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import Sidebar from './components/Sidebar.jsx'
import Topo from './components/Topo.jsx'
import Quadro from './components/Quadro.jsx'
import ModalTarefa from './components/ModalTarefa.jsx'
import tarefasIniciais from './tarefasExemplo.js'

const equipe = [
  { nome: 'Lucas', cor: '#2563EB' },
  { nome: 'Paula', cor: '#8B5CF6' },
]

// Os nomes das colunas agora vêm da tradução (colunas.a-fazer, etc.)
const colunas = [
  { id: 'a-fazer', cor: 'var(--informativo)' },
  { id: 'fazendo', cor: 'var(--andamento)' },
  { id: 'feito', cor: 'var(--sucesso)' },
]

function App() {
  const { t } = useTranslation()

  // ===== ESTADOS =====
  const [tema, setTema] = useState('light')
  const [tarefas, setTarefas] = useState(tarefasIniciais)
  const [filtros, setFiltros] = useState({
    busca: '',
    prioridade: '',
    responsavel: '',
  })

  // Modal
  const [modalAberto, setModalAberto] = useState(false)
  const [tarefaEditando, setTarefaEditando] = useState(null)
  const [statusInicial, setStatusInicial] = useState('a-fazer')

  // ===== EFEITO: aplica o tema na página =====
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', tema)
  }, [tema])

  // ===== FUNÇÕES: tema e filtros =====
  function alternarTema() {
    setTema(tema === 'light' ? 'dark' : 'light')
  }

  function mudarFiltro(campo, valor) {
    setFiltros({ ...filtros, [campo]: valor })
  }

  // ===== FUNÇÕES: modal =====
  function abrirNovaTarefa(status) {
    setTarefaEditando(null)
    setStatusInicial(status)
    setModalAberto(true)
  }

  function abrirEdicao(tarefa) {
    setTarefaEditando(tarefa)
    setModalAberto(true)
  }

  function fecharModal() {
    setModalAberto(false)
    setTarefaEditando(null)
  }

  // ===== FUNÇÕES: criar, editar, excluir =====
  function salvarTarefa(dados) {
    const hoje = new Date().toISOString().slice(0, 10)

    // Se foi para "Feito", guarda a data de conclusão (para as estatísticas da Paula)
    const conclusao =
      dados.status === 'feito' ? (tarefaEditando?.fecha_conclusion ?? hoje) : null

    if (tarefaEditando) {
      setTarefas(
        tarefas.map((t) =>
          t.id === tarefaEditando.id ? { ...t, ...dados, fecha_conclusion: conclusao } : t
        )
      )
    } else {
      const novoId = Math.max(0, ...tarefas.map((t) => t.id)) + 1
      setTarefas([
        ...tarefas,
        { id: novoId, ...dados, fecha_creacion: hoje, fecha_conclusion: conclusao },
      ])
    }

    fecharModal()
  }

  function excluirTarefa(tarefa) {
    const confirmou = window.confirm(t('modal.confirmarExclusao', { titulo: tarefa.titulo }))
    if (!confirmou) return

    setTarefas(tarefas.filter((item) => item.id !== tarefa.id))
    fecharModal()
  }

  // ===== TAREFAS FILTRADAS =====
  const termo = filtros.busca.toLowerCase()

  const tarefasVisiveis = tarefas.filter((item) => {
    const textoOk = (item.titulo + ' ' + item.descripcion).toLowerCase().includes(termo)
    const prioridadeOk = !filtros.prioridade || item.prioridad === filtros.prioridade
    const responsavelOk = !filtros.responsavel || item.responsable === filtros.responsavel
    return textoOk && prioridadeOk && responsavelOk
  })

  return (
    <div className="app d-flex">
      <Sidebar equipe={equipe} tema={tema} onAlternarTema={alternarTema} />

      <div className="conteudo flex-grow-1">
        <Topo
          filtros={filtros}
          onMudarFiltro={mudarFiltro}
          equipe={equipe}
          onNovaTarefa={() => abrirNovaTarefa('a-fazer')}
        />

        <main className="p-4">
          <Quadro
            colunas={colunas}
            tarefas={tarefasVisiveis}
            equipe={equipe}
            onEditar={abrirEdicao}
            onAdicionar={abrirNovaTarefa}
          />
        </main>
      </div>

      {modalAberto && (
        <ModalTarefa
          tarefa={tarefaEditando}
          statusInicial={statusInicial}
          colunas={colunas}
          equipe={equipe}
          onSalvar={salvarTarefa}
          onExcluir={excluirTarefa}
          onFechar={fecharModal}
        />
      )}
    </div>
  )
}

export default App