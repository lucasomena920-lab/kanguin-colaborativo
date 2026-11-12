// Conta quantas tarefas existem para cada valor de um campo.
// Ex.: contarPor(tarefas, 'status') -> { 'a-fazer': 2, fazendo: 2, feito: 2 }
export function contarPor(tarefas, campo) {
  return tarefas.reduce((contagem, tarefa) => {
    const chave = tarefa[campo]
    contagem[chave] = (contagem[chave] || 0) + 1
    return contagem
  }, {})
}

// Tarefas que não estão feitas e cuja data-limite já passou
export function tarefasAtrasadas(tarefas) {
  const hoje = new Date().toISOString().slice(0, 10)
  return tarefas.filter(
    (tarefa) => tarefa.status !== 'feito' && tarefa.fecha_limite && tarefa.fecha_limite < hoje
  )
}

// Porcentagem de tarefas na coluna "Feito" (0 a 100)
export function porcentagemConcluida(tarefas) {
  if (tarefas.length === 0) return 0
  const feitas = tarefas.filter((tarefa) => tarefa.status === 'feito').length
  return Math.round((feitas / tarefas.length) * 100)
}

// Média de dias entre a criação e a conclusão (null se nenhuma foi concluída)
export function tempoMedioConclusao(tarefas) {
  const concluidas = tarefas.filter((tarefa) => tarefa.fecha_conclusion && tarefa.fecha_creacion)
  if (concluidas.length === 0) return null

  const UM_DIA = 1000 * 60 * 60 * 24
  const totalDias = concluidas.reduce((soma, tarefa) => {
    const dias = (new Date(tarefa.fecha_conclusion) - new Date(tarefa.fecha_creacion)) / UM_DIA
    return soma + dias
  }, 0)

  return Math.round((totalDias / concluidas.length) * 10) / 10
}