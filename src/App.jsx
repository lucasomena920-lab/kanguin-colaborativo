import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Topo from './components/Topo.jsx'
import Quadro from './components/Quadro.jsx'

const equipe = [
  { nome: 'Lucas', cor: '#2563EB' },
  { nome: 'Paula', cor: '#8B5CF6' },
]

const colunas = [
  { id: 'a-fazer', nome: 'A fazer', cor: 'var(--informativo)' },
  { id: 'fazendo', nome: 'Fazendo', cor: 'var(--andamento)' },
  { id: 'feito', nome: 'Feito', cor: 'var(--sucesso)' },
]

// TEMPORÁRIO: quando o tareas.json da Paula estiver na main,
// apague este array e use: import tarefasIniciais from './data/tareas.json'
const tarefasIniciais = [
  {
    id: 1, titulo: 'Tela de login',
    descripcion: 'Formulário com email, senha e validação básica',
    status: 'a-fazer', responsable: 'Lucas', prioridad: 'alta',
    fecha_creacion: '2026-11-08', fecha_limite: '2026-11-20', fecha_conclusion: null,
  },
  {
    id: 2, titulo: 'Corrigir sidebar no Safari',
    descripcion: 'Os ícones ficam desalinhados em telas pequenas',
    status: 'a-fazer', responsable: 'Lucas', prioridad: 'media',
    fecha_creacion: '2026-11-06', fecha_limite: '2026-11-10', fecha_conclusion: null,
  },
  {
    id: 3, titulo: 'Dicionário de dados',
    descripcion: 'Documentar os campos do tareas.json no README',
    status: 'fazendo', responsable: 'Paula', prioridad: 'media',
    fecha_creacion: '2026-11-09', fecha_limite: '2026-11-15', fecha_conclusion: null,
  },
  {
    id: 4, titulo: 'Funções de estatística',
    descripcion: 'Contagem por status, prioridade e responsável',
    status: 'fazendo', responsable: 'Paula', prioridad: 'alta',
    fecha_creacion: '2026-11-10', fecha_limite: '2026-11-18', fecha_conclusion: null,
  },
  {
    id: 5, titulo: 'Paleta e tema escuro',
    descripcion: 'Variáveis CSS integradas ao Bootstrap',
    status: 'feito', responsable: 'Lucas', prioridad: 'baja',
    fecha_creacion: '2026-11-05', fecha_limite: '2026-11-11', fecha_conclusion: '2026-11-11',
  },
  {
    id: 6, titulo: 'Configurar repositório',
    descripcion: 'Branches, colaboradores e README inicial',
    status: 'feito', responsable: 'Lucas', prioridad: 'media',
    fecha_creacion: '2026-11-04', fecha_limite: '2026-11-09', fecha_conclusion: '2026-11-09',
  },
]

function App() {
  // ===== ESTADOS =====
  const [tema, setTema] = useState('light')
  const [tarefas, setTarefas] = useState(tarefasIniciais)
  const [filtros, setFiltros] = useState({
    busca: '',
    prioridade: '',
    responsavel: '',
  })

  // ===== EFEITO: aplica o tema na página =====
  useEffect(() => {
    document.documentElement.setAttribute('data-bs-theme', tema)
  }, [tema])

  // ===== FUNÇÕES =====
  function alternarTema() {
    setTema(tema === 'light' ? 'dark' : 'light')
  }

  function mudarFiltro(campo, valor) {
    setFiltros({ ...filtros, [campo]: valor })
  }

  function abrirNovaTarefa() {
    console.log('Abrir modal (vem na Parte 5)')
  }

  // ===== TAREFAS FILTRADAS =====
  const termo = filtros.busca.toLowerCase()

  const tarefasVisiveis = tarefas.filter((t) => {
    const textoOk = (t.titulo + ' ' + t.descripcion).toLowerCase().includes(termo)
    const prioridadeOk = !filtros.prioridade || t.prioridad === filtros.prioridade
    const responsavelOk = !filtros.responsavel || t.responsable === filtros.responsavel
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
          onNovaTarefa={abrirNovaTarefa}
        />

        <main className="p-4">
          <Quadro colunas={colunas} tarefas={tarefasVisiveis} equipe={equipe} />
        </main>
      </div>
    </div>
  )
}

export default App