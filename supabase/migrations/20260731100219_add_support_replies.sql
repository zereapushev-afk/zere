alter table public.support_messages
  add column user_email text,
  add column reply text check (char_length(reply) <= 2000),
  add column replied_at timestamptz;

update public.support_messages as messages
set user_email = users.email
from auth.users as users
where users.id = messages.user_id;

alter table public.support_messages
  alter column user_email set default (auth.jwt() ->> 'email');

create policy "developer reads all support messages"
  on public.support_messages for select
  to authenticated
  using (lower(auth.jwt() ->> 'email') = 'zereapushev@gmail.com');

create policy "developer replies to support messages"
  on public.support_messages for update
  to authenticated
  using (lower(auth.jwt() ->> 'email') = 'zereapushev@gmail.com')
  with check (lower(auth.jwt() ->> 'email') = 'zereapushev@gmail.com');

create policy "developer reads support evidence"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'support-evidence'
    and lower(auth.jwt() ->> 'email') = 'zereapushev@gmail.com'
  );
