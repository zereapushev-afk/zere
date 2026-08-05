import { useState } from 'react';
import type { Artwork } from '../data/artworks';
import { downloadFile, prepareArtworkFile, type ArtworkFormat } from '../lib/exportArtwork';

type SaveArtworkModalProps = {
  artwork: Artwork;
  onClose: () => void;
};

export function SaveArtworkModal({ artwork, onClose }: SaveArtworkModalProps) {
  const [format, setFormat] = useState<ArtworkFormat>('original');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  async function save(destination: 'gallery' | 'downloads') {
    setIsSaving(true);
    setError('');
    try {
      const file = await prepareArtworkFile(artwork, format);
      if (destination === 'gallery' && navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: artwork.title });
      } else {
        downloadFile(file);
      }
      onClose();
    } catch (caught) {
      if (caught instanceof DOMException && caught.name === 'AbortError') return;
      setError('Не удалось сохранить файл. Попробуй другой формат.');
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal save-artwork-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Закрыть">×</button>
        <span className="eyebrow">Обмен принят</span>
        <h2>Сохранить «{artwork.title}»?</h2>
        <label>
          Формат файла
          <select value={format} onChange={(event) => setFormat(event.target.value as ArtworkFormat)}>
            <option value="original">Исходный формат</option>
            <option value="png">PNG — лучшее качество</option>
            <option value="jpeg">JPG — меньше размер</option>
            <option value="webp">WebP — современный формат</option>
          </select>
        </label>
        <div className="save-artwork-modal__actions">
          <button className="button" disabled={isSaving} onClick={() => void save('gallery')}>В галерею</button>
          <button className="button button--outline" disabled={isSaving} onClick={() => void save('downloads')}>В скачанные</button>
        </div>
        <small className="field-hint">На телефоне откроется системное меню — выбери «Сохранить изображение» или «Сохранить в Файлы».</small>
        {error && <p className="form-error" role="alert">{error}</p>}
      </section>
    </div>
  );
}
