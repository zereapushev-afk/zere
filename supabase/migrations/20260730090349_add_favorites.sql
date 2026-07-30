create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  entry_id uuid not null references public.entries (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, entry_id)
);

alter table public.favorites enable row level security;

create policy "read own favorites"
  on public.favorites for select
  using (auth.uid() = user_id);

create policy "insert own favorites"
  on public.favorites for insert
  with check (auth.uid() = user_id);

create policy "delete own favorites"
  on public.favorites for delete
  using (auth.uid() = user_id);
