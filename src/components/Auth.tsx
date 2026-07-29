import { useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseSetupMessage } from './SupabaseSetupMessage';

type AuthProps = {
  initialMode?: 'signin' | 'signup';
  onSuccess?: () => void;
};

function isPasswordTooWeak(password: string) {
  const hasLetters = /[A-Za-zА-Яа-яЁё]/.test(password);
  const hasNumbers = /\d/.test(password);
  return password.length < 8 || !hasLetters || !hasNumbers;
}

export function Auth({ initialMode = 'signup', onSuccess }: AuthProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);

  if (!isSupabaseConfigured) return <SupabaseSetupMessage />;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (mode === 'signup' && isPasswordTooWeak(password)) {
      setMessage('Пароль слишком лёгкий. Используй минимум 8 символов, буквы и цифры.');
      return;
    }

    setBusy(true);
    setMessage('');
    try {
      const fn =
        mode === 'signup'
          ? supabase.auth.signUp({
              email,
              password,
              options: { emailRedirectTo: window.location.origin },
            })
          : supabase.auth.signInWithPassword({ email, password });
      const { error } = await fn;
      if (error) setMessage(error.message);
      else if (mode === 'signup') setMessage('Готово! Проверь почту, чтобы подтвердить аккаунт.');
      else onSuccess?.();
    } catch {
      setMessage('Что-то пошло не так. Попробуй ещё раз.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="auth-form">
      <h2>{mode === 'signin' ? 'Вход' : 'Регистрация'}</h2>
      <form onSubmit={handleSubmit} className="form">
        <input
          type="email"
          placeholder="Твой email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={mode === 'signup' ? 'Пароль — минимум 8 символов' : 'Твой пароль'}
          value={password}
          onChange={(e) => {
            setPassword(e.target.value);
            setMessage('');
          }}
          minLength={mode === 'signup' ? 8 : 6}
          required
        />
        <button type="submit" disabled={busy}>
          {busy ? '…' : mode === 'signin' ? 'Войти' : 'Создать аккаунт'}
        </button>
      </form>
      {message && <p className="message" role="status">{message}</p>}
      <button
        className="auth-switch"
        onClick={() => setMode(mode === 'signin' ? 'signup' : 'signin')}
      >
        {mode === 'signin' ? 'Нет аккаунта? Зарегистрируйся' : 'Уже есть аккаунт? Войти'}
      </button>
    </section>
  );
}
