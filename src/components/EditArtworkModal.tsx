import { useState, type FormEvent } from 'react';
import type { Artwork } from '../data/artworks';
import { updateArtwork } from '../lib/artworks';

type EditArtworkModalProps = {
  artwork: Artwork | null;
  onClose: () => void;
  onSaved: () => void;
};

export function EditArtworkModal({ artwork, onClose, onSaved }: EditArtworkModalProps) {
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState('');

  if (!artwork) return null;

  function handleClose() {
    if (isSaving) return;
    setMessage('');
    onClose();
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!artwork) return;

    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') ?? '').trim();
    const offer = String(form.get('offer') ?? '').trim();
    setIsSaving(true);
    setMessage('');

    try {
      await updateArtwork(artwork.id, title, offer);
      onSaved();
      handleClose();
    } catch {
      setMessage('Не получилось сохранить изменения. Попробуй ещё раз.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={handleClose}>
      <section className="modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal__close" onClick={handleClose} aria-label="Закрыть" disabled={isSaving}>×</button>
        <span className="eyebrow">Редактирование</span>
        <h2>Изменить работу</h2>
        <form onSubmit={handleSubmit}>
          <label>
            Название
            <input name="title" defaultValue={artwork.title} required />
          </label>
          <label>
            Описание работы
            <textarea name="offer" defaultValue={artwork.offer} rows={4} />
          </label>
          {message && <p className="message" role="alert">{message}</p>}
          <button className="button" type="submit" disabled={isSaving}>
            {isSaving ? 'Сохраняю…' : 'Сохранить изменения'}
          </button>
        </form>
      </section>
    </div>
  );
}
