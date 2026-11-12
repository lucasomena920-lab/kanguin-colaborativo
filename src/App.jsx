import { lazy, Suspense, useEffect, useState } from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { useTranslation } from 'react-i18next'
import Sidebar from './components/Sidebar.jsx'
import BarraMobile from './components/BarraMobile.jsx'
import Topo from './components/Topo.jsx'
import Quadro from './components/Quadro.jsx'
import ModalTarefa from './components/ModalTarefa.jsx'
import ModalMembro from './components/ModalMembro.jsx'
import AvisoDesfazer from './components/AvisoDesfazer.jsx'
import Carregando from './components/Carregando.jsx'
import Lixeira from './pages/Lixeira.jsx'
import useLocalStorage from './hooks/useLocalStorage.js'
import { gerarId } from './utils/gerarId.js'
import { alertasDePrazo } from './utils/notificacoes.js'

// Páginas carregadas só quando alguém abre (lazy loading).
// Assim, a biblioteca de gráficos não pesa na primeira abertura do site.
const Estatisticas = lazy(() => import('./pages/Estatisticas.jsx'))
const Calendario = lazy(() => import('./pages/Calendario.jsx'))

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

// Se a tarefa foi para "Feito", guarda a data de conclusão (usada nas estatísticas).
// Se já tinha data, mantém. Se saiu de "Feito", apaga.
function dataConclusao(novoStatus, tarefaAntiga) {
  if (novoStatus !== 'feito') return null
  return tarefaAntiga?.fecha_conclusion ?? hojeISO()
}

// Marca as tarefas com a data/hora em que foram para a lixeira
function marcarExcluidas(lista) {
  const agora = new Date().toISOString()
  return lista.map((item) => ({ ...item, excluida_em: agora }))
}

// Tira a marca da lixeira para a tarefa voltar ao quadro
function tirarMarcaExcluida(item) {
  const tarefa = { ...item }
  delete tarefa.excluida_em
  return tarefa
}

// Tema inicial: segue o tema do sistema operacional (claro/escuro)
const temaDoSistema = window.matchMedia('(prefers-color-scheme: dark)').matches
  ? 'dark'
  : 'light'

