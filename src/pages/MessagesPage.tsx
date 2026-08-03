import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Link } from 'wouter';
import { ConversationCard } from '../components/ConversationCard';
import { loadDirectMessages, type DirectMessage } from '../lib/messages';
import { loadPublicProfiles, type UserProfile } from '../lib/profile';
import { supabase } from '../lib/supabase';

type Conversation = { partner: UserProfile; messages: DirectMessage[] };

export function MessagesPage() {
  const [user, setUser] = useState<User | null>();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [error, setError] = useState('');

  const refresh = useCallback(async (activeUser: User) => {
    try {
      const messages = await loadDirectMessages();
      const partnerIds = [...new Set(messages.map((message) => message.sender_id === activeUser.id ? message.recipient_id : message.sender_id))];
      const profiles = await loadPublicProfiles(partnerIds);
      setConversations(profiles.map((partner) => ({
        partner,
        messages: messages.filter((message) => message.sender_id === partner.user_id || message.recipient_id === partner.user_id),
      })));
      setError('');
    } catch {
      setError('Не удалось загрузить сообщения.');
    }
  }, []);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) void refresh(data.user);
    });
  }, [refresh]);

  return (
    <>
      <header className="simple-header"><Link className="brand" href="/"><span className="brand__mark">A</span><span>Art Swap</span></Link><Link href="/">На главную</Link></header>
      <main className="messages-page">
        <span className="eyebrow">Личные сообщения</span><h1>Сообщения</h1>
        {user === undefined ? <p>Загружаю…</p> : !user ? <p className="support-card">Войди в аккаунт, чтобы увидеть сообщения.</p> : error ? <p className="form-error">{error}</p> : conversations.length === 0 ? <p className="support-card">Сообщений пока нет. Открой профиль автора, чтобы написать ему.</p> : conversations.map((conversation) => <ConversationCard key={conversation.partner.user_id} currentUserId={user.id} partner={conversation.partner} messages={conversation.messages} onSent={() => void refresh(user)} />)}
      </main>
    </>
  );
}
