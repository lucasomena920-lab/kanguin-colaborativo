-- =====================================================================
-- Kanguin: mensagens de suporte e feedback (fase 7)
-- Rode DEPOIS do 06-seguranca-funcoes.sql. Pode rodar mais de uma vez.
--
-- Qualquer pessoa (com ou sem conta) pode MANDAR uma mensagem pelo app.
-- Ninguém consegue LER as mensagens pela API: só você, no Supabase,
-- em Table Editor -> feedback.
-- =====================================================================

create table if not exists public.feedback (
  id uuid primary key default gen_random_uuid(),
  criado_em timestamptz not null default now(),
  tipo text not null check (tipo in ('sugestao', 'problema', 'elogio', 'outro')),
  mensagem text not null check (char_length(mensagem) between 1 and 2000),
  -- Email para resposta (opcional)
  email text check (email is null or char_length(email) <= 200),
  -- Quem mandou, se estava logado (preenchido sozinho pelo banco)
  user_id uuid default auth.uid() references auth.users (id) on delete set null,
  -- Em que página e idioma a pessoa estava (ajuda a entender problemas)
  pagina text check (pagina is null or char_length(pagina) <= 100),
  idioma text check (idioma is null or char_length(idioma) <= 10),
  -- Já li / já respondi (você marca no Table Editor)
  resolvido boolean not null default false
);

alter table public.feedback enable row level security;

-- Só pode CRIAR. Sem regra de leitura, edição ou exclusão: ninguém faz isso pela API.
drop policy if exists "feedback: enviar" on public.feedback;
create policy "feedback: enviar" on public.feedback
  for insert to anon, authenticated
  with check (
    resolvido = false
    -- Ninguém consegue mandar fingindo ser outra pessoa
    and (user_id is null or user_id = (select auth.uid()))
  );