function App() {
  const { t } = useTranslation()

  // ===== ESTADOS SALVOS NO NAVEGADOR =====
  const [tema, setTema] = useLocalStorage('kanguin:tema', temaDoSistema)
  const [tarefas, setTarefas] = useLocalStorage('kanguin:tarefas', [])
  const [equipe, setEquipe] = useLocalStorage('kanguin:equipe', [])
  const [lixeira, setLixeira] = useLocalStorage('kanguin:lixeira', [])

  // ===== ESTADOS DA TELA =====
  const [filtros, setFiltros] = useState({
    busca: '',
    prioridade: '',
    responsavel: '',
  })

  // Modal de tarefa
  const [modalAberto, setModalAberto] = useState(false)
  const [tarefaEditando, setTarefaEditando] = useState(null)
  const [statusInicial, setStatusInicial] = useState('a-fazer')
  const [dataInicial, setDataInicial] = useState('')

  // Modal de nova pessoa
  const [modalMembroAberto, setModalMembroAberto] = useState(false)

  // Aviso com "Desfazer": { id, mensagem, icone, aoDesfazer } ou null
  const [aviso, setAviso] = useState(null)

  // ===== NOTIFICAÇÕES (calculadas a partir das tarefas) =====
  const alertas = alertasDePrazo(tarefas)
  const totalAlertas = alertas.reduce((soma, grupo) => soma + grupo.itens.length, 0)

  // ===== EFEITOS =====
  // Aplica o tema na página
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', tema)
  }, [tema])

  // Mostra o número de alertas no título da aba: "(3) Kanguin"
  useEffect(() => {
    document.title = totalAlertas > 0 ? `(${totalAlertas}) Kanguin` : 'Kanguin'
  }, [totalAlertas])

  // ===== FUNÇÕES: tema e filtros =====
  function alternarTema() {
    setTema(tema === 'light' ? 'dark' : 'light')
  }

  function mudarFiltro(campo, valor) {
    setFiltros({ ...filtros, [campo]: valor })
  }

  function mostrarAviso(mensagem, icone, aoDesfazer) {
    setAviso({ id: gerarId(), mensagem, icone, aoDesfazer })
  }

  // ===== FUNÇÕES: modal de tarefa =====
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

  // ===== FUNÇÕES: criar, editar, mover =====
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
      setTarefas([
        ...tarefas,
        {
          id: gerarId(),
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

  // ===== LIXEIRA =====
  // Tudo o que é excluído vai para a lixeira, e pode voltar quando a pessoa quiser.
  // As funções usam a forma "setAlgo((atual) => ...)" porque o "Desfazer" pode ser
  // clicado alguns segundos depois, quando as listas já mudaram.
  function moverParaLixeira(removidas) {
    const ids = removidas.map((item) => item.id)
    setTarefas((atual) => atual.filter((item) => !ids.includes(item.id)))
    setLixeira((atual) => [...marcarExcluidas(removidas), ...atual])
  }

  function restaurarDaLixeira(itens) {
    const ids = itens.map((item) => item.id)
    setLixeira((atual) => atual.filter((item) => !ids.includes(item.id)))
    setTarefas((atual) => {
      // Evita duplicar uma tarefa que já voltou para o quadro
      const jaNoQuadro = atual.map((item) => item.id)
      const voltando = itens.filter((item) => !jaNoQuadro.includes(item.id))
      return [...atual, ...voltando.map(tirarMarcaExcluida)]
    })
  }

  function esvaziarLixeira() {
    setLixeira([])
  }

  function excluirTarefa(tarefa) {
    moverParaLixeira([tarefa])
    fecharModal()
    mostrarAviso(t('aviso.tarefaExcluida', { titulo: tarefa.titulo }), 'bi-trash3', () =>
      restaurarDaLixeira([tarefa])
    )
  }

  function limparQuadro() {
    if (tarefas.length === 0) return
    const removidas = tarefas
    moverParaLixeira(removidas)
    mostrarAviso(t('aviso.quadroLimpo', { total: removidas.length }), 'bi-trash3', () =>
      restaurarDaLixeira(removidas)
    )
  }

  // ===== EQUIPE =====
  function adicionarMembro(membro) {
    setEquipe([...equipe, membro])
    setModalMembroAberto(false)
  }

  function removerMembro(membro) {
    const posicao = equipe.findIndex((m) => m.nome === membro.nome)
    setEquipe(equipe.filter((m) => m.nome !== membro.nome))

    // As tarefas dessa pessoa continuam no quadro, com um aviso no card
    mostrarAviso(t('aviso.membroRemovido', { nome: membro.nome }), 'bi-person-dash', () =>
      setEquipe((atual) => [...atual.slice(0, posicao), membro, ...atual.slice(posicao)])
    )
  }

  // ===== TAREFAS FILTRADAS =====
  const termo = filtros.busca.toLowerCase()

  const tarefasVisiveis = tarefas.filter((item) => {
    const textoOk = (item.titulo + ' ' + item.descripcion).toLowerCase().includes(termo)
    const prioridadeOk = !filtros.prioridade || item.prioridad === filtros.prioridade
    const responsavelOk = !filtros.responsavel || item.responsable === filtros.responsavel
    return textoOk && prioridadeOk && responsavelOk
  })

  // Props do menu (iguais na sidebar do computador e no menu do celular)
  const propsMenu = {
    equipe,
    tema,
    totalLixeira: lixeira.length,
    alertas,
    onAbrirTarefa: abrirEdicao,
    onAlternarTema: alternarTema,
    onAdicionarMembro: () => setModalMembroAberto(true),
    onRemoverMembro: removerMembro,
  }

  return (
    <div className="app d-flex">
      <Sidebar {...propsMenu} />

      <div className="conteudo flex-grow-1">
        <BarraMobile {...propsMenu} />

        <Suspense fallback={<Carregando />}>
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

            <Route
              path="/lixeira"
              element={
                <Lixeira itens={lixeira} onRestaurar={restaurarDaLixeira} onEsvaziar={esvaziarLixeira} />
              }
            />

            {/* Qualquer outro endereço volta para o Quadro */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
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

      {modalMembroAberto && (
        <ModalMembro
          equipe={equipe}
          onSalvar={adicionarMembro}
          onFechar={() => setModalMembroAberto(false)}
        />
      )}

      <AvisoDesfazer key={aviso?.id} aviso={aviso} onFechar={() => setAviso(null)} />
    </div>
  )
}

export default App
