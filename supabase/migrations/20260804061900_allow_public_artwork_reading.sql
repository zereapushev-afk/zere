create policy "guests read visible artworks"
  on public.entries for select
  to anon
  using (not is_removed);

create policy "guests read public profiles"
  on public.profiles for select
  to anon
  using (true);

create policy "guests read artwork files"
  on storage.objects for select
  to anon
  using (bucket_id = 'artworks');

create policy "guests read profile avatars"
  on storage.objects for select
  to anon
  using (bucket_id = 'avatars');
