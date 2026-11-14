-- =====================================================================
-- Kanguin: tempo real (fase 4)
-- Rode DEPOIS do 03-convites-recebidos.sql.
--
-- Liga o "Realtime" do Supabase nestas tabelas: quando uma linha muda,
-- o Supabase avisa na hora quem está com o app aberto.
-- As regras de segurança continuam valendo: cada pessoa só recebe
-- as mudanças das linhas que ela já podia ver.
--
-- Confere tabela por tabela e só adiciona as que faltam
-- (pode rodar mais de uma vez sem dar erro).
-- =====================================================================

do $$
declare
  tabela text;
begin
  foreach tabela in array array['tarefas', 'membros', 'quadro_membros', 'convites'] loop
    if not exists (
      select 1 from pg_publication_tables
      where pubname = 'supabase_realtime' and schemaname = 'public' and tablename = tabela
    ) then
      execute format('alter publication supabase_realtime add table public.%I', tabela);
    end if;
  end loop;
end $$;
