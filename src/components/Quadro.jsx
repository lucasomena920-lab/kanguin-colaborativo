import Coluna from './Coluna.jsx'

function Quadro({ colunas, tarefas, equipe }) {
  return (
    <div className="quadro d-flex gap-3 align-items-start">
      {colunas.map((coluna) => (
        <Coluna
          key={coluna.id}
          coluna={coluna}
          tarefas={tarefas.filter((t) => t.status === coluna.id)}
          equipe={equipe}
        />
      ))}
    </div>
  )
}

export default Quadro