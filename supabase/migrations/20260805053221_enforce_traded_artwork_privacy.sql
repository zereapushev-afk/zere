drop policy if exists "users read visible or relevant artworks" on public.entries;
drop policy if exists "users read visible or received artworks" on public.entries;

create policy "users read visible or received artworks"
  on public.entries for select
  to authenticated
  using (
    (not is_removed and traded_at is null)
    or current_owner_id = auth.uid()
    or lower(coalesce(auth.jwt() ->> 'email', '')) = 'zereapushev@gmail.com'
  );
