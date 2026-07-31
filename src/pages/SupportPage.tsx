import { useEffect, useState, type FormEvent } from 'react';
import type { User } from '@supabase/supabase-js';
import { Link } from 'wouter';
import { sendSupportMessage } from '../lib/support';
import { supabase } from '../lib/supabase';

function readAppealScore() {
  const value = sessionStorage.getItem('aiAppealScore');
  const score = value === null ? null : Number(value);
  return Number.isFinite(score) ? score : null;
}

export function SupportPage() {
  const [user, setUser] = useState<User | null>(null);
  const [aiScore] = useState(readAppealScore);
  const [message, setMessage] = useState('');
  const [evidence, setEvidence] = useState<File | null>(null);
  const [status, setStatus] = useState('');
  const [isSending, setIsSending] = useState(false);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setIsSending(true);
    setStatus('');
    try {
      await sendSupportMessage(message.trim(), aiScore, evidence);
      sessionStorage.removeItem('aiAppealScore');
      setMessage('');
      setEvidence(null);
      setStatus('Апелляция отправлена разработчику.');
    } catch {
      setStatus('Не получилось отправить сообщение. Попробуй ещё раз.');
    } finally {
      setIsSending(false);
    }
  }

  return (
    <>
      <header className="simple-header">
        <Link className="brand" href="/"><span className="brand__mark">A</span><span>Art Swap</span></Link>
        <Link href="/">На главную</Link>
      </header>
      <main className="support-page">
        <span className="eyebrow">Поддержка</span>
        <h1>{aiScore === null ? 'Напиши нам' : 'Подать апелляцию'}</h1>
        <p>
          {aiScore === null
            ? 'Опиши вопрос — сообщение увидит разработчик.'
            : 'Расскажи, почему считаешь результат проверки ошибочным. Можно прикрепить таймлапс рисования работы, исходник, этапы создания или любые другие доказательства.'}
        </p>
        {!user ? (
          <p className="support-card">Чтобы отправить сообщение, сначала <Link href="/">войди в аккаунт</Link>.</p>
        ) : (
          <form className="support-card" onSubmit={handleSubmit}>
            <label>
              Сообщение
              <textarea
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                minLength={10}
                maxLength={2000}
                rows={7}
                required
                placeholder="Напиши подробнее…"
              />
            </label>
            <label>
              Файл с доказательством
              <input
                type="file"
                onChange={(event) => {
                  const file = event.target.files?.[0] ?? null;
                  if (file && file.size > 50 * 1024 * 1024) {
                    event.target.value = '';
                    setEvidence(null);
                    setStatus('Файл должен быть не больше 50 МБ.');
                    return;
                  }
                  setEvidence(file);
                  setStatus('');
                }}
              />
              <small>Таймлапс-видео, исходник, скриншоты этапов или другие доказательства — до 50 МБ.</small>
            </label>
            <button className="button" disabled={isSending}>
              {isSending ? 'Отправляем…' : 'Отправить разработчику'}
            </button>
            {status && <p className="message" role="status">{status}</p>}
          </form>
        )}
      </main>
    </>
  );
}
