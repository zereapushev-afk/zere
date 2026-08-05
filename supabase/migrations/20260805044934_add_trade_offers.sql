alter table public.direct_messages
  add column offered_artwork_id uuid references public.entries (id) on delete set null,
  add column requested_artwork_id uuid references public.entries (id) on delete set null,
  add column trade_status text check (trade_status in ('pending', 'accepted', 'rejected')),
  add constraint complete_trade_offer check (
    (offered_artwork_id is null and requested_artwork_id is null and trade_status is null)
    or
    (offered_artwork_id is not null and requested_artwork_id is not null and trade_status is not null)
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
      where id = new.offered_artwork_id and user_id = new.sender_id and not is_removed
    ) then
      raise exception 'The offered artwork must belong to the sender';
    end if;
    if not exists (
      select 1 from public.entries
      where id = new.requested_artwork_id and user_id = new.recipient_id and not is_removed
    ) then
      raise exception 'The requested artwork must belong to the recipient';
    end if;
  end if;
  return new;
end;
$$;

create trigger validate_trade_offer_before_insert
  before insert on public.direct_messages
  for each row execute function public.validate_trade_offer();

revoke update on public.direct_messages from authenticated;
grant update (trade_status) on public.direct_messages to authenticated;

create policy "recipients answer pending trades"
  on public.direct_messages for update
  to authenticated
  using (auth.uid() = recipient_id and trade_status = 'pending')
  with check (auth.uid() = recipient_id and trade_status in ('accepted', 'rejected'));
