// Cores dos avatares da equipe (da paleta Ocean Flow)
export const coresMembro = ['#2563EB', '#8B5CF6', '#06B6D4', '#10B981', '#F59E0B', '#EC4899']

// Cor fixa para cada pessoa com conta: o mesmo id sempre dá a mesma cor,
// em qualquer aparelho, sem precisar guardar a cor no banco
export function corDaPessoa(id) {
  let soma = 0
  for (const letra of id) soma = (soma * 31 + letra.charCodeAt(0)) % 997
  return coresMembro[soma % coresMembro.length]
}
