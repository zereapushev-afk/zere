import { useEffect, useState, type FormEvent } from 'react';
import type { Artwork } from '../data/artworks';
import { loadArtworks } from '../lib/artworks';
import { sendTradeOffer } from '../lib/messages';
import { supabase } from '../lib/supabase';

type TradeModalProps = {
  artwork: Artwork | null;
  onClose: () => void;
};

export function TradeModal({ artwork, onClose }: TradeModalProps) {
  const [myArtworks, setMyArtworks] = useState<Artwork[]>([]);
  const [offeredArtworkId, setOfferedArtworkId] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setOfferedArtworkId('');
    setMessage('');
    setError('');
    if (!artwork) return;
    void supabase.auth.getUser().then(async ({ data }) => {
      if (!data.user) return;
      const works = await loadArtworks(data.user, data.user.id);
      setMyArtworks(works);
      setOfferedArtworkId(works[0]?.id ?? '');
    }).catch(() => setError('Не удалось загрузить твои работы.'));
  }, [artwork?.id]);

  if (!artwork) return null;
  const activeArtwork = artwork;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSending(true);
    setError('');
    try {
      const text = message.trim() || 'Предлагаю обменяться работами.';
      await sendTradeOffer(activeArtwork.authorId, text, offeredArtworkId, activeArtwork.id);
      onClose();
    } catch {
      setError('Не удалось отправить предложение. Нельзя предложить обмен самому себе.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Закрыть">×</button>
        <span className="eyebrow">Предложение обмена</span>
        <h2>Обменяться на «{artwork.title}»</h2>
        <p>Выбери свою опубликованную работу, которую предлагаешь взамен.</p>
        <form onSubmit={(event) => void handleSubmit(event)}>
          <label>
            Моя работа
            <select value={offeredArtworkId} onChange={(event) => setOfferedArtworkId(event.target.value)} required>
              <option value="" disabled>Выбери работу</option>
              {myArtworks.map((work) => <option key={work.id} value={work.id}>{work.title}</option>)}
            </select>
          </label>
          <label>
            Сообщение
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Привет! Мне понравилась твоя работа…" maxLength={1500} rows={4} />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          {myArtworks.length === 0 && !error && <p className="message">Сначала опубликуй свою работу, чтобы предложить обмен.</p>}
          <button className="button" disabled={isSending || !offeredArtworkId}>{isSending ? 'Отправляю…' : 'Отправить предложение'}</button>
        </form>
      </section>
    </div>
  );
}
