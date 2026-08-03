import { useState, type FormEvent } from 'react';
import { sendDirectMessage } from '../lib/messages';

type MessageComposerProps = {
  recipientId: string;
  onSent?: () => void;
};

export function MessageComposer({ recipientId, onSent }: MessageComposerProps) {
  const [body, setBody] = useState('');
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!body.trim()) return;
    setIsSending(true);
    setStatus('');
    try {
      await sendDirectMessage(recipientId, body.trim());
      setBody('');
      setStatus('Сообщение отправлено ✓');
      onSent?.();
    } catch {
      setStatus('Не удалось отправить сообщение.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <form className="message-composer" onSubmit={handleSubmit}>
      <label>Сообщение<textarea value={body} onChange={(event) => setBody(event.target.value)} maxLength={2000} rows={4} placeholder="Напиши автору…" required /></label>
      {status && <p className="message">{status}</p>}
      <button className="button button--small" disabled={isSending}>{isSending ? 'Отправляю…' : 'Отправить'}</button>
    </form>
  );
}
