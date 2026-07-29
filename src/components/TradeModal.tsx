import type { Artwork } from '../data/artworks';

type TradeModalProps = {
  artwork: Artwork | null;
  onClose: () => void;
};

export function TradeModal({ artwork, onClose }: TradeModalProps) {
  if (!artwork) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Закрыть">×</button>
        <span className="eyebrow">Предложение обмена</span>
        <h2>Обменяться на «{artwork.title}»</h2>
        <p>Расскажи {artwork.author}, какую свою работу ты предлагаешь взамен.</p>
        <label>
          Моя работа
          <input placeholder="Например, вязаный шарф" />
        </label>
        <label>
          Сообщение
          <textarea placeholder="Привет! Мне понравилась твоя работа…" rows={4} />
        </label>
        <button className="button" onClick={onClose}>Отправить предложение</button>
      </section>
    </div>
  );
}
