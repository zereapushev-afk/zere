import { useState, type FormEvent } from 'react';
import { useLocation } from 'wouter';
import { checkArtwork, isResultForFile, type AiCheckResult } from '../lib/aiArtworkCheck';
import { supabase } from '../lib/supabase';
import { AiCheckNotice } from './AiCheckNotice';

type PublishModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onPublished: () => void;
};

export function PublishModal({ isOpen, onClose, onPublished }: PublishModalProps) {
  const [, setLocation] = useLocation();
  const [isUploading, setIsUploading] = useState(false);
  const [message, setMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [checkResult, setCheckResult] = useState<AiCheckResult | null>(null);

  if (!isOpen) return null;

  function handleClose() {
    if (isUploading) return;
    setSelectedFile(null);
    setCheckResult(null);
    setMessage('');
    onClose();
  }

  function handleAppeal() {
    if (!checkResult?.blocked) return;
    sessionStorage.setItem('aiAppealScore', String(checkResult.score));
    handleClose();
    setLocation('/support');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsUploading(true);
    setMessage('');

    const form = new FormData(event.currentTarget);
    const title = String(form.get('title') ?? '').trim();
    const category = String(form.get('category') ?? '');
    const offer = String(form.get('offer') ?? '').trim();
    const file = selectedFile;
    const { data: userData } = await supabase.auth.getUser();

    if (!file || file.size === 0 || !userData.user) {
      setMessage('Выбери файл и попробуй ещё раз.');
      setIsUploading(false);
      return;
    }

    let result = checkResult;
    if (!result) {
      setMessage('Проверяем признаки ИИ…');
      try {
        result = await checkArtwork(file);
        setCheckResult(result);
        setMessage('');
      } catch (error) {
        setMessage(error instanceof Error ? error.message : 'Не удалось проверить работу.');
      }
      setIsUploading(false);
      return;
    }
    if (result.blocked || !isResultForFile(result, file)) {
      if (!isResultForFile(result, file)) {
        setCheckResult(null);
        setMessage('Файл изменился. Проверь его ещё раз.');
      }
      setIsUploading(false);
      return;
    }

    const safeName = file.name.replace(/[^a-zA-Zа-яА-ЯёЁ0-9._-]/g, '_');
    const filePath = `${userData.user.id}/${crypto.randomUUID()}-${safeName}`;
    const { error: uploadError } = await supabase.storage.from('artworks').upload(filePath, file);

    if (uploadError) {
      setMessage('Не получилось загрузить файл. Попробуй ещё раз.');
      setIsUploading(false);
      return;
    }

    const { error: entryError } = await supabase
      .from('entries')
      .insert({ title, category, offer, file_path: filePath });
    if (entryError) {
      await supabase.storage.from('artworks').remove([filePath]);
      setMessage('Не получилось сохранить публикацию. Попробуй ещё раз.');
      setIsUploading(false);
      return;
    }

    setIsUploading(false);
    setSelectedFile(null);
    onPublished();
    onClose();
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={handleClose}>
      <section className="modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal__close" onClick={handleClose} aria-label="Закрыть">×</button>
        <span className="eyebrow">Новая публикация</span>
        <h2>Покажи свою работу</h2>
        <p>Загрузи изображение, пройди проверку и расскажи, что хочешь получить в обмен.</p>
        <form onSubmit={handleSubmit}>
          <label>
            Название
            <input name="title" placeholder="Название работы" required />
          </label>
          <label>
            Файл работы
            <input
              name="artwork"
              type="file"
              accept="image/*"
              required={!selectedFile}
              disabled={Boolean(selectedFile)}
              onChange={(event) => {
                setSelectedFile(event.target.files?.[0] ?? null);
                setCheckResult(null);
                setMessage('');
              }}
            />
            {selectedFile ? (
              <small className="selected-file">✓ Файл выбран: {selectedFile.name}</small>
            ) : (
              <small className="field-hint">Можно выбрать только один файл.</small>
            )}
          </label>
          {checkResult && <AiCheckNotice result={checkResult} />}
          <label>
            Категория
            <select name="category" defaultValue="" required>
              <option value="" disabled>Выбери категорию</option>
              <option>Анимация</option>
              <option>Музыка</option>
              <option>Иллюстрация</option>
              <option>Другое</option>
            </select>
          </label>
          <label>
            Что хочешь получить?
            <textarea name="offer" placeholder="Опиши желаемый обмен" rows={3} />
          </label>
          {message && <p className="message" role="alert">{message}</p>}
          {checkResult?.blocked ? (
            <div className="ai-check__actions">
              <button className="button" type="button" onClick={handleClose}>Выйти</button>
              <button className="button button--outline" type="button" onClick={handleAppeal}>
                Подать апелляцию
              </button>
            </div>
          ) : (
            <button className="button" type="submit" disabled={isUploading}>
              {isUploading
                ? (checkResult ? 'Загружаем…' : 'Проверяем…')
                : (checkResult ? `Опубликовать (ИИ: ${checkResult.score}%)` : 'Проверить работу')}
            </button>
          )}
        </form>
      </section>
    </div>
  );
}
