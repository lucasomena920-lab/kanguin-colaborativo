// Transforma horas decimais em texto
// 2 -> "2h" | 1.5 -> "1h30" | 0.25 -> "15min"
export function formatarHoras(horas) {
  const h = Math.floor(horas)
  const min = Math.round((horas - h) * 60)
  if (h === 0) return `${min}min`
  if (min === 0) return `${h}h`
  return `${h}h${String(min).padStart(2, '0')}`
}
