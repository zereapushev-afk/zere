alter table public.entries
  add column current_owner_id uuid references auth.users (id) on delete cascade,
  add column traded_at timestamptz;

update public.entries set current_owner_id = user_id where current_owner_id is null;
alter table public.entries alter column current_owner_id set not null;
alter table public.entries alter column current_owner_id set default auth.uid();

create index entries_current_owner_index on public.entries (current_owner_id);

drop policy if exists "authenticated users read artworks" on public.entries;
drop policy if exists "guests read visible artworks" on public.entries;
drop policy if exists "update own entries" on public.entries;
drop policy if exists "delete own entries" on public.entries;

create policy "users read visible or received artworks"
  on public.entries for select
  to authenticated
  using (traded_at is null or current_owner_id = auth.uid());

create policy "guests read visible artworks"
  on public.entries for select
  to anon
  using (not is_removed and traded_at is null);

create policy "owners update entries"
  on public.entries for update
  to authenticated
  using (current_owner_id = auth.uid())
  with check (current_owner_id = auth.uid());

create policy "owners delete entries"
  on public.entries for delete
  to authenticated
  using (current_owner_id = auth.uid());

drop policy if exists "insert own entries" on public.entries;
create policy "insert own entries"
  on public.entries for insert
  to authenticated
  with check (auth.uid() = user_id and auth.uid() = current_owner_id and traded_at is null);

drop policy if exists "read files of visible or owned artworks" on storage.objects;
create policy "read files of visible or owned artworks"
  on storage.objects for select
  to public
  using (
    bucket_id = 'artworks'
    and exists (
      select 1 from public.entries
      where entries.file_path = storage.objects.name
      and (
        (not entries.is_removed and entries.traded_at is null)
        or entries.current_owner_id = auth.uid()
        or lower(coalesce(auth.jwt() ->> 'email', '')) = 'zereapushev@gmail.com'
      )
    )
  );

drop policy if exists "delete own artwork files" on storage.objects;
create policy "owners delete artwork files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'artworks'
    and exists (
      select 1 from public.entries
      where entries.file_path = storage.objects.name
        and entries.current_owner_id = auth.uid()
    )
  );

create or replace function public.validate_trade_offer()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if new.trade_status is not null then
    if new.trade_status <> 'pending' then
      raise exception 'A new trade offer must be pending';
    end if;
    if not exists (
      select 1 from public.entries
      where id = new.offered_artwork_id
        and current_owner_id = new.sender_id
        and traded_at is null
        and not is_removed
    ) then
      raise exception 'The offered artwork must belong to the sender';
    end if;
    if not exists (
      select 1 from public.entries
      where id = new.requested_artwork_id
        and current_owner_id = new.recipient_id
        and traded_at is null
        and not is_removed
    ) then
      raise exception 'The requested artwork must belong to the recipient';
    end if;
  end if;
  return new;
end;
$$;

create or replace function public.transfer_accepted_trade()
returns trigger
language plpgsql
security definer set search_path = ''
as $$
begin
  if old.trade_status = 'pending' and new.trade_status = 'accepted' then
    perform 1 from public.entries
      where id in (new.offered_artwork_id, new.requested_artwork_id)
      for update;

    if not exists (
      select 1 from public.entries
      where id = new.offered_artwork_id
        and current_owner_id = new.sender_id
        and traded_at is null
        and not is_removed
    ) or not exists (
      select 1 from public.entries
      where id = new.requested_artwork_id
        and current_owner_id = new.recipient_id
        and traded_at is null
        and not is_removed
    ) then
      raise exception 'One of the artworks is no longer available for trade';
    end if;

    update public.entries
      set current_owner_id = case
        when id = new.offered_artwork_id then new.recipient_id
        else new.sender_id
      end,
      traded_at = now()
      where id in (new.offered_artwork_id, new.requested_artwork_id);
  end if;
  return new;
end;
$$;

create trigger transfer_artworks_after_trade_acceptance
  after update of trade_status on public.direct_messages
  for each row execute function public.transfer_accepted_trade();
