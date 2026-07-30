-- Приватное хранилище работ. Формат файла не ограничен.
alter table public.entries
  add column if not exists file_path text,
  add column if not exists category text,
  add column if not exists offer text;

insert into storage.buckets (id, name, public, allowed_mime_types)
values ('artworks', 'artworks', false, null)
on conflict (id) do update
set public = excluded.public,
    allowed_mime_types = excluded.allowed_mime_types;

create policy "upload own artwork files"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'artworks'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "read own artwork files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'artworks'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "delete own artwork files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'artworks'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
