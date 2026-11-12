// Separa as tarefas que precisam de atenção em 3 grupos:
// atrasadas, que vencem hoje e que vencem amanhã.
// Tarefas já feitas, ou sem data (por horas), não entram.
export function alertasDePrazo(tarefas) {
  const UM_DIA = 1000 * 60 * 60 * 24
  const hoje = new Date().toISOString().slice(0, 10)
  const amanha = new Date(Date.now() + UM_DIA).toISOString().slice(0, 10)

  const pendentes = tarefas.filter((tarefa) => tarefa.status !== 'feito' && tarefa.fecha_limite)

  return [
    {
      id: 'atrasadas',
      icone: 'bi-exclamation-triangle-fill',
      cor: 'var(--etiqueta-alta)',
      itens: pendentes.filter((tarefa) => tarefa.fecha_limite < hoje),
    },
    {
      id: 'hoje',
      icone: 'bi-alarm-fill',
      cor: 'var(--etiqueta-media)',
      itens: pendentes.filter((tarefa) => tarefa.fecha_limite === hoje),
    },
    {
      id: 'amanha',
      icone: 'bi-calendar-event-fill',
      cor: 'var(--azul-principal)',
      itens: pendentes.filter((tarefa) => tarefa.fecha_limite === amanha),
    },
  ]
}
