import { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar.jsx'
import Topo from './components/Topo.jsx'

const equipe = [
  { nome: 'Lucas', cor: '#2563EB' },
  { nome: 'Paula', cor: '#8B5CF6' },
]

function App() {
  // ===== ESTADOS =====
  const [tema, setTema] = useState('light')
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

  return (
    <div className="app d-flex">
      <Sidebar equipe={equipe} tema={tema} onAlternarTema={alternarTema} />

      <div className="conteudo flex-grow-1 p-4">
        <Topo
          filtros={filtros}
          onMudarFiltro={mudarFiltro}
          equipe={equipe}
          onNovaTarefa={abrirNovaTarefa}
        />

        {/* TESTE: mostra o estado ao vivo. Vamos apagar depois */}
        <pre className="bg-body-tertiary p-3 rounded">
          {JSON.stringify(filtros, null, 2)}
        </pre>
      </div>
    </div>
  )
}

export default App