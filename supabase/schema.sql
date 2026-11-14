-- =====================================================================
-- Kanguin: estrutura do banco de dados (Supabase / PostgreSQL)
-- Para recriar o banco, cole tudo no SQL Editor do Supabase e clique em Run.
-- Os nomes das colunas são os mesmos que o app já usa nas tarefas.
-- =====================================================================

-- ===== TAREFAS =====
create table public.tarefas (
  id text primary key,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  titulo text not null check (char_length(titulo) between 1 and 200),
  descripcion text not null default '',
  status text not null check (status in ('a-fazer', 'fazendo', 'feito')),
  prioridad text not null check (prioridad in ('alta', 'media', 'baja')),
  responsable text not null default '',
  tipo_prazo text not null default 'data' check (tipo_prazo in ('data', 'horas')),
  fecha_limite date,
  horas numeric(5, 2) check (horas is null or (horas > 0 and horas <= 24)),
  fecha_creacion date not null default current_date,
  fecha_conclusion date,
  excluida_em timestamptz,          -- preenchido = a tarefa está na lixeira
  atualizada_em timestamptz not null default now()
);

create index tarefas_user_id_idx on public.tarefas (user_id);

-- ===== EQUIPE =====
create table public.membros (
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 30),
  cor text not null,
  posicao int not null default 0,
  primary key (user_id, nome)
);

-- ===== SEGURANÇA (Row Level Security) =====
-- Cada pessoa só consegue ver e mudar as próprias linhas.
alter table public.tarefas enable row level security;
alter table public.membros enable row level security;

create policy "tarefas: ver as próprias" on public.tarefas
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "tarefas: criar as próprias" on public.tarefas
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "tarefas: editar as próprias" on public.tarefas
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "tarefas: apagar as próprias" on public.tarefas
  for delete to authenticated using ((select auth.uid()) = user_id);

create policy "membros: ver os próprios" on public.membros
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "membros: criar os próprios" on public.membros
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "membros: editar os próprios" on public.membros
  for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
create policy "membros: apagar os próprios" on public.membros
  for delete to authenticated using ((select auth.uid()) = user_id);

-- ===== DATA DA ÚLTIMA ALTERAÇÃO =====
-- Atualiza "atualizada_em" sozinho sempre que uma tarefa muda.
create or replace function public.tocar_atualizada_em()
returns trigger language plpgsql set search_path = '' as $$
begin
  new.atualizada_em = now();
  return new;
end;
$$;

create trigger tarefas_atualizada_em
  before update on public.tarefas
  for each row execute function public.tocar_atualizada_em();
