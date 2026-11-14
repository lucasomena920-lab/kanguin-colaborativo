import { supabase } from './supabase.js'

// Manda um convite para entrar no quadro.
// Devolve { convite } se deu certo, ou { erro } com a chave da mensagem de erro.
export async function enviarConvite(quadroId, email, papel) {
  const { data, error } = await supabase
    .from('convites')
    .insert({ quadro_id: quadroId, email, papel })
    .select('id, email, papel, criado_em')
    .single()

  if (!error) return { convite: data }
  // 23505 = já existe um convite igual (unique); 42501 = a regra de segurança barrou
  if (error.code === '23505') return { erro: 'compartilhar.erros.jaConvidado' }
  if (error.code === '42501') return { erro: 'compartilhar.erros.semPermissao' }
  return { erro: 'auth.erros.generico' }
}
