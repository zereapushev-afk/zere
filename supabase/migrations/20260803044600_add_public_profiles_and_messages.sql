insert into public.profiles (user_id, display_name)
select
  id,
  coalesce(nullif(raw_user_meta_data ->> 'full_name', ''), split_part(email, '@', 1), 'Пользователь')
from auth.users
on conflict (user_id) do nothing;

create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  insert into public.profiles (user_id, display_name)
  values (
    new.id,
    coalesce(nullif(new.raw_user_meta_data ->> 'full_name', ''), split_part(new.email, '@', 1), 'Пользователь')
  );
  return new;
end;
$$;

create trigger create_profile_after_signup
  after insert on auth.users
  for each row execute function public.create_profile_for_new_user();

create policy "authenticated users read public profiles"
  on public.profiles for select
  to authenticated
  using (true);

create policy "authenticated users read profile avatars"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'avatars');

drop policy "read own entries" on public.entries;
create policy "authenticated users read artworks"
  on public.entries for select
  to authenticated
  using (true);

drop policy "read own artwork files" on storage.objects;
create policy "authenticated users read artwork files"
  on storage.objects for select
  to authenticated
  using (bucket_id = 'artworks');

create table public.direct_messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  recipient_id uuid not null references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 1 and 2000),
  created_at timestamptz not null default now(),
  check (sender_id <> recipient_id)
);

create index direct_messages_sender_index on public.direct_messages (sender_id, created_at desc);
create index direct_messages_recipient_index on public.direct_messages (recipient_id, created_at desc);

alter table public.direct_messages enable row level security;

create policy "participants read direct messages"
  on public.direct_messages for select
  to authenticated
  using (auth.uid() = sender_id or auth.uid() = recipient_id);

create policy "users send direct messages"
  on public.direct_messages for insert
  to authenticated
  with check (auth.uid() = sender_id and auth.uid() <> recipient_id);
