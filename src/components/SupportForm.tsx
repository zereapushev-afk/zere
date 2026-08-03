import { useState, type FormEvent } from 'react';
import { sendSupportMessage, type SupportTopic } from '../lib/support';

type SupportFormProps = {
  topic: SupportTopic;
  aiScore: number | null;
  onBack: () => void;
};

const COPY: Record<SupportTopic, { title: string; description: string; placeholder: string }> = {
  ai_appeal: { title: 'Подать апелляцию', description: 'Расскажи, почему результат проверки ошибочный, и приложи доказательства.', placeholder: 'Почему результат проверки нужно пересмотреть?' },
  artwork_report: { title: 'Пожаловаться на работу', description: 'Укажи название чужой работы и расскажи, какое правило она нарушает.', placeholder: 'Опиши причину жалобы…' },
  development_suggestion: { title: 'Предложить улучшение', description: 'Поделись советом или идеей, которая сделает Art Swap лучше.', placeholder: 'Расскажи о своей идее…' },
  other: { title: 'Другое', description: 'Напиши разработчику о своей проблеме или вопросе.', placeholder: 'Напиши сообщение…' },
};

export function SupportForm({ topic, aiScore, onBack }: SupportFormProps) {
  const [message, setMessage] = useState('');
  const [artworkTitle, setArtworkTitle] = useState('');
  const [evidence, setEvidence] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);
  const copy = COPY[topic];
  const isAppeal = topic === 'ai_appeal';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    setIsSending(true);
    setStatus('');
    try {
      await sendSupportMessage({ topic, message: message.trim(), aiScore, evidence, artworkTitle: artworkTitle.trim() || null });
      if (isAppeal) sessionStorage.removeItem('aiAppealScore');
      setMessage('');
      setArtworkTitle('');
      setEvidence(null);
      form.reset();
      setStatus('Обращение отправлено разработчику.');
    } catch {
      setStatus('Не получилось отправить обращение. Попробуй ещё раз.');
    } finally {
      setIsSending(false);
    }
  }

  function selectFile(file: File | null, input: HTMLInputElement) {
    if (file && file.size > 50 * 1024 * 1024) {
      input.value = '';
      setEvidence(null);
      setStatus('Файл должен быть не больше 50 МБ.');
      return;
    }
    setEvidence(file);
    setStatus('');
  }

  return (
    <section>
      <button className="support-back" type="button" onClick={onBack}>← Выбрать другую проблему</button>
      <h1>{copy.title}</h1>
      <p>{copy.description}</p>
      <form className="support-card" onSubmit={handleSubmit}>
        {topic === 'artwork_report' && <label>Название работы<input value={artworkTitle} onChange={(event) => setArtworkTitle(event.target.value)} maxLength={150} required placeholder="Например: Летний вечер" /></label>}
        <label>Сообщение<textarea value={message} onChange={(event) => setMessage(event.target.value)} minLength={10} maxLength={2000} rows={7} required placeholder={copy.placeholder} /></label>
        <label>{isAppeal ? 'Файл с доказательством' : 'Фото'}<input type="file" accept={isAppeal ? undefined : 'image/*'} required={topic === 'artwork_report'} onChange={(event) => selectFile(event.target.files?.[0] ?? null, event.target)} /><small>{isAppeal ? 'Таймлапс, исходник, этапы создания или другое доказательство — до 50 МБ.' : topic === 'artwork_report' ? 'Приложи фото или скриншот работы — до 50 МБ.' : 'Необязательно. Можно приложить фото или скриншот — до 50 МБ.'}</small></label>
        <button className="button" disabled={isSending}>{isSending ? 'Отправляем…' : 'Отправить разработчику'}</button>
        {status && <p className="message" role="status">{status}</p>}
      </form>
    </section>
  );
}
