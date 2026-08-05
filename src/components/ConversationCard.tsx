import { useEffect, useRef } from 'react';
import type { DirectMessage } from '../lib/messages';
import type { Artwork } from '../data/artworks';
import type { UserProfile } from '../lib/profile';
import { MessageComposer } from './MessageComposer';
import { TradeOfferCard } from './TradeOfferCard';

type ConversationCardProps = {
  currentUserId: string;
  partner: UserProfile;
  messages: DirectMessage[];
  onSent: () => void;
  avatarUrl: string | null;
  onBack?: () => void;
  artworkMap: Map<string, Artwork>;
};

export function ConversationCard({ currentUserId, partner, messages, onSent, avatarUrl, onBack, artworkMap }: ConversationCardProps) {
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages, partner.user_id]);

  return (
    <section className="conversation-card chat-panel">
      <header className="chat-panel__header">
        {onBack && <button className="chat-panel__back" type="button" onClick={onBack} aria-label="Назад к диалогам">←</button>}
        <span className="conversation-preview__avatar">{avatarUrl ? <img src={avatarUrl} alt="" /> : partner.display_name.slice(0, 1).toUpperCase()}</span>
        <div><h2>{partner.display_name}</h2><small>Переписка</small></div>
      </header>
      <div className="conversation-messages" ref={messagesRef}>
        {messages.map((message) => (
          <div className={`message-bubble${message.sender_id === currentUserId ? ' message-bubble--mine' : ''}${message.trade_status ? ' message-bubble--trade' : ''}`} key={message.id}>
            {message.trade_status && <TradeOfferCard
              message={message}
              currentUserId={currentUserId}
              offeredArtwork={artworkMap.get(message.offered_artwork_id ?? '')}
              requestedArtwork={artworkMap.get(message.requested_artwork_id ?? '')}
              onAnswered={onSent}
            />}
            <p>{message.body}</p>
            <time>{new Date(message.created_at).toLocaleString('ru-RU')}</time>
          </div>
        ))}
      </div>
      <div className="chat-panel__composer"><MessageComposer recipientId={partner.user_id} onSent={onSent} /></div>
    </section>
  );
}
