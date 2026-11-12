import { useState, useEffect } from 'react'

function useLocalStorage(chave, valorInicial) {
  // 1. Ao abrir o app: tenta ler o valor salvo
  const [valor, setValor] = useState(() => {
    try {
      const salvo = localStorage.getItem(chave)
      return salvo !== null ? JSON.parse(salvo) : valorInicial
    } catch {
      return valorInicial
    }
  })

  // 2. Sempre que o valor mudar: salva de novo
  useEffect(() => {
    try {
      localStorage.setItem(chave, JSON.stringify(valor))
    } catch {
      // Navegador sem espaço ou bloqueado: o app continua funcionando, só não salva
    }
  }, [chave, valor])

  return [valor, setValor]
}

export default useLocalStorage