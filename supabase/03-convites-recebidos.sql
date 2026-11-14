-- =====================================================================
-- Kanguin: convites recebidos (fase 3)
-- Rode DEPOIS do 02-compartilhamento.sql, uma vez só.
--
-- Quem recebe um convite ainda não participa do quadro, então as regras
-- de segurança não deixam ver o nome do quadro nem de quem convidou.
-- Esta função devolve só isso, e só dos convites para o SEU email.
-- =====================================================================

create or replace function public.meus_convites()
returns table (
  id uuid,
  quadro_id uuid,
  quadro_nome text,
  dono_nome text,
  convidado_por_nome text,
  papel text,
  criado_em timestamptz
)
language sql stable security definer set search_path = ''
as $$
  select c.id, c.quadro_id, q.nome, dono.nome, quem.nome, c.papel, c.criado_em
  from public.convites c
  join public.quadros q on q.id = c.quadro_id
  left join public.perfis dono on dono.id = q.dono_id
  left join public.perfis quem on quem.id = c.convidado_por
  where c.email = public.meu_email() and public.meu_email() <> ''
  order by c.criado_em
$$;

-- Só quem está logado pode chamar
revoke execute on function public.meus_convites() from public, anon;
grant execute on function public.meus_convites() to authenticated;
