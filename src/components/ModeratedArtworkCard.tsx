import { useState, type FormEvent } from 'react';
import type { RemovedArtwork } from '../lib/moderation';

type ModeratedArtworkCardProps = {
  artwork: RemovedArtwork;
  isDeveloper: boolean;
  onAppeal: (body: string) => Promise<void>;
  onRestore: () => Promise<void>;
};

export function ModeratedArtworkCard({ artwork, isDeveloper, onAppeal, onRestore }: ModeratedArtworkCardProps) {
  const [appeal, setAppeal] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  async function submitAppeal(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    try {
      await onAppeal(appeal);
      setAppeal('');
    } finally {
      setIsSaving(false);
    }
  }

  async function restore() {
    setIsSaving(true);
    try {
      await onRestore();
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <article className="moderated-artwork">
      {artwork.imageUrl && <img src={artwork.imageUrl} alt={artwork.title} />}
      <div>
        <span className="eyebrow">{artwork.category}</span>
        <h2>{artwork.title}</h2>
        <p><b>Автор:</b> {artwork.author}</p>
        <p><b>Причина удаления:</b> {artwork.moderationReason}</p>
        {artwork.appeal && <p className="moderation-appeal"><b>Апелляция:</b> {artwork.appeal.body}</p>}
        {isDeveloper ? (
          <button className="button button--small" disabled={isSaving} onClick={() => void restore()}>
            {isSaving ? 'Восстанавливаю…' : 'Восстановить работу'}
          </button>
        ) : artwork.appeal?.status === 'pending' ? (
          <p className="moderation-status">Апелляция отправлена и ожидает ответа.</p>
        ) : (
          <form className="moderation-form" onSubmit={(event) => void submitAppeal(event)}>
            <label>Почему работу нужно восстановить?
              <textarea value={appeal} onChange={(event) => setAppeal(event.target.value)} minLength={10} maxLength={2000} rows={4} required />
            </label>
            <button className="button button--small" disabled={isSaving}>{isSaving ? 'Отправляю…' : 'Подать апелляцию'}</button>
          </form>
        )}
      </div>
    </article>
  );
}
