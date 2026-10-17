-- ============================================================
-- PORTAL MACEDO — Schema DDL + RLS + RPC
-- Execute no SQL Editor do Supabase (em ordem)
-- ============================================================

-- Extensões
create extension if not exists "uuid-ossp";

-- ============================================================
-- 1. Perfis de Usuário (vinculado ao auth.users)
-- ============================================================
create table public.profiles (
  id          uuid references auth.users(id) on delete cascade primary key,
  nome        text not null,
  email       text not null unique,
  role        text not null check (role in ('teacher', 'student')),
  telefone    text,
  ativo       boolean default true,
  created_at  timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- 2. Registro de Aulas / Dossiê Pedagógico
-- ============================================================
create table public.aulas_registro (
  id                      uuid default uuid_generate_v4() primary key,
  teacher_id              uuid references public.profiles(id) not null,
  student_id              uuid references public.profiles(id) on delete cascade not null,
  data_aula               date not null default current_date,
  modalidade              text not null check (modalidade in ('online', 'presencial')),
  duracao_horas           numeric(4,2) not null check (duracao_horas > 0),
  taxa_transporte         numeric(10,2) default 0.00,
  valor_pago              numeric(10,2) not null,
  status_pagamento        text not null default 'pendente' check (status_pagamento in ('pago', 'pendente')),
  conteudo_ensinado       text not null,
  teve_tarefa             boolean default false,
  descricao_tarefa        text,
  google_calendar_event_id text,
  link_chamada            text,
  created_at              timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- 3. Repositório de Materiais Didáticos
-- ============================================================
create table public.materiais (
  id                   uuid default uuid_generate_v4() primary key,
  teacher_id           uuid references public.profiles(id) not null,
  titulo               text not null,
  descricao            text,
  tipo                 text not null check (tipo in ('pdf', 'video', 'exercicio')),
  url_storage_ou_embed text not null,
  student_id           uuid references public.profiles(id) on delete set null,
  created_at           timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- 4. Transações Financeiras (Mercado Pago)
-- ============================================================
create table public.pagamentos (
  id              uuid default uuid_generate_v4() primary key,
  student_id      uuid references public.profiles(id) on delete cascade not null,
  aula_id         uuid references public.aulas_registro(id) on delete set null,
  mp_payment_id   text unique,
  valor           numeric(10,2) not null,
  status          text not null check (status in ('pending', 'approved', 'rejected', 'refunded')),
  metodo          text check (metodo in ('pix', 'credit_card', 'manual')),
  created_at      timestamp with time zone default timezone('utc'::text, now()) not null
);

-- ============================================================
-- 5. Row Level Security
-- ============================================================
alter table public.profiles       enable row level security;
alter table public.aulas_registro enable row level security;
alter table public.materiais      enable row level security;
alter table public.pagamentos     enable row level security;

-- Função auxiliar: verifica se o usuário logado é teacher
create or replace function public.is_teacher()
returns boolean as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'teacher'
  );
$$ language sql security definer;

-- Profiles
create policy "Teacher tem acesso total aos profiles"
  on public.profiles for all
  using (public.is_teacher());

create policy "Student visualiza apenas seu próprio perfil"
  on public.profiles for select
  using (auth.uid() = id);

-- Aulas Registro
create policy "Teacher tem controle de todas as aulas"
  on public.aulas_registro for all
  using (public.is_teacher());

create policy "Student visualiza apenas suas aulas"
  on public.aulas_registro for select
  using (auth.uid() = student_id);

-- Materiais
create policy "Teacher gerencia materiais"
  on public.materiais for all
  using (public.is_teacher());

create policy "Student acessa materiais atribuídos ou globais"
  on public.materiais for select
  using (student_id is null or student_id = auth.uid());

-- Pagamentos
create policy "Teacher gerencia pagamentos"
  on public.pagamentos for all
  using (public.is_teacher());

create policy "Student visualiza apenas seus pagamentos"
  on public.pagamentos for select
  using (auth.uid() = student_id);

-- ============================================================
-- 6. Trigger: criar perfil automaticamente ao signup
-- ============================================================
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, nome, email, role)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'nome', split_part(new.email, '@', 1)),
    new.email,
    coalesce(new.raw_user_meta_data->>'role', 'student')
  );
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ============================================================
-- 7. RPC: Dashboard Analytics do Professor
-- ============================================================
create or replace function public.get_teacher_dashboard_analytics(p_teacher_id uuid)
returns json as $$
  select json_build_object(
    'ganho_hoje',       coalesce(sum(valor_pago) filter (where data_aula = current_date and status_pagamento = 'pago'), 0),
    'ganho_semana',     coalesce(sum(valor_pago) filter (where data_aula >= date_trunc('week', current_date) and status_pagamento = 'pago'), 0),
    'ganho_mes',        coalesce(sum(valor_pago) filter (where data_aula >= date_trunc('month', current_date) and status_pagamento = 'pago'), 0),
    'ganho_ano',        coalesce(sum(valor_pago) filter (where data_aula >= date_trunc('year', current_date) and status_pagamento = 'pago'), 0),
    'valor_pendente',   coalesce(sum(valor_pago) filter (where status_pagamento = 'pendente'), 0),

    'total_aulas_mes',       count(*) filter (where data_aula >= date_trunc('month', current_date)),
    'total_horas_mes',       coalesce(sum(duracao_horas) filter (where data_aula >= date_trunc('month', current_date)), 0),
    'alunos_ativos_mes',     count(distinct student_id) filter (where data_aula >= date_trunc('month', current_date)),
    'aulas_chamada_mes',     count(*) filter (where modalidade = 'online'     and data_aula >= date_trunc('month', current_date)),
    'aulas_presenciais_mes', count(*) filter (where modalidade = 'presencial' and data_aula >= date_trunc('month', current_date)),
    'taxa_tarefas_passadas', round(
      (count(*) filter (where teve_tarefa = true and data_aula >= date_trunc('month', current_date))::numeric /
       nullif(count(*) filter (where data_aula >= date_trunc('month', current_date)), 0)) * 100, 2
    )
  )
  from public.aulas_registro
  where teacher_id = p_teacher_id;
$$ language sql security definer;

-- ============================================================
-- 8. Índices para performance
-- ============================================================
create index idx_aulas_teacher_data  on public.aulas_registro (teacher_id, data_aula);
create index idx_aulas_student       on public.aulas_registro (student_id);
create index idx_pagamentos_student  on public.pagamentos (student_id);
create index idx_materiais_student   on public.materiais (student_id);
