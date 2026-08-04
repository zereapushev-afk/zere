import { useEffect, useState, type FormEvent } from 'react';
import type { Artwork } from '../data/artworks';
import { sendDirectMessage } from '../lib/messages';

type TradeModalProps = {
  artwork: Artwork | null;
  onClose: () => void;
};

export function TradeModal({ artwork, onClose }: TradeModalProps) {
  const [offeredWork, setOfferedWork] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    setOfferedWork('');
    setMessage('');
    setError('');
  }, [artwork?.id]);

  if (!artwork) return null;
  const activeArtwork = artwork;

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSending(true);
    setError('');
    try {
      const text = [
        `Предложение обмена на работу «${activeArtwork.title}».`,
        `Предлагаю взамен: ${offeredWork.trim()}.`,
        message.trim(),
      ].filter(Boolean).join('\n\n');
      await sendDirectMessage(activeArtwork.authorId, text);
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
        <p>Расскажи {artwork.author}, какую свою работу ты предлагаешь взамен.</p>
        <form onSubmit={(event) => void handleSubmit(event)}>
          <label>
            Моя работа
            <input value={offeredWork} onChange={(event) => setOfferedWork(event.target.value)} placeholder="Например, вязаный шарф" maxLength={200} required />
          </label>
          <label>
            Сообщение
            <textarea value={message} onChange={(event) => setMessage(event.target.value)} placeholder="Привет! Мне понравилась твоя работа…" maxLength={1500} rows={4} />
          </label>
          {error && <p className="form-error" role="alert">{error}</p>}
          <button className="button" disabled={isSending}>{isSending ? 'Отправляю…' : 'Отправить предложение'}</button>
        </form>
      </section>
    </div>
  );
}
