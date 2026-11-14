import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase.js'

// Diz se há alguém logado e avisa quando a pessoa entra ou sai.
// Devolve: undefined = ainda conferindo | null = ninguém logado | o usuário
function useSessao() {
  const [sessao, setSessao] = useState(supabase ? undefined : null)

  useEffect(() => {
    if (!supabase) return

    // 1. Ao abrir o app: já existe um login salvo neste navegador?
    supabase.auth.getSession().then(({ data }) => setSessao(data.session))

    // 2. Daqui pra frente: avisa sempre que alguém entrar ou sair
    const { data } = supabase.auth.onAuthStateChange((_evento, novaSessao) => {
      setSessao(novaSessao)
    })

    // 3. Quando o componente sair da tela, para de escutar
    return () => data.subscription.unsubscribe()
  }, [])

  if (sessao === undefined) return undefined
  return sessao?.user ?? null
}

export default useSessao
