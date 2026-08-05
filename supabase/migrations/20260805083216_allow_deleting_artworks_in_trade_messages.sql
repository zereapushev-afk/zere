create or replace function public.clear_deleted_artwork_from_trade_messages()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.direct_messages
  set offered_artwork_id = null,
      requested_artwork_id = null,
      trade_status = null
  where offered_artwork_id = old.id
     or requested_artwork_id = old.id;

  return old;
end;
$$;

create trigger clear_artwork_trade_messages_before_delete
  before delete on public.entries
  for each row execute function public.clear_deleted_artwork_from_trade_messages();
