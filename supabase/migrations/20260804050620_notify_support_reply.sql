create or replace function public.reply_to_support_request(request_id uuid, reply_text text)
returns void
language plpgsql
security definer set search_path = ''
as $$
declare
  request_owner uuid;
  request_topic text;
  request_artwork text;
  notification_text text;
begin
  if lower(auth.jwt() ->> 'email') <> 'zereapushev@gmail.com' then
    raise exception 'Forbidden';
  end if;

  if char_length(trim(reply_text)) < 1 or char_length(trim(reply_text)) > 2000 then
    raise exception 'Reply must contain between 1 and 2000 characters';
  end if;

  update public.support_messages
  set reply = trim(reply_text), status = 'resolved', replied_at = now()
  where id = request_id
  returning user_id, topic, artwork_title
  into request_owner, request_topic, request_artwork;

  if request_owner is null then
    raise exception 'Support request not found';
  end if;

  notification_text := case request_topic
    when 'artwork_report' then 'Ответ на жалобу' || coalesce(' по работе «' || request_artwork || '»', '')
    when 'ai_appeal' then 'Ответ на апелляцию AI'
    when 'development_suggestion' then 'Ответ на предложение'
    else 'Ответ поддержки'
  end || ': ' || trim(reply_text);

  if request_owner <> auth.uid() then
    insert into public.direct_messages (sender_id, recipient_id, body)
    values (auth.uid(), request_owner, left(notification_text, 2000));
  end if;
end;
$$;

grant execute on function public.reply_to_support_request(uuid, text) to authenticated;
