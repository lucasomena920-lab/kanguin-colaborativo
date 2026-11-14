import { createContext, useContext } from 'react'

// ===== O QUE CADA PAPEL PODE FAZER NO QUADRO =====
// As mesmas regras estão no banco (RLS). Aqui elas servem para a tela
// esconder ou travar o que a pessoa não pode usar, em vez de dar erro ao salvar.
//
// papel = null quando a pessoa usa sem conta: aí ela pode tudo no quadro dela.
export function calcularPermissoes(papel, userId) {
  const semConta = papel === null
  const mexeEmTudo = semConta || ['dono', 'admin', 'editor'].includes(papel)
  const colaborador = papel === 'colaborador'

  return {
    papel,
    podeCriar: mexeEmTudo || colaborador,
    // Colaborador só mexe nas tarefas que ele criou
    podeEditar: (tarefa) =>
      mexeEmTudo || (colaborador && (!tarefa.criado_por || tarefa.criado_por === userId)),
    // Limpar o quadro, esvaziar a lixeira e mudar a equipe
    podeTudo: mexeEmTudo,
  }
}

// Contexto: deixa as permissões disponíveis para qualquer componente,
// sem precisar passar por props de pai para filho em todos os níveis
export const PermissoesContext = createContext(calcularPermissoes(null, null))

export function usePermissoes() {
  return useContext(PermissoesContext)
}
