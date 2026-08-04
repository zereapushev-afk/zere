alter table public.entries
  add column is_removed boolean not null default false,
  add column moderation_reason text check (char_length(moderation_reason) <= 1000),
  add column moderated_at timestamptz;

create table public.artwork_appeals (
  id uuid primary key default gen_random_uuid(),
  entry_id uuid not null unique references public.entries (id) on delete cascade,
  user_id uuid not null default auth.uid() references auth.users (id) on delete cascade,
  body text not null check (char_length(body) between 10 and 2000),
  status text not null default 'pending' check (status in ('pending', 'accepted')),
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

alter table public.artwork_appeals enable row level security;

create policy "authors read own artwork appeals"
  on public.artwork_appeals for select to authenticated
  using (auth.uid() = user_id);

create policy "developers read artwork appeals"
  on public.artwork_appeals for select to authenticated
  using (lower(auth.jwt() ->> 'email') = 'zereapushev@gmail.com');

drop policy "authenticated users read artworks" on public.entries;
create policy "users read visible or relevant artworks"
  on public.entries for select to authenticated
  using (
    not is_removed
    or auth.uid() = user_id
    or lower(auth.jwt() ->> 'email') = 'zereapushev@gmail.com'
  );

create or replace function public.protect_artwork_moderation_fields()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if old.is_removed is distinct from new.is_removed
    or old.moderation_reason is distinct from new.moderation_reason
    or old.moderated_at is distinct from new.moderated_at then
    if lower(auth.jwt() ->> 'email') <> 'zereapushev@gmail.com' then
      raise exception 'Only the developer can change moderation fields';
    end if;
  end if;
  return new;
end;
$$;

create trigger protect_artwork_moderation_fields
  before update on public.entries for each row
  execute function public.protect_artwork_moderation_fields();

create or replace function public.moderate_artwork(target_entry_id uuid, reason text)
returns void language plpgsql security definer set search_path = '' as $$
declare artwork_owner uuid; artwork_title text;
begin
  if lower(auth.jwt() ->> 'email') <> 'zereapushev@gmail.com' then raise exception 'Forbidden'; end if;
  if char_length(trim(reason)) < 5 then raise exception 'Reason is too short'; end if;
  update public.entries set is_removed = true, moderation_reason = trim(reason), moderated_at = now()
  where id = target_entry_id and not is_removed returning user_id, title into artwork_owner, artwork_title;
  if artwork_owner is null then raise exception 'Artwork not found'; end if;
  if artwork_owner <> auth.uid() then
    insert into public.direct_messages (sender_id, recipient_id, body)
    values (auth.uid(), artwork_owner, 'Работа «' || artwork_title || '» удалена модератором. Причина: ' || trim(reason) || '. Ты можешь подать апелляцию в разделе «Удалённые работы».');
  end if;
end;
$$;

create or replace function public.submit_artwork_appeal(target_entry_id uuid, appeal_body text)
returns void language plpgsql security definer set search_path = '' as $$
declare artwork_title text; developer_id uuid;
begin
  select title into artwork_title from public.entries
  where id = target_entry_id and user_id = auth.uid() and is_removed;
  if artwork_title is null then raise exception 'Removed artwork not found'; end if;
  if char_length(trim(appeal_body)) < 10 then raise exception 'Appeal is too short'; end if;
  insert into public.artwork_appeals (entry_id, user_id, body)
  values (target_entry_id, auth.uid(), trim(appeal_body))
  on conflict (entry_id) do update set body = excluded.body, status = 'pending', created_at = now(), resolved_at = null;
  select id into developer_id from auth.users where lower(email) = 'zereapushev@gmail.com' limit 1;
  if developer_id is not null and developer_id <> auth.uid() then
    insert into public.direct_messages (sender_id, recipient_id, body)
    values (auth.uid(), developer_id, 'Подана апелляция на удаление работы «' || artwork_title || '»: ' || trim(appeal_body));
  end if;
end;
$$;

create or replace function public.restore_artwork(target_entry_id uuid)
returns void language plpgsql security definer set search_path = '' as $$
declare artwork_owner uuid; artwork_title text;
begin
  if lower(auth.jwt() ->> 'email') <> 'zereapushev@gmail.com' then raise exception 'Forbidden'; end if;
  update public.entries set is_removed = false, moderation_reason = null, moderated_at = null
  where id = target_entry_id and is_removed returning user_id, title into artwork_owner, artwork_title;
  if artwork_owner is null then raise exception 'Artwork not found'; end if;
  update public.artwork_appeals set status = 'accepted', resolved_at = now() where entry_id = target_entry_id;
  if artwork_owner <> auth.uid() then
    insert into public.direct_messages (sender_id, recipient_id, body)
    values (auth.uid(), artwork_owner, 'Работа «' || artwork_title || '» восстановлена и снова видна в галерее.');
  end if;
end;
$$;

grant execute on function public.moderate_artwork(uuid, text) to authenticated;
grant execute on function public.submit_artwork_appeal(uuid, text) to authenticated;
grant execute on function public.restore_artwork(uuid) to authenticated;
