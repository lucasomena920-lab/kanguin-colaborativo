import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import Sidebar from './components/Sidebar.jsx'
import Topo from './components/Topo.jsx'
import Quadro from './components/Quadro.jsx'
import ModalTarefa from './components/ModalTarefa.jsx'
import EmBreve from './pages/emBreve.jsx'
import tarefasIniciais from './tarefasExemplo.js'
import useLocalStorage from './hooks/useLocalStorage.js'

const equipe = [
  { nome: 'Lucas', cor: '#2563EB' },
  { nome: 'Paula', cor: '#8B5CF6' },
]

// Os nomes das colunas vêm da tradução (colunas.a-fazer, etc.)
const colunas = [
  { id: 'a-fazer', cor: 'var(--urgente)' },
  { id: 'fazendo', cor: 'var(--andamento)' },
  { id: 'feito', cor: 'var(--sucesso)' },
]

// ===== FUNÇÕES AUXILIARES =====
function hojeISO() {
  return new Date().toISOString().slice(0, 10)
}

// Se a tarefa foi para "Feito", guarda a data de conclusão (para as estatísticas da Paula).
// Se já tinha data, mantém. Se saiu de "Feito", apaga.
function dataConclusao(novoStatus, tarefaAntiga) {
  if (novoStatus !== 'feito') return null
  return tarefaAntiga?.fecha_conclusion ?? hojeISO()
}

// Tema inicial: segue o tema do sistema operacional (claro/escuro)
const temaDoSistema = window.matchMedia('(prefers-color-scheme: dark)').matches
  ? 'dark'
  : 'light'

function App() {
  const { t } = useTranslation()

  // ===== ESTADOS =====
  const [tema, setTema] = useLocalStorage('kanguin:tema', temaDoSistema)
  const [tarefas, setTarefas] = useLocalStorage('kanguin:tarefas', tarefasIniciais)
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

  // ===== FUNÇÕES: criar, editar, mover, excluir =====
  function salvarTarefa(dados) {
    if (tarefaEditando) {
      setTarefas(
        tarefas.map((item) =>
          item.id === tarefaEditando.id
            ? { ...item, ...dados, fecha_conclusion: dataConclusao(dados.status, item) }
            : item
        )
      )
    } else {
      const novoId = Math.max(0, ...tarefas.map((item) => item.id)) + 1
      setTarefas([
        ...tarefas,
        {
          id: novoId,
          ...dados,
          fecha_creacion: hojeISO(),
          fecha_conclusion: dataConclusao(dados.status, null),
        },
      ])
    }

    fecharModal()
  }

  function moverTarefa(id, novoStatus) {
    setTarefas(
      tarefas.map((item) =>
        item.id === id
          ? { ...item, status: novoStatus, fecha_conclusion: dataConclusao(novoStatus, item) }
          : item
      )
    )
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
        <Routes>
          {/* Página do Quadro */}
          <Route
            path="/"
            element={
              <>
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
                    onMover={moverTarefa}
                  />
                </main>
              </>
            }
          />

          {/* Página da Paula. Quando estiver pronta, troque por:
              <Estadisticas tareas={tarefas} /> */}
          <Route
            path="/estatisticas"
            element={<EmBreve titulo={t('menu.estatisticas')} icone="bi-bar-chart-line" />}
          />

          <Route
            path="/calendario"
            element={<EmBreve titulo={t('menu.calendario')} icone="bi-calendar3" />}
          />

          {/* Qualquer outro endereço volta para o Quadro */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
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