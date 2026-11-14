// Funciones de productividad semanal.
// Usa los mismos campos que el resto del proyecto: fecha_creacion y fecha_conclusion.

// Convierte 'AAAA-MM-DD' en Date leyendo las partes (evita errores de zona horaria)
export function paraData(dataTexto) {
  const [ano, mes, dia] = dataTexto.slice(0, 10).split('-').map(Number)
  return new Date(ano, mes - 1, dia)
}

// Convierte un Date en 'AAAA-MM-DD'
function paraTexto(data) {
  const mes = String(data.getMonth() + 1).padStart(2, '0')
  const dia = String(data.getDate()).padStart(2, '0')
  return `${data.getFullYear()}-${mes}-${dia}`
}

// Devuelve el lunes de la semana de una fecha.
// Ej.: inicioDaSemana('2026-11-11') -> '2026-11-09'
export function inicioDaSemana(dataTexto) {
  const data = paraData(dataTexto)
  const diaDaSemana = data.getDay() // 0 = domingo
  data.setDate(data.getDate() - (diaDaSemana === 0 ? 6 : diaDaSemana - 1))
  return paraTexto(data)
}

function somarDias(dataTexto, dias) {
  const data = paraData(dataTexto)
  data.setDate(data.getDate() + dias)
  return paraTexto(data)
}

// Cuenta por semana cuántas tareas se crearon y cuántas se concluyeron.
// Incluye las semanas sin actividad que quedan entre la primera y la última.
// Devuelve: [{ semana: '2026-11-02', criadas: 4, concluidas: 2 }, ...] ordenado por fecha
export function tarefasPorSemana(tarefas) {
  const semanas = {}

  const registrar = (data, campo) => {
    if (!data) return
    const semana = inicioDaSemana(data)
    if (!semanas[semana]) semanas[semana] = { semana, criadas: 0, concluidas: 0 }
    semanas[semana][campo] += 1
  }

  tarefas.forEach((tarefa) => {
    registrar(tarefa.fecha_creacion, 'criadas')
    registrar(tarefa.fecha_conclusion, 'concluidas')
  })

  const chaves = Object.keys(semanas).sort()
  if (chaves.length === 0) return []

  const resultado = []
  const ultima = chaves[chaves.length - 1]
  let atual = chaves[0]
  while (atual <= ultima) {
    resultado.push(semanas[atual] || { semana: atual, criadas: 0, concluidas: 0 })
    atual = somarDias(atual, 7)
  }
  return resultado
}