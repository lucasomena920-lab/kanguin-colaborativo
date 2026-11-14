-- =====================================================================
-- Kanguin: compartilhamento de quadros (fase 2)
-- Rode DEPOIS do schema.sql, no SQL Editor do Supabase (cole tudo e clique em Run).
-- As tarefas e a equipe que já existem passam para o "Meu quadro" de cada pessoa.
--
-- Papéis:
--   dono        -> faz tudo: convida (inclusive admins), muda papéis, remove pessoas e apaga o quadro
--   admin       -> "sub-admin": convida e gerencia editores, colaboradores e leitores,
--                  e mexe em qualquer tarefa (não mexe no dono nem em outros admins)
--   editor      -> cria e mexe em qualquer tarefa
--   colaborador -> cria tarefas e mexe só nas que ele criou
--   leitor      -> só vê
-- =====================================================================


-- =====================================================================
-- 1. TABELAS NOVAS
-- =====================================================================

-- Nome que aparece para os outros membros dos quadros
create table public.perfis (
  id uuid primary key references auth.users (id) on delete cascade,
  nome text not null check (char_length(nome) between 1 and 40),
  email text not null
);

create table public.quadros (
  id uuid primary key default gen_random_uuid(),
  nome text not null default 'Meu quadro' check (char_length(nome) between 1 and 60),
  dono_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now()
);

create table public.quadro_membros (
  quadro_id uuid not null references public.quadros (id) on delete cascade,
  user_id uuid not null references auth.users (id) on delete cascade,
  papel text not null check (papel in ('dono', 'admin', 'editor', 'colaborador', 'leitor')),
  entrou_em timestamptz not null default now(),
  primary key (quadro_id, user_id)
);

create index quadro_membros_user_id_idx on public.quadro_membros (user_id);

create table public.convites (
  id uuid primary key default gen_random_uuid(),
  quadro_id uuid not null references public.quadros (id) on delete cascade,
  email text not null check (email = lower(email)),
  papel text not null check (papel in ('admin', 'editor', 'colaborador', 'leitor')),
  convidado_por uuid not null default auth.uid() references auth.users (id) on delete cascade,
  criado_em timestamptz not null default now(),
  unique (quadro_id, email)
);


-- =====================================================================
-- 2. FUNÇÕES DE APOIO
-- (security definer = rodam com permissão total, para as regras não
--  ficarem "presas" consultando tabelas que também têm regras)
-- =====================================================================

-- Papel de quem está logado num quadro (null = não participa)
create or replace function public.meu_papel(quadro uuid)
returns text
language sql stable security definer set search_path = ''
as $$
  select papel from public.quadro_membros
  where quadro_id = quadro and user_id = auth.uid()
$$;

-- Duas pessoas participam de algum quadro em comum?
create or replace function public.compartilha_quadro_com(outro uuid)
returns boolean
language sql stable security definer set search_path = ''
as $$
  select exists (
    select 1
    from public.quadro_membros eu
    join public.quadro_membros ele on ele.quadro_id = eu.quadro_id
    where eu.user_id = auth.uid() and ele.user_id = outro
  )
$$;

-- Email de quem está logado (vem do token de login)
create or replace function public.meu_email()
returns text
language sql stable set search_path = ''
as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''))
$$;

-- Toda conta nova ganha um perfil e o seu "Meu quadro"
create or replace function public.preparar_conta_nova()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.perfis (id, nome, email)
  values (new.id, split_part(new.email, '@', 1), lower(new.email));

  -- O trigger "ao_criar_quadro" (abaixo) coloca a pessoa como dona
  insert into public.quadros (nome, dono_id)
  values ('Meu quadro', new.id);

  return new;
end;
$$;

create trigger ao_criar_conta
  after insert on auth.users
  for each row execute function public.preparar_conta_nova();

-- Quem cria um quadro novo vira o dono dele
create or replace function public.dono_entra_no_quadro()
returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.quadro_membros (quadro_id, user_id, papel)
  values (new.id, new.dono_id, 'dono')
  on conflict do nothing;
  return new;
end;
$$;

create trigger ao_criar_quadro
  after insert on public.quadros
  for each row execute function public.dono_entra_no_quadro();

-- Aceitar um convite: confere o email e entra no quadro com o papel do convite
create or replace function public.aceitar_convite(convite uuid)
returns uuid
language plpgsql security definer set search_path = ''
as $$
declare
  c public.convites;
begin
  select * into c from public.convites
  where id = convite and email = public.meu_email();

  if c.id is null then
    raise exception 'Convite não encontrado';
  end if;

  insert into public.quadro_membros (quadro_id, user_id, papel)
  values (c.quadro_id, auth.uid(), c.papel)
  on conflict (quadro_id, user_id) do nothing;

  delete from public.convites where id = c.id;
  return c.quadro_id;
end;
$$;


-- =====================================================================
-- 3. CONTAS QUE JÁ EXISTEM: perfil, "Meu quadro" e tarefas
-- =====================================================================

insert into public.perfis (id, nome, email)
select id, split_part(email, '@', 1), lower(email)
from auth.users
on conflict (id) do nothing;

-- O trigger "ao_criar_quadro" já coloca cada um como dono
insert into public.quadros (nome, dono_id)
select 'Meu quadro', u.id
from auth.users u
where not exists (select 1 from public.quadros q where q.dono_id = u.id);

-- TAREFAS: "user_id" vira "criado_por" e cada tarefa ganha o seu quadro
drop policy "tarefas: ver as próprias" on public.tarefas;
drop policy "tarefas: criar as próprias" on public.tarefas;
drop policy "tarefas: editar as próprias" on public.tarefas;
drop policy "tarefas: apagar as próprias" on public.tarefas;

alter table public.tarefas rename column user_id to criado_por;
alter table public.tarefas add column quadro_id uuid references public.quadros (id) on delete cascade;

update public.tarefas t
set quadro_id = (select q.id from public.quadros q where q.dono_id = t.criado_por order by q.criado_em limit 1);

alter table public.tarefas alter column quadro_id set not null;
create index tarefas_quadro_id_idx on public.tarefas (quadro_id);

-- EQUIPE (lista de nomes): passa a ser de cada quadro
drop policy "membros: ver os próprios" on public.membros;
drop policy "membros: criar os próprios" on public.membros;
drop policy "membros: editar os próprios" on public.membros;
drop policy "membros: apagar os próprios" on public.membros;

alter table public.membros add column quadro_id uuid references public.quadros (id) on delete cascade;

update public.membros m
set quadro_id = (select q.id from public.quadros q where q.dono_id = m.user_id order by q.criado_em limit 1);

alter table public.membros drop constraint membros_pkey;
alter table public.membros drop column user_id;
alter table public.membros alter column quadro_id set not null;
alter table public.membros add primary key (quadro_id, nome);


-- =====================================================================
-- 4. REGRAS DE SEGURANÇA (Row Level Security)
-- =====================================================================

alter table public.perfis enable row level security;
alter table public.quadros enable row level security;
alter table public.quadro_membros enable row level security;
alter table public.convites enable row level security;

-- PERFIS: vejo o meu e o de quem divide um quadro comigo; edito só o meu
create policy "perfis: ver" on public.perfis
  for select to authenticated
  using (id = (select auth.uid()) or public.compartilha_quadro_com(id));
create policy "perfis: editar o meu" on public.perfis
  for update to authenticated
  using (id = (select auth.uid())) with check (id = (select auth.uid()));

-- QUADROS: vejo os que participo; crio os meus; só o dono renomeia ou apaga
create policy "quadros: ver" on public.quadros
  for select to authenticated
  using (dono_id = (select auth.uid()) or public.meu_papel(id) is not null);
create policy "quadros: criar" on public.quadros
  for insert to authenticated with check (dono_id = (select auth.uid()));
create policy "quadros: editar" on public.quadros
  for update to authenticated
  using (public.meu_papel(id) = 'dono') with check (dono_id = (select auth.uid()));
create policy "quadros: apagar" on public.quadros
  for delete to authenticated using (public.meu_papel(id) = 'dono');

-- MEMBROS DO QUADRO: todos do quadro veem quem participa.
-- Dono: muda o papel e remove qualquer um (menos ele mesmo).
-- Admin: só mexe em editores, colaboradores e leitores, e não cria outros admins.
-- Qualquer um (menos o dono) pode sair do quadro.
create policy "quadro_membros: ver" on public.quadro_membros
  for select to authenticated using (public.meu_papel(quadro_id) is not null);
create policy "quadro_membros: mudar papel" on public.quadro_membros
  for update to authenticated
  using (
    (public.meu_papel(quadro_id) = 'dono' and papel <> 'dono')
    or (public.meu_papel(quadro_id) = 'admin' and papel in ('editor', 'colaborador', 'leitor'))
  )
  with check (
    papel <> 'dono'
    and (public.meu_papel(quadro_id) = 'dono' or papel <> 'admin')
  );
create policy "quadro_membros: remover ou sair" on public.quadro_membros
  for delete to authenticated
  using (
    papel <> 'dono'
    and (
      public.meu_papel(quadro_id) = 'dono'
      or (public.meu_papel(quadro_id) = 'admin' and papel <> 'admin')
      or user_id = (select auth.uid())
    )
  );

-- CONVITES: dono e admin veem, criam e cancelam (só o dono convida admins);
-- o convidado vê e recusa os seus
create policy "convites: ver" on public.convites
  for select to authenticated
  using (public.meu_papel(quadro_id) in ('dono', 'admin') or email = public.meu_email());
create policy "convites: criar" on public.convites
  for insert to authenticated
  with check (
    convidado_por = (select auth.uid())
    and (
      public.meu_papel(quadro_id) = 'dono'
      or (public.meu_papel(quadro_id) = 'admin' and papel <> 'admin')
    )
  );
create policy "convites: cancelar ou recusar" on public.convites
  for delete to authenticated
  using (public.meu_papel(quadro_id) in ('dono', 'admin') or email = public.meu_email());

-- TAREFAS
create policy "tarefas: ver" on public.tarefas
  for select to authenticated using (public.meu_papel(quadro_id) is not null);
create policy "tarefas: criar" on public.tarefas
  for insert to authenticated
  with check (
    public.meu_papel(quadro_id) in ('dono', 'admin', 'editor', 'colaborador')
    and criado_por = (select auth.uid())
  );
create policy "tarefas: editar" on public.tarefas
  for update to authenticated
  using (
    public.meu_papel(quadro_id) in ('dono', 'admin', 'editor')
    or (public.meu_papel(quadro_id) = 'colaborador' and criado_por = (select auth.uid()))
  )
  with check (public.meu_papel(quadro_id) in ('dono', 'admin', 'editor', 'colaborador'));
create policy "tarefas: apagar" on public.tarefas
  for delete to authenticated
  using (
    public.meu_papel(quadro_id) in ('dono', 'admin', 'editor')
    or (public.meu_papel(quadro_id) = 'colaborador' and criado_por = (select auth.uid()))
  );

-- EQUIPE (lista de nomes): todos veem; dono, admin e editor mudam
create policy "membros: ver" on public.membros
  for select to authenticated using (public.meu_papel(quadro_id) is not null);
create policy "membros: criar" on public.membros
  for insert to authenticated with check (public.meu_papel(quadro_id) in ('dono', 'admin', 'editor'));
create policy "membros: editar" on public.membros
  for update to authenticated
  using (public.meu_papel(quadro_id) in ('dono', 'admin', 'editor'))
  with check (public.meu_papel(quadro_id) in ('dono', 'admin', 'editor'));
create policy "membros: apagar" on public.membros
  for delete to authenticated using (public.meu_papel(quadro_id) in ('dono', 'admin', 'editor'));
