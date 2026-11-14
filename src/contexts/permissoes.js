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

// Quais papéis cada um pode dar aos outros (o banco confere as mesmas regras)
export function papeisQuePossoDar(meuPapel) {
  if (meuPapel === 'dono') return ['admin', 'editor', 'colaborador', 'leitor']
  if (meuPapel === 'admin') return ['editor', 'colaborador', 'leitor']
  return []
}

// Posso mudar o papel ou tirar essa pessoa do quadro?
export function possoGerenciar(meuPapel, membro, meuId) {
  if (membro.user_id === meuId || membro.papel === 'dono') return false
  if (meuPapel === 'dono') return true
  return meuPapel === 'admin' && membro.papel !== 'admin'
}

// Contexto: deixa as permissões disponíveis para qualquer componente,
// sem precisar passar por props de pai para filho em todos os níveis
export const PermissoesContext = createContext(calcularPermissoes(null, null))

export function usePermissoes() {
  return useContext(PermissoesContext)
}
