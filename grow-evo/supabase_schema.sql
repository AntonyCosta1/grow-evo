-- Execute este SQL no Supabase SQL Editor

-- Tabela de perfis (criada automaticamente via trigger no registro)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text not null,
  avatar_url text,
  total_xp integer not null default 0,
  level integer not null default 1,
  rank text not null default 'novice',
  streak integer not null default 0,
  tasks_completed integer not null default 0,
  created_at timestamptz not null default now()
);

-- Tabela de tarefas
create table public.tasks (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  title text not null,
  description text,
  category text not null default 'health',
  frequency text not null default 'daily',
  difficulty text not null default 'medium',
  xp_reward integer not null default 50,
  is_active boolean not null default true,
  streak integer not null default 0,
  last_completed_date timestamptz,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

-- Tabela de logs de conclusão
create table public.completion_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  task_id uuid references public.tasks(id) on delete cascade not null,
  completed_at timestamptz not null default now(),
  xp_earned integer not null default 0
);

-- Trigger para criar perfil automaticamente ao registrar
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username)
  values (new.id, coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)));
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- RLS (Row Level Security)
alter table public.profiles enable row level security;
alter table public.tasks enable row level security;
alter table public.completion_logs enable row level security;

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

create policy "Users can view own tasks" on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on public.tasks for delete using (auth.uid() = user_id);

create policy "Users can view own logs" on public.completion_logs for select using (auth.uid() = user_id);
create policy "Users can insert own logs" on public.completion_logs for insert with check (auth.uid() = user_id);

-- =============================================
-- SISTEMA SOCIAL
-- Execute este bloco separadamente se o schema
-- inicial já foi aplicado.
-- =============================================

-- Código de convite no perfil
alter table public.profiles add column if not exists invite_code text unique;
update public.profiles set invite_code = 'GROW-' || upper(substring(id::text, 1, 8)) where invite_code is null;

-- Trigger para gerar invite_code automaticamente nos novos usuários
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, invite_code)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    'GROW-' || upper(substring(new.id::text, 1, 8))
  );
  return new;
end;
$$ language plpgsql security definer;

-- Permitir que todos vejam perfis (necessário para busca por código)
create policy "Profiles are publicly viewable" on public.profiles
  for select using (true);

-- Tabela de amizades
create table if not exists public.friendships (
  id uuid primary key default gen_random_uuid(),
  requester_id uuid references public.profiles(id) on delete cascade not null,
  addressee_id uuid references public.profiles(id) on delete cascade not null,
  status text not null default 'pending',
  created_at timestamptz not null default now(),
  unique(requester_id, addressee_id)
);

alter table public.friendships enable row level security;

create policy "Ver próprias amizades" on public.friendships
  for select using (auth.uid() = requester_id or auth.uid() = addressee_id);
create policy "Criar pedido de amizade" on public.friendships
  for insert with check (auth.uid() = requester_id);
create policy "Atualizar amizade" on public.friendships
  for update using (auth.uid() = addressee_id or auth.uid() = requester_id);
create policy "Deletar amizade" on public.friendships
  for delete using (auth.uid() = addressee_id or auth.uid() = requester_id);

-- Tabela de feed de atividades
create table if not exists public.activity_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles(id) on delete cascade not null,
  type text not null,
  payload jsonb,
  created_at timestamptz not null default now()
);

alter table public.activity_logs enable row level security;

create policy "Inserir próprio log" on public.activity_logs
  for insert with check (auth.uid() = user_id);

create policy "Ver logs de amigos" on public.activity_logs
  for select using (
    auth.uid() = user_id or
    exists (
      select 1 from public.friendships
      where status = 'accepted'
      and (
        (requester_id = auth.uid() and addressee_id = user_id)
        or (addressee_id = auth.uid() and requester_id = user_id)
      )
    )
  );
