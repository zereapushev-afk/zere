import { useState, type FormEvent } from 'react';
import {
  getEvidenceUrl,
  replyToSupportRequest,
  SUPPORT_TOPIC_LABELS,
  type SupportRequest,
} from '../lib/support';

type SupportRequestCardProps = {
  request: SupportRequest;
  onReplied: () => void;
};

export function SupportRequestCard({ request, onReplied }: SupportRequestCardProps) {
  const [reply, setReply] = useState(request.reply ?? '');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!reply.trim()) return;
    setIsSaving(true);
    setError('');
    try {
      await replyToSupportRequest(request.id, reply.trim());
      onReplied();
    } catch {
      setError('Не удалось сохранить ответ. Попробуй ещё раз.');
    } finally {
      setIsSaving(false);
    }
  }

  async function openEvidence() {
    if (!request.evidence_path) return;
    try {
      window.open(await getEvidenceUrl(request.evidence_path), '_blank', 'noopener,noreferrer');
    } catch {
      setError('Не удалось открыть вложение.');
    }
  }

  return (
    <article className="support-request">
      <div className="support-request__meta">
        <strong>{SUPPORT_TOPIC_LABELS[request.topic]}</strong>
        <time>{new Date(request.created_at).toLocaleString('ru-RU')}</time>
      </div>
      <small>{request.user_email ?? request.user_id}</small>
      {request.artwork_title && <p><b>Работа:</b> {request.artwork_title}</p>}
      {request.ai_score !== null && <p><b>Оценка AI:</b> {request.ai_score}</p>}
      <p>{request.message}</p>
      {request.evidence_path && <button className="support-back" type="button" onClick={() => void openEvidence()}>Открыть вложение ↗</button>}
      <form onSubmit={handleSubmit}>
        <label>
          Ответ пользователю
          <textarea value={reply} onChange={(event) => setReply(event.target.value)} maxLength={2000} rows={4} required />
        </label>
        {error && <p className="form-error">{error}</p>}
        <button className="button button--small" disabled={isSaving}>{isSaving ? 'Сохраняю…' : request.reply ? 'Обновить ответ' : 'Отправить ответ'}</button>
      </form>
    </article>
  );
}
