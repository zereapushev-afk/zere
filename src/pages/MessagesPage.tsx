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
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async (activeUser: User) => {
    try {
      const messages = await loadDirectMessages();
      const partnerIds = [...new Set(messages.map((message) => message.sender_id === activeUser.id ? message.recipient_id : message.sender_id))];
      const profiles = await loadPublicProfiles(partnerIds);
      const profileMap = new Map(profiles.map((profile) => [profile.user_id, profile]));
      setConversations(partnerIds.map((partnerId) => ({
        partner: profileMap.get(partnerId) ?? {
          user_id: partnerId,
          display_name: 'Пользователь Art Swap',
          bio: '',
          avatar_path: null,
        },
        messages: messages.filter((message) => message.sender_id === partnerId || message.recipient_id === partnerId),
      })));
      setError('');
    } catch {
      setError('Не удалось загрузить сообщения.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    let refreshTimer: number | undefined;
    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) {
        void refresh(data.user);
        refreshTimer = window.setInterval(() => void refresh(data.user!), 5000);
      } else setIsLoading(false);
    });
    return () => window.clearInterval(refreshTimer);
  }, [refresh]);

  return (
    <>
      <header className="simple-header"><Link className="brand" href="/"><span className="brand__mark">A</span><span>Art Swap</span></Link><Link href="/">На главную</Link></header>
      <main className="messages-page">
        <span className="eyebrow">Личные сообщения</span><h1>Сообщения</h1>
        {user === undefined || isLoading ? <p>Загружаю сообщения…</p> : !user ? <p className="support-card">Войди в аккаунт, чтобы увидеть сообщения.</p> : error ? <p className="form-error">{error}</p> : conversations.length === 0 ? <p className="support-card">Сообщений пока нет. Открой профиль автора, чтобы написать ему.</p> : conversations.map((conversation) => <ConversationCard key={conversation.partner.user_id} currentUserId={user.id} partner={conversation.partner} messages={conversation.messages} onSent={() => void refresh(user)} />)}
      </main>
    </>
  );
}
