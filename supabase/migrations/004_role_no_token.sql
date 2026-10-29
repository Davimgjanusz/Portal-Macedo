-- Copia o papel (teacher/student) para o app_metadata do usuário, que vai no token de login.
-- O middleware lê o papel do token e não precisa consultar a tabela profiles a cada página.
-- O app_metadata só pode ser alterado pelo servidor, nunca pelo próprio usuário.
-- Rodar no SQL Editor do Supabase, depois da 003.

create or replace function public.sync_role_app_metadata()
returns trigger as $$
begin
  update auth.users
     set raw_app_meta_data = coalesce(raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', new.role)
   where id = new.id;
  return new;
end;
$$ language plpgsql security definer set search_path = public, auth;

drop trigger if exists on_profile_role_sync on public.profiles;

create trigger on_profile_role_sync
  after insert or update of role on public.profiles
  for each row execute function public.sync_role_app_metadata();

-- Preenche o papel dos usuários que já existem
update auth.users u
   set raw_app_meta_data = coalesce(u.raw_app_meta_data, '{}'::jsonb) || jsonb_build_object('role', p.role)
  from public.profiles p
 where p.id = u.id;
