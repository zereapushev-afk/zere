create table public.support_messages (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  topic text not null check (topic in ('ai_appeal', 'support')),
  message text not null check (char_length(message) between 10 and 2000),
  ai_score integer check (ai_score between 0 and 100),
  status text not null default 'new' check (status in ('new', 'reviewing', 'resolved')),
  created_at timestamptz not null default now()
);

alter table public.support_messages enable row level security;

create policy "users create own support messages"
  on public.support_messages for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "users read own support messages"
  on public.support_messages for select
  to authenticated
  using (auth.uid() = user_id);
