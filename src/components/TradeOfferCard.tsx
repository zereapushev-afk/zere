import { useState } from 'react';
import type { Artwork } from '../data/artworks';
import { answerTradeOffer, type DirectMessage } from '../lib/messages';
import { SaveArtworkModal } from './SaveArtworkModal';

type TradeOfferCardProps = {
  message: DirectMessage;
  currentUserId: string;
  offeredArtwork?: Artwork;
  requestedArtwork?: Artwork;
  onAnswered: () => void;
};

const statusLabels = {
  pending: 'Ожидает ответа',
  accepted: 'Обмен принят ✓',
  rejected: 'Обмен отклонён',
};

export function TradeOfferCard({ message, currentUserId, offeredArtwork, requestedArtwork, onAnswered }: TradeOfferCardProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [showSaveModal, setShowSaveModal] = useState(false);
  const canAnswer = message.recipient_id === currentUserId && message.trade_status === 'pending';
  const receivedArtwork = message.sender_id === currentUserId ? requestedArtwork : offeredArtwork;

  async function answer(status: 'accepted' | 'rejected') {
    setIsSaving(true);
    setError('');
    try {
      await answerTradeOffer(message.id, status);
      if (status === 'accepted' && receivedArtwork?.imageUrl) setShowSaveModal(true);
      onAnswered();
    } catch {
      setError('Не удалось сохранить ответ.');
    } finally {
      setIsSaving(false);
    }
  }

  if (!message.trade_status) return null;

  return (
    <div className="trade-offer">
      <strong>Предложение обмена</strong>
      <div className="trade-offer__works">
        <ArtworkSummary label="Предлагают" artwork={offeredArtwork} />
        <span aria-hidden="true">↔</span>
        <ArtworkSummary label="Хотят получить" artwork={requestedArtwork} />
      </div>
      <span className={`trade-offer__status trade-offer__status--${message.trade_status}`}>{statusLabels[message.trade_status]}</span>
      {canAnswer && <div className="trade-offer__actions">
        <button className="button button--small" disabled={isSaving} onClick={() => void answer('accepted')}>Принять</button>
        <button className="text-button" disabled={isSaving} onClick={() => void answer('rejected')}>Отклонить</button>
      </div>}
      {message.trade_status === 'accepted' && receivedArtwork && <button
        className="button button--small"
        type="button"
        onClick={() => setShowSaveModal(true)}
      >
        Сохранить полученную работу
      </button>}
      {error && <small className="form-error">{error}</small>}
      {showSaveModal && receivedArtwork && <SaveArtworkModal artwork={receivedArtwork} onClose={() => setShowSaveModal(false)} />}
    </div>
  );
}

function ArtworkSummary({ label, artwork }: { label: string; artwork?: Artwork }) {
  return (
    <div className="trade-offer__work">
      {artwork?.imageUrl && <img src={artwork.imageUrl} alt="" />}
      <span><small>{label}</small><b>{artwork?.title ?? 'Передана участнику'}</b></span>
    </div>
  );
}
