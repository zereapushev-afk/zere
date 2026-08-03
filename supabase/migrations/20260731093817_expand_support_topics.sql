alter table public.support_messages
  drop constraint support_messages_topic_check,
  add constraint support_messages_topic_check
    check (topic in ('ai_appeal', 'artwork_report', 'development_suggestion', 'other')),
  add column artwork_title text check (char_length(artwork_title) <= 150);
