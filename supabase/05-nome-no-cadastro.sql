-- =====================================================================
-- Kanguin: nome escolhido no cadastro (fase 5)
-- Rode DEPOIS do 04-tempo-real.sql. Pode rodar mais de uma vez.
--
-- Antes, o nome de cada pessoa era a parte do email antes do "@".
-- Agora, se a pessoa escrever o nome ao criar a conta, ele é usado.
-- (Quem já tem conta pode mudar o nome pelo menu da conta, no app.)
-- =====================================================================

create or replace function public.preparar_conta_nova()
returns trigger
language plpgsql security definer set search_path = ''
as $$
declare
  nome_escolhido text;
begin
  -- O app manda o nome junto com o cadastro (em "raw_user_meta_data")
  nome_escolhido := left(nullif(trim(new.raw_user_meta_data ->> 'nome'), ''), 40);

  insert into public.perfis (id, nome, email)
  values (
    new.id,
    -- Sem nome: usa o começo do email (cortado em 40 letras, o limite da coluna)
    coalesce(nome_escolhido, left(split_part(new.email, '@', 1), 40)),
    lower(new.email)
  );

  -- O trigger "ao_criar_quadro" coloca a pessoa como dona
  insert into public.quadros (nome, dono_id)
  values ('Meu quadro', new.id);

  return new;
end;
$$;
