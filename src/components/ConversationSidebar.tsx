import type { DirectMessage } from '../lib/messages';
import type { UserProfile } from '../lib/profile';

export type MessageConversation = {
  partner: UserProfile;
  messages: DirectMessage[];
  avatarUrl: string | null;
};

type ConversationSidebarProps = {
  conversations: MessageConversation[];
  activePartnerId: string | null;
  currentUserId: string;
  onSelect: (partnerId: string) => void;
};

export function ConversationSidebar({ conversations, activePartnerId, currentUserId, onSelect }: ConversationSidebarProps) {
  return (
    <aside className="conversation-sidebar" aria-label="Диалоги">
      <h2>Диалоги</h2>
      {conversations.map((conversation) => {
        const lastMessage = conversation.messages[conversation.messages.length - 1];
        const prefix = lastMessage?.sender_id === currentUserId ? 'Вы: ' : '';
        return (
          <button
            className={`conversation-preview${activePartnerId === conversation.partner.user_id ? ' conversation-preview--active' : ''}`}
            type="button"
            key={conversation.partner.user_id}
            onClick={() => onSelect(conversation.partner.user_id)}
          >
            <span className="conversation-preview__avatar">
              {conversation.avatarUrl ? <img src={conversation.avatarUrl} alt="" /> : conversation.partner.display_name.slice(0, 1).toUpperCase()}
            </span>
            <span className="conversation-preview__text">
              <b>{conversation.partner.display_name}</b>
              <small>{prefix}{lastMessage?.body ?? 'Начни общение'}</small>
            </span>
          </button>
        );
      })}
    </aside>
  );
}
