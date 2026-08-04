drop policy if exists "authenticated users read artwork files" on storage.objects;
drop policy if exists "guests read artwork files" on storage.objects;

create policy "read files of visible or owned artworks"
  on storage.objects for select
  to public
  using (
    bucket_id = 'artworks'
    and exists (
      select 1 from public.entries
      where entries.file_path = storage.objects.name
      and (
        not entries.is_removed
        or entries.user_id = auth.uid()
        or lower(coalesce(auth.jwt() ->> 'email', '')) = 'zereapushev@gmail.com'
      )
    )
  );

create or replace function public.validate_artwork_file_owner()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if new.file_path is not null
    and split_part(new.file_path, '/', 1) <> new.user_id::text then
    raise exception 'Artwork file must belong to its author';
  end if;
  return new;
end;
$$;

create trigger validate_artwork_file_owner
  before insert or update of file_path, user_id on public.entries
  for each row execute function public.validate_artwork_file_owner();

drop policy if exists "developer replies to support messages" on public.support_messages;

create or replace function public.protect_support_message_update()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'zereapushev@gmail.com' then
    raise exception 'Only the developer can update support messages';
  end if;
  return new;
end;
$$;

create trigger protect_support_message_update
  before update on public.support_messages
  for each row execute function public.protect_support_message_update();

create or replace function public.protect_artwork_moderation_fields()
returns trigger language plpgsql security invoker set search_path = '' as $$
begin
  if old.is_removed is distinct from new.is_removed
    or old.moderation_reason is distinct from new.moderation_reason
    or old.moderated_at is distinct from new.moderated_at then
    if lower(coalesce(auth.jwt() ->> 'email', '')) <> 'zereapushev@gmail.com' then
      raise exception 'Only the developer can change moderation fields';
    end if;
  end if;
  return new;
end;
$$;

revoke all on function public.moderate_artwork(uuid, text) from public, anon;
revoke all on function public.submit_artwork_appeal(uuid, text) from public, anon;
revoke all on function public.restore_artwork(uuid) from public, anon;
revoke all on function public.reply_to_support_request(uuid, text) from public, anon;

grant execute on function public.moderate_artwork(uuid, text) to authenticated;
grant execute on function public.submit_artwork_appeal(uuid, text) to authenticated;
grant execute on function public.restore_artwork(uuid) to authenticated;
grant execute on function public.reply_to_support_request(uuid, text) to authenticated;
