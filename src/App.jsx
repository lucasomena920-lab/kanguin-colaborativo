import { useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import Sidebar from './components/Sidebar.jsx'
import Topo from './components/Topo.jsx'
import Quadro from './components/Quadro.jsx'
import ModalTarefa from './components/ModalTarefa.jsx'
import Calendario from './pages/Calendario.jsx'
import BarraMobile from './components/BarraMobile.jsx'
import AvisoDesfazer from './components/AvisoDesfazer.jsx'
import useLocalStorage from './hooks/useLocalStorage.js'
import Estatisticas from './pages/Estatisticas.jsx'

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
  const [tarefas, setTarefas] = useLocalStorage('kanguin:tarefas', [])
  const [filtros, setFiltros] = useState({
    busca: '',
    prioridade: '',
    responsavel: '',
  })

  // Modal
  const [modalAberto, setModalAberto] = useState(false)
  const [tarefaEditando, setTarefaEditando] = useState(null)
  const [statusInicial, setStatusInicial] = useState('a-fazer')
  const [dataInicial, setDataInicial] = useState('')

  // Cópia das tarefas antes de limpar o quadro (para o "Desfazer")
  const [copiaSeguranca, setCopiaSeguranca] = useState(null)

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
  function abrirNovaTarefa(status, data = '') {
    setTarefaEditando(null)
    setStatusInicial(status)
    setDataInicial(data)
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

  // ===== LIMPAR QUADRO (com desfazer) =====
  function limparQuadro() {
    if (tarefas.length === 0) return
    setCopiaSeguranca(tarefas) // guarda tudo antes de apagar
    setTarefas([])
  }

  function desfazerLimpeza() {
    // Se a pessoa criou tarefas depois de limpar, elas são mantidas
    // e ganham ids novos, para não repetir os ids das tarefas restauradas
    const maiorId = Math.max(0, ...copiaSeguranca.map((item) => item.id))
    const criadasDepois = tarefas.map((item, i) => ({ ...item, id: maiorId + i + 1 }))

    setTarefas([...copiaSeguranca, ...criadasDepois])
    setCopiaSeguranca(null)
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
         <BarraMobile equipe={equipe} tema={tema} onAlternarTema={alternarTema} />
        
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
                  onLimpar={limparQuadro}
                  podeLimpar={tarefas.length > 0}
                />
                <main className="p-3 p-md-4">
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
            element={<Estatisticas tarefas={tarefas} colunas={colunas} equipe={equipe} />}
          />
          

          <Route
            path="/calendario"
            element={
              <Calendario
                tarefas={tarefas}
                equipe={equipe}
                onEditar={abrirEdicao}
                onAdicionar={(data) => abrirNovaTarefa('a-fazer', data)}
              />
            }
          />

          {/* Qualquer outro endereço volta para o Quadro */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>

      {modalAberto && (
        <ModalTarefa
          tarefa={tarefaEditando}
          statusInicial={statusInicial}
          dataInicial={dataInicial}
          colunas={colunas}
          equipe={equipe}
          onSalvar={salvarTarefa}
          onExcluir={excluirTarefa}
          onFechar={fecharModal}
        />
      )}

      <AvisoDesfazer
        mensagem={
          copiaSeguranca ? t('aviso.quadroLimpo', { total: copiaSeguranca.length }) : null
        }
        onDesfazer={desfazerLimpeza}
        onFechar={() => setCopiaSeguranca(null)}
      />
    </div>
  )
}

export default App