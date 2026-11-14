import { useEffect, useRef, useState } from 'react'
import { supabase } from '../lib/supabase.js'
import useLocalStorage from './useLocalStorage.js'
import { gerarId } from '../utils/gerarId.js'

// ===== CONVERSÕES ENTRE O APP E O BANCO =====

// Tarefa do app -> campos da tabela "tarefas" que o app pode mudar
// (quadro_id e criado_por são definidos só na hora de criar)
function paraLinha(tarefa, excluidaEm) {
  return {
    id: tarefa.id,
    titulo: tarefa.titulo,
    descripcion: tarefa.descripcion ?? '',
    status: tarefa.status,
    prioridad: tarefa.prioridad,
    responsable: tarefa.responsable ?? '',
    tipo_prazo: tarefa.tipo_prazo ?? 'data',
    fecha_limite: tarefa.fecha_limite || null, // o banco não aceita '' numa data
    horas: tarefa.horas ?? null,
    fecha_creacion: tarefa.fecha_creacion || new Date().toISOString().slice(0, 10),
    fecha_conclusion: tarefa.fecha_conclusion || null,
    excluida_em: excluidaEm,
  }
}

// Linha da tabela "tarefas" -> tarefa do app (o criado_por fica, para as permissões)
function paraTarefa(linha) {
  const tarefa = { ...linha }
  delete tarefa.quadro_id
  delete tarefa.atualizada_em
  if (tarefa.excluida_em === null) delete tarefa.excluida_em
  return tarefa
}

// Todas as linhas que deveriam estar no banco agora (quadro + lixeira)
function linhasDasTarefas(dados) {
  return [
    ...dados.tarefas.map((tarefa) => paraLinha(tarefa, null)),
    ...dados.lixeira.map((tarefa) => paraLinha(tarefa, tarefa.excluida_em)),
  ]
}

function linhasDosMembros(dados) {
  return dados.equipe.map((membro, posicao) => ({
    quadro_id: dados.quadroId,
    nome: membro.nome,
    cor: membro.cor,
    posicao,
  }))
}

// Guarda como cada linha estava na última vez que foi salva: { id: 'texto da linha' }
function fotografar(linhas, chave) {
  return Object.fromEntries(linhas.map((linha) => [linha[chave], JSON.stringify(linha)]))
}

// ===== SALVAR O QUE MUDOU =====
// Compara com a última versão salva e manda para o banco só as diferenças.
async function salvarDiferencas(dados, userId, salvo, setStatus) {
  const linhasTarefas = linhasDasTarefas(dados)
  const linhasMembros = linhasDosMembros(dados)
  const agoraTarefas = fotografar(linhasTarefas, 'id')
  const agoraMembros = fotografar(linhasMembros, 'nome')

  const mudaram = linhasTarefas.filter((l) => salvo.current.tarefas[l.id] !== agoraTarefas[l.id])
  const novas = mudaram.filter((l) => !(l.id in salvo.current.tarefas))
  const alteradas = mudaram.filter((l) => l.id in salvo.current.tarefas)
  const sumiram = Object.keys(salvo.current.tarefas).filter((id) => !(id in agoraTarefas))

  const membrosMudaram = linhasMembros.filter((l) => salvo.current.membros[l.nome] !== agoraMembros[l.nome])
  const membrosSumiram = Object.keys(salvo.current.membros).filter((nome) => !(nome in agoraMembros))

  const total = mudaram.length + sumiram.length + membrosMudaram.length + membrosSumiram.length
  if (total === 0) return

  setStatus('salvando')
  const respostas = await Promise.all([
    // Tarefas novas: entram neste quadro, criadas por quem está logado
    novas.length &&
      supabase
        .from('tarefas')
        .insert(novas.map((l) => ({ ...l, quadro_id: dados.quadroId, criado_por: userId }))),
    // Tarefas que mudaram: uma atualização para cada (sem mexer em quem criou)
    ...alteradas.map(({ id, ...campos }) => supabase.from('tarefas').update(campos).eq('id', id)),
    sumiram.length && supabase.from('tarefas').delete().in('id', sumiram),
    membrosMudaram.length && supabase.from('membros').upsert(membrosMudaram),
    membrosSumiram.length &&
      supabase.from('membros').delete().eq('quadro_id', dados.quadroId).in('nome', membrosSumiram),
  ])

  if (respostas.some((resposta) => resposta && resposta.error)) {
    setStatus('erro')
    return
  }

  // Atualiza a "fotografia" só do que foi enviado agora. Assim, o que chegou
  // em tempo real de outra pessoa enquanto salvava não é apagado daqui.
  for (const linha of mudaram) salvo.current.tarefas[linha.id] = agoraTarefas[linha.id]
  for (const id of sumiram) delete salvo.current.tarefas[id]
  for (const linha of membrosMudaram) salvo.current.membros[linha.nome] = agoraMembros[linha.nome]
  for (const nome of membrosSumiram) delete salvo.current.membros[nome]
  setStatus('sincronizado')
}

// ===== O HOOK =====
// Sem login: tarefas, lixeira e equipe ficam no navegador (como antes).
// Com login: ficam no quadro escolhido, na nuvem, e cada mudança é salva sozinha.
function useDadosKanguin(usuario) {
  // Dados de quem usa sem conta
  const [tarefasLocal, setTarefasLocal] = useLocalStorage('kanguin:tarefas', [])
  const [lixeiraLocal, setLixeiraLocal] = useLocalStorage('kanguin:lixeira', [])
  const [equipeLocal, setEquipeLocal] = useLocalStorage('kanguin:equipe', [])

  // Contas que escolheram "Agora não" para levar o quadro do navegador
  const [migracaoRecusada, setMigracaoRecusada] = useLocalStorage('kanguin:migracao-recusada', [])

  // Último quadro aberto neste aparelho
  const [quadroEscolhido, setQuadroEscolhido] = useLocalStorage('kanguin:quadro-atual', null)

  // Quadros de quem está logado: { userId, lista: [{ id, nome, dono_id, papel }] }
  const [quadros, setQuadros] = useState(null)
  // Muda de valor para carregar a lista de quadros de novo (ex.: depois de aceitar um convite)
  const [versaoQuadros, setVersaoQuadros] = useState(0)

  // Convites que eu recebi: { userId, lista }
  const [convites, setConvites] = useState(null)
  const [versaoConvites, setVersaoConvites] = useState(0)

  // Dados do quadro aberto: { userId, quadroId, tarefas, lixeira, equipe }
  const [nuvem, setNuvem] = useState(null)
  // Cópia da versão mais recente, para o tempo real comparar sem esperar o React redesenhar
  const nuvemRef = useRef(null)
  const [statusNuvem, setStatusNuvem] = useState('sincronizado')

  // Última versão salva no banco (para mandar só o que mudou)
  const salvo = useRef({ tarefas: {}, membros: {} })
  // Salvamento esperando os 0,6 s: { timer, executar }
  const pendente = useRef(null)
  // Fila: um salvamento só começa quando o anterior termina
  const fila = useRef(Promise.resolve())

  const userId = usuario?.id ?? null
  const email = usuario?.email?.toLowerCase() ?? null
  const logado = Boolean(supabase && userId)

  const listaQuadros = logado && quadros?.userId === userId ? quadros.lista : null
  const quadroAtual = listaQuadros
    ? (listaQuadros.find((q) => q.id === quadroEscolhido) ??
      listaQuadros.find((q) => q.papel === 'dono') ??
      listaQuadros[0] ??
      null)
    : null
  const quadroId = quadroAtual?.id ?? null

  // Os dados da nuvem só valem se forem deste usuário e deste quadro
  const dadosNuvem = logado && nuvem?.userId === userId && nuvem?.quadroId === quadroId ? nuvem : null

  // ===== 1. AO ENTRAR: CARREGAR A LISTA DE QUADROS =====
  useEffect(() => {
    if (!supabase || !userId) return
    let cancelado = false

    async function carregarQuadros() {
      const [participacoes, respostaQuadros] = await Promise.all([
        supabase.from('quadro_membros').select('quadro_id, papel').eq('user_id', userId),
        supabase.from('quadros').select('id, nome, dono_id').order('criado_em'),
      ])
      if (cancelado) return
      if (participacoes.error || respostaQuadros.error) {
        setStatusNuvem('erro')
        return
      }

      // Junta cada quadro com o meu papel nele
      let lista = respostaQuadros.data
        .map((q) => ({ ...q, papel: participacoes.data.find((p) => p.quadro_id === q.id)?.papel }))
        .filter((q) => q.papel)

      // Garantia: toda conta precisa de pelo menos um quadro
      if (lista.length === 0) {
        const { data, error } = await supabase
          .from('quadros')
          .insert({ nome: 'Meu quadro' })
          .select('id, nome, dono_id')
          .single()
        if (cancelado) return
        if (error) {
          setStatusNuvem('erro')
          return
        }
        lista = [{ ...data, papel: 'dono' }]
      }

      // Nome dos donos dos quadros dos outros (para mostrar "Quadro da Paula")
      const outrosDonos = [...new Set(lista.filter((q) => q.dono_id !== userId).map((q) => q.dono_id))]
      if (outrosDonos.length > 0) {
        const { data: perfis } = await supabase.from('perfis').select('id, nome').in('id', outrosDonos)
        if (cancelado) return
        lista = lista.map((q) => ({ ...q, dono_nome: perfis?.find((p) => p.id === q.dono_id)?.nome }))
      }

      setQuadros({ userId, lista })
    }

    carregarQuadros()
    return () => {
      cancelado = true
    }
  }, [userId, versaoQuadros])

  // ===== 1B. CONVITES QUE EU RECEBI =====
  // Carrega ao entrar e toda vez que a pessoa volta para a aba do Kanguin
  useEffect(() => {
    if (!supabase || !userId) return
    let cancelado = false

    async function carregarConvites() {
      const { data, error } = await supabase.rpc('meus_convites')
      if (!cancelado && !error) setConvites({ userId, lista: data })
    }

    carregarConvites()
    window.addEventListener('focus', carregarConvites)
    return () => {
      cancelado = true
      window.removeEventListener('focus', carregarConvites)
    }
  }, [userId, versaoConvites])

  // ===== 2. CARREGAR AS TAREFAS DO QUADRO ABERTO =====
  useEffect(() => {
    if (!supabase || !userId || !quadroId) return
    let cancelado = false

    async function carregarQuadro() {
      const [respostaTarefas, respostaMembros] = await Promise.all([
        supabase.from('tarefas').select('*').eq('quadro_id', quadroId),
        supabase.from('membros').select('*').eq('quadro_id', quadroId).order('posicao'),
      ])
      if (cancelado) return
      if (respostaTarefas.error || respostaMembros.error) {
        setStatusNuvem('erro')
        return
      }

      const linhas = respostaTarefas.data
      const dados = {
        userId,
        quadroId,
        tarefas: linhas.filter((linha) => !linha.excluida_em).map(paraTarefa),
        lixeira: linhas.filter((linha) => linha.excluida_em).map(paraTarefa),
        equipe: respostaMembros.data.map(({ nome, cor }) => ({ nome, cor })),
      }

      // O que acabou de vir do banco já está salvo
      salvo.current = {
        tarefas: fotografar(linhasDasTarefas(dados), 'id'),
        membros: fotografar(linhasDosMembros(dados), 'nome'),
      }
      setNuvem(dados)
      setStatusNuvem('sincronizado')
    }

    carregarQuadro()
    return () => {
      cancelado = true
    }
  }, [userId, quadroId])

  // ===== 2B. TEMPO REAL: RECEBER O QUE OS OUTROS MUDAM =====
  useEffect(() => {
    nuvemRef.current = nuvem
  }, [nuvem])

  useEffect(() => {
    if (!supabase || !userId) return

    // Muda os dados do quadro aberto a partir de um evento que veio do banco.
    // "decidir" olha o estado atual e devolve como transformar os dados (ou null para ignorar).
    // A transformação roda no setNuvem com a forma (atual) => novo, para não perder
    // uma mudança que a pessoa fez neste mesmo instante.
    function atualizar(decidir) {
      const atual = nuvemRef.current
      if (!atual || atual.userId !== userId || atual.quadroId !== quadroId) return
      const transformar = decidir(atual)
      if (!transformar) return
      setNuvem((ultimo) => (ultimo?.quadroId === quadroId ? transformar(ultimo) : ultimo))
    }

    // Esta tarefa tem uma mudança minha que ainda não foi salva?
    // (aí a minha versão ganha: ela vai ser salva daqui a pouco)
    function tenhoMudancaNaoSalva(atual, id) {
      const local = [...atual.tarefas, ...atual.lixeira].find((t) => t.id === id)
      const linhaLocal = local ? JSON.stringify(paraLinha(local, local.excluida_em ?? null)) : undefined
      return linhaLocal !== salvo.current.tarefas[id]
    }

    function receberTarefa({ eventType, new: linhaNova, old: linhaAntiga }) {
      const id = eventType === 'DELETE' ? linhaAntiga.id : linhaNova.id

      atualizar((atual) => {
        if (tenhoMudancaNaoSalva(atual, id)) return null
        const semEla = (lista) => lista.filter((t) => t.id !== id)

        // Apagada de vez (por exemplo: alguém esvaziou a lixeira)
        if (eventType === 'DELETE') {
          if (!(id in salvo.current.tarefas)) return null // não era deste quadro
          delete salvo.current.tarefas[id]
          return (d) => ({ ...d, tarefas: semEla(d.tarefas), lixeira: semEla(d.lixeira) })
        }

        // Criada ou alterada: vai para o quadro ou para a lixeira, no mesmo lugar de antes
        const tarefa = paraTarefa(linhaNova)
        salvo.current.tarefas[id] = JSON.stringify(paraLinha(tarefa, linhaNova.excluida_em))
        const colocar = (lista, noFim) =>
          lista.some((t) => t.id === id)
            ? lista.map((t) => (t.id === id ? tarefa : t))
            : noFim ? [...lista, tarefa] : [tarefa, ...lista]

        return linhaNova.excluida_em
          ? (d) => ({ ...d, tarefas: semEla(d.tarefas), lixeira: colocar(d.lixeira, false) })
          : (d) => ({ ...d, tarefas: colocar(d.tarefas, true), lixeira: semEla(d.lixeira) })
      })
    }

    // Equipe: se mudou algo e eu não estou mexendo nela, carrega a lista de novo
    async function recarregarEquipe() {
      const { data, error } = await supabase
        .from('membros')
        .select('*')
        .eq('quadro_id', quadroId)
        .order('posicao')
      if (error) return
      atualizar((atual) => {
        const agora = fotografar(linhasDosMembros(atual), 'nome')
        if (JSON.stringify(agora) !== JSON.stringify(salvo.current.membros)) return null
        const equipe = data.map(({ nome, cor }) => ({ nome, cor }))
        salvo.current.membros = fotografar(linhasDosMembros({ quadroId, equipe }), 'nome')
        return (d) => ({ ...d, equipe })
      })
    }

    const tabela = (nome, evento, filtro) => ({
      event: evento,
      schema: 'public',
      table: nome,
      ...(filtro && { filter: filtro }),
    })

    // Um "canal" é uma conexão aberta com o Supabase que avisa quando o banco muda.
    // Os filtros (quadro_id=eq...) fazem chegar só o que interessa. As exclusões
    // não aceitam filtro, por isso são conferidas aqui dentro.
    const canal = supabase.channel(`kanguin:${userId}:${quadroId ?? 'nenhum'}`)

    if (quadroId) {
      const doQuadro = `quadro_id=eq.${quadroId}`
      canal
        .on('postgres_changes', tabela('tarefas', 'INSERT', doQuadro), receberTarefa)
        .on('postgres_changes', tabela('tarefas', 'UPDATE', doQuadro), receberTarefa)
        .on('postgres_changes', tabela('tarefas', 'DELETE'), receberTarefa)
        .on('postgres_changes', tabela('membros', 'INSERT', doQuadro), recarregarEquipe)
        .on('postgres_changes', tabela('membros', 'UPDATE', doQuadro), recarregarEquipe)
        .on('postgres_changes', tabela('membros', 'DELETE'), ({ old }) => {
          if (old.quadro_id === quadroId) recarregarEquipe()
        })
    }

    // Meus papéis: alguém mudou o meu papel, me tirou de um quadro, ou eu entrei num
    const recarregarQuadros = () => setVersaoQuadros((v) => v + 1)
    canal
      .on('postgres_changes', tabela('quadro_membros', 'INSERT', `user_id=eq.${userId}`), recarregarQuadros)
      .on('postgres_changes', tabela('quadro_membros', 'UPDATE', `user_id=eq.${userId}`), recarregarQuadros)
      .on('postgres_changes', tabela('quadro_membros', 'DELETE'), ({ old }) => {
        if (old.user_id === userId) recarregarQuadros()
      })

    // Convites para o meu email: chegou um novo, ou cancelaram um
    if (email) {
      canal.on('postgres_changes', tabela('convites', 'INSERT', `email=eq.${email}`), () =>
        setVersaoConvites((v) => v + 1)
      )
    }
    canal.on('postgres_changes', tabela('convites', 'DELETE'), ({ old }) =>
      setConvites((atual) =>
        atual ? { ...atual, lista: atual.lista.filter((c) => c.id !== old.id) } : atual
      )
    )

    canal.subscribe()
    return () => {
      supabase.removeChannel(canal)
    }
  }, [userId, quadroId, email])

  // ===== 3. SALVAR NA NUVEM A CADA MUDANÇA =====
  useEffect(() => {
    if (!dadosNuvem) return

    // Espera 0,6 s sem mudanças antes de salvar (arrastar vários cards = 1 envio só)
    const executar = () => {
      pendente.current = null
      fila.current = fila.current.then(() => salvarDiferencas(dadosNuvem, userId, salvo, setStatusNuvem))
      return fila.current
    }
    const timer = setTimeout(executar, 600)
    pendente.current = { timer, executar }

    return () => clearTimeout(timer)
  }, [dadosNuvem, userId])

  // Salva na hora o que estiver esperando (antes de trocar de quadro ou sair)
  async function salvarAgora() {
    if (pendente.current) {
      clearTimeout(pendente.current.timer)
      await pendente.current.executar()
    } else {
      await fila.current
    }
  }

  // ===== 4. QUADROS: TROCAR E CRIAR =====
  async function trocarQuadro(id) {
    if (id === quadroId) return
    await salvarAgora()
    setQuadroEscolhido(id)
  }

  async function criarQuadro(nome) {
    const { data, error } = await supabase
      .from('quadros')
      .insert({ nome })
      .select('id, nome, dono_id')
      .single()
    if (error) return false

    setQuadros((atual) => ({ ...atual, lista: [...atual.lista, { ...data, papel: 'dono' }] }))
    await trocarQuadro(data.id)
    return true
  }

  // ===== 4B. CONVITES: ACEITAR E RECUSAR =====
  const tirarConvite = (id) =>
    setConvites((atual) => (atual ? { ...atual, lista: atual.lista.filter((c) => c.id !== id) } : atual))

  async function aceitarConvite(convite) {
    const { data: idQuadro, error } = await supabase.rpc('aceitar_convite', { convite: convite.id })
    if (error) return false
    tirarConvite(convite.id)
    await salvarAgora()
    setQuadroEscolhido(idQuadro) // já abre o quadro novo
    setVersaoQuadros((v) => v + 1) // e recarrega a lista, agora com ele
    return true
  }

  async function recusarConvite(convite) {
    const { error } = await supabase.from('convites').delete().eq('id', convite.id)
    if (error) return false
    tirarConvite(convite.id)
    return true
  }

  // Sair de um quadro que é de outra pessoa (o dono não pode sair do próprio)
  async function sairDoQuadro(quadro) {
    await salvarAgora()
    const { data, error } = await supabase
      .from('quadro_membros')
      .delete()
      .eq('quadro_id', quadro.id)
      .eq('user_id', userId)
      .select('user_id')
    if (error || !data?.length) return false

    // Tira da lista; o quadro aberto passa a ser o primeiro em que sou dono
    setQuadros((atual) => ({ ...atual, lista: atual.lista.filter((q) => q.id !== quadro.id) }))
    setQuadroEscolhido(null)
    return true
  }

  // ===== 5. FUNÇÕES "SET" QUE ESCOLHEM ONDE GRAVAR =====
  // Funcionam igual ao setState: aceitam um valor ou uma função (atual) => novo
  function criarSetter(campo, setLocal) {
    return (valorOuFuncao) => {
      if (!logado) {
        setLocal(valorOuFuncao)
        return
      }
      setNuvem((atual) => {
        if (!atual) return atual // ainda carregando
        const novo = typeof valorOuFuncao === 'function' ? valorOuFuncao(atual[campo]) : valorOuFuncao
        return { ...atual, [campo]: novo }
      })
    }
  }

  // ===== 6. LEVAR O QUADRO DO NAVEGADOR PARA A CONTA =====
  const totalLocal = tarefasLocal.length + lixeiraLocal.length

  // Pergunta só se: está logado, o quadro já carregou, há tarefas no navegador
  // e a pessoa ainda não respondeu "Agora não" nesta conta
  const perguntarMigracao =
    Boolean(dadosNuvem) && totalLocal > 0 && !migracaoRecusada.includes(userId)

  function levarParaNuvem() {
    // Ids novos, para não haver conflito com tarefas que já existem no banco
    const comIdNovo = (tarefa) => ({ ...tarefa, id: gerarId(), criado_por: userId })

    setNuvem((atual) => {
      if (!atual) return atual
      const nomesNaNuvem = atual.equipe.map((membro) => membro.nome)
      return {
        ...atual,
        tarefas: [...atual.tarefas, ...tarefasLocal.map(comIdNovo)],
        lixeira: [...atual.lixeira, ...lixeiraLocal.map(comIdNovo)],
        // Junta as equipes sem repetir nomes
        equipe: [...atual.equipe, ...equipeLocal.filter((m) => !nomesNaNuvem.includes(m.nome))],
      }
    })

    // Agora elas ficam só na conta
    setTarefasLocal([])
    setLixeiraLocal([])
    setEquipeLocal([])
  }

  function deixarNoNavegador() {
    setMigracaoRecusada([...migracaoRecusada, userId])
  }

  return {
    tarefas: logado ? (dadosNuvem?.tarefas ?? []) : tarefasLocal,
    lixeira: logado ? (dadosNuvem?.lixeira ?? []) : lixeiraLocal,
    equipe: logado ? (dadosNuvem?.equipe ?? []) : equipeLocal,
    setTarefas: criarSetter('tarefas', setTarefasLocal),
    setLixeira: criarSetter('lixeira', setLixeiraLocal),
    setEquipe: criarSetter('equipe', setEquipeLocal),
    // 'local' = sem login; senão 'carregando', 'salvando', 'sincronizado' ou 'erro'
    statusNuvem: !logado ? 'local' : dadosNuvem || statusNuvem === 'erro' ? statusNuvem : 'carregando',
    migracao: perguntarMigracao ? { total: totalLocal, levarParaNuvem, deixarNoNavegador } : null,
    // Quadros (só com login)
    quadros: listaQuadros ?? [],
    quadroAtual,
    trocarQuadro,
    criarQuadro,
    salvarAgora,
    // Convites recebidos
    convites: logado && convites?.userId === userId ? convites.lista : [],
    aceitarConvite,
    recusarConvite,
    sairDoQuadro,
  }
}

export default useDadosKanguin
