import type { DirectMessage } from '../lib/messages';
import type { UserProfile } from '../lib/profile';
import { MessageComposer } from './MessageComposer';

type ConversationCardProps = {
  currentUserId: string;
  partner: UserProfile;
  messages: DirectMessage[];
  onSent: () => void;
};

export function ConversationCard({ currentUserId, partner, messages, onSent }: ConversationCardProps) {
  return (
    <section className="conversation-card">
      <h2>{partner.display_name}</h2>
      <div className="conversation-messages">
        {messages.map((message) => (
          <div className={`message-bubble ${message.sender_id === currentUserId ? 'message-bubble--mine' : ''}`} key={message.id}>
            <p>{message.body}</p>
            <time>{new Date(message.created_at).toLocaleString('ru-RU')}</time>
          </div>
        ))}
      </div>
      <MessageComposer recipientId={partner.user_id} onSent={onSent} />
    </section>
  );
}
