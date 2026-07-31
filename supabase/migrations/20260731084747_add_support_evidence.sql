alter table public.support_messages
  add column evidence_path text;

insert into storage.buckets (id, name, public, file_size_limit)
values ('support-evidence', 'support-evidence', false, 52428800)
on conflict (id) do update
set public = excluded.public,
    file_size_limit = excluded.file_size_limit;

create policy "users upload own support evidence"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'support-evidence'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "users read own support evidence"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'support-evidence'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "users delete own support evidence"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'support-evidence'
    and auth.uid()::text = (storage.foldername(name))[1]
  );
