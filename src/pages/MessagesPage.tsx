import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { ConversationCard } from '../components/ConversationCard';
import { ConversationSidebar, type MessageConversation } from '../components/ConversationSidebar';
import { ContentListSkeleton } from '../components/ContentListSkeleton';
import { SimpleHeader } from '../components/SimpleHeader';
import { loadDirectMessages } from '../lib/messages';
import { getAvatarUrl, loadPublicProfiles } from '../lib/profile';
import { supabase } from '../lib/supabase';

export function MessagesPage() {
  const [user, setUser] = useState<User | null>();
  const [conversations, setConversations] = useState<MessageConversation[]>([]);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  const [isMobileChatOpen, setIsMobileChatOpen] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async (activeUser: User) => {
    try {
      const messages = await loadDirectMessages();
      const partnerIds = [...new Set(messages.map((message) => message.sender_id === activeUser.id ? message.recipient_id : message.sender_id))];
      const profiles = await loadPublicProfiles(partnerIds);
      const profileMap = new Map(profiles.map((profile) => [profile.user_id, profile]));
      const loadedConversations = await Promise.all(partnerIds.map(async (partnerId) => {
        const partner = profileMap.get(partnerId) ?? {
          user_id: partnerId,
          display_name: 'Пользователь Art Swap',
          bio: '',
          avatar_path: null,
        };
        return {
          partner,
          messages: messages.filter((message) => message.sender_id === partnerId || message.recipient_id === partnerId),
          avatarUrl: await getAvatarUrl(partner.avatar_path),
        };
      }));
      loadedConversations.sort((first, second) => {
        const firstDate = first.messages[first.messages.length - 1]?.created_at ?? '';
        const secondDate = second.messages[second.messages.length - 1]?.created_at ?? '';
        return secondDate.localeCompare(firstDate);
      });
      setConversations(loadedConversations);
      setActivePartnerId((current) => current && partnerIds.includes(current) ? current : loadedConversations[0]?.partner.user_id ?? null);
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

  const activeConversation = conversations.find((conversation) => conversation.partner.user_id === activePartnerId);

  function openConversation(partnerId: string) {
    setActivePartnerId(partnerId);
    setIsMobileChatOpen(true);
  }

  return (
    <>
      <SimpleHeader />
      <main className="messages-page">
        <span className="eyebrow">Личные сообщения</span><h1>Сообщения</h1>
        {user === undefined || isLoading || error ? <ContentListSkeleton label="Сообщения загружаются" /> : !user ? <p className="support-card">Войди в аккаунт, чтобы увидеть сообщения.</p> : conversations.length === 0 ? <p className="support-card">Сообщений пока нет. Открой профиль автора, чтобы написать ему.</p> : (
          <div className={`messages-layout${isMobileChatOpen ? ' messages-layout--chat-open' : ''}`}>
            <ConversationSidebar conversations={conversations} activePartnerId={activePartnerId} currentUserId={user.id} onSelect={openConversation} />
            {activeConversation && <ConversationCard currentUserId={user.id} partner={activeConversation.partner} messages={activeConversation.messages} avatarUrl={activeConversation.avatarUrl} onBack={() => setIsMobileChatOpen(false)} onSent={() => void refresh(user)} />}
          </div>
        )}
      </main>
    </>
  );
}
