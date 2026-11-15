-- =====================================================================
-- Kanguin: proteger as funções do banco (fase 6)
-- Rode DEPOIS do 05-nome-no-cadastro.sql. Pode rodar mais de uma vez.
--
-- O "Security Advisor" do Supabase avisa que algumas funções podem ser
-- chamadas direto pela internet (pela API), inclusive por quem não fez login.
-- Nenhuma delas vaza dados, mas o certo é cada uma só poder ser usada
-- por quem precisa dela:
--
--   meu_papel / compartilha_quadro_com -> só as regras de segurança usam.
--       Vão para o schema "privado", que a API do Supabase não mostra.
--       (as regras continuam funcionando: elas guardam a função, não o nome)
--   preparar_conta_nova / dono_entra_no_quadro -> só os gatilhos usam.
--       Ninguém precisa chamar direto.
--   aceitar_convite / meus_convites -> o app chama. Só quem fez login.
-- =====================================================================

-- 1. Funções das regras de segurança: schema que não aparece na API
create schema if not exists privado;
grant usage on schema privado to authenticated;

do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'meu_papel') then
    alter function public.meu_papel(uuid) set schema privado;
  end if;
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'compartilha_quadro_com') then
    alter function public.compartilha_quadro_com(uuid) set schema privado;
  end if;
end $$;

revoke all on function privado.meu_papel(uuid) from public, anon;
revoke all on function privado.compartilha_quadro_com(uuid) from public, anon;
grant execute on function privado.meu_papel(uuid) to authenticated;
grant execute on function privado.compartilha_quadro_com(uuid) to authenticated;

-- 2. Funções dos gatilhos: ninguém chama direto
-- (o gatilho funciona mesmo sem essa permissão)
revoke all on function public.preparar_conta_nova() from public, anon, authenticated;
revoke all on function public.dono_entra_no_quadro() from public, anon, authenticated;

-- 3. Funções que o app chama: só quem fez login
revoke all on function public.aceitar_convite(uuid) from public, anon;
grant execute on function public.aceitar_convite(uuid) to authenticated;
revoke all on function public.meus_convites() from public, anon;
grant execute on function public.meus_convites() to authenticated;

-- 4. "rls_auto_enable" não é do Kanguin: o próprio Supabase cria (liga o RLS
-- sozinho em tabelas novas). Também não precisa ser chamada pela API.
do $$
begin
  if exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace
             where n.nspname = 'public' and p.proname = 'rls_auto_enable') then
    execute 'revoke all on function public.rls_auto_enable() from public, anon, authenticated';
  end if;
end $$;
