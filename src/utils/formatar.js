// Transforma horas decimais em texto
// 2 -> "2h" | 1.5 -> "1h30" | 0.25 -> "15min"
export function formatarHoras(horas) {
  const h = Math.floor(horas)
  const min = Math.round((horas - h) * 60)
  if (h === 0) return `${min}min`
  if (min === 0) return `${h}h`
  return `${h}h${String(min).padStart(2, '0')}`
}

// "Meu quadro" é o nome padrão salvo no banco; na tela ele aparece traduzido.
// Se o quadro for de outra pessoa, vira "Quadro de Paula" (senão todo mundo teria um "Meu quadro").
export function nomeDoQuadro(quadro, t) {
  if (quadro.nome !== 'Meu quadro') return quadro.nome
  if (quadro.papel !== 'dono' && quadro.dono_nome) return t('quadros.quadroDe', { nome: quadro.dono_nome })
  return t('quadros.meuQuadro')
}
