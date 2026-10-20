-- Horário de início e fim de cada aula (rodar no SQL Editor do Supabase)
alter table public.aulas_registro
  add column if not exists hora_inicio time,
  add column if not exists hora_fim time;

alter table public.aulas_registro
  drop constraint if exists aulas_registro_horario_valido;

alter table public.aulas_registro
  add constraint aulas_registro_horario_valido
  check (hora_inicio is null or hora_fim is null or hora_fim > hora_inicio);
