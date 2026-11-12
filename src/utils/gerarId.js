// Gera um id único em texto, ex.: "m3k9x2a7f1qz".
// Mistura a hora atual com um número aleatório, então dois ids nunca se repetem,
// mesmo quando uma tarefa sai da lixeira e volta para o quadro.
export function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8)
}
