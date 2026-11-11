import Sidebar from './components/Sidebar.jsx'

const equipe = [
  { nome: 'Lucas', cor: '#2563EB' },
  { nome: 'Paula', cor: '#8B5CF6' },
]

function App() {
  return (
    <div className="app d-flex">
      <Sidebar equipe={equipe} />

      <div className="conteudo flex-grow-1 p-4">
        <h1 className="h3">Projeto Kanban</h1>
        <button className="btn btn-primary">+ Nova tarefa</button>
      </div>
    </div>
  )
}

export default App