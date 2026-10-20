-- Endereço da aula presencial (rodar no SQL Editor do Supabase, depois da 002)
alter table public.aulas_registro
  add column if not exists endereco text;

alter table public.aulas_registro
  drop constraint if exists aulas_registro_endereco_presencial;

alter table public.aulas_registro
  add constraint aulas_registro_endereco_presencial
  check (modalidade <> 'presencial' or endereco is not null and length(trim(endereco)) > 0)
  not valid;
