import { useState } from 'react';
import { isSupabaseConfigured, supabase } from '../lib/supabase';
import { SupabaseSetupMessage } from './SupabaseSetupMessage';

type AuthProps = {
  initialMode?: 'signin' | 'signup';
  onSuccess?: () => void;
};

function getPasswordIssues(password: string) {
  const issues: string[] = [];
  if (password.length < 8) issues.push(`${8 - password.length} симв.`);
  if (!/[A-Za-zА-Яа-яЁё]/.test(password)) issues.push('букв');
  if (!/\d/.test(password)) issues.push('цифр');
  return issues;
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
    const passwordIssues = getPasswordIssues(password);
    if (mode === 'signup' && passwordIssues.length > 0) {
      setMessage(`Пароль слишком лёгкий. Не хватает: ${passwordIssues.join(', ')}.`);
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

  async function handleGoogleAuth() {
    setBusy(true);
    setMessage('');
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: window.location.origin },
    });
    if (error) {
      setMessage('Не получилось войти через Google. Попробуй ещё раз.');
      setBusy(false);
    }
  }

  return (
    <section className="auth-form">
      <h2>{mode === 'signin' ? 'Вход' : 'Регистрация'}</h2>
      <button className="google-auth" type="button" onClick={handleGoogleAuth} disabled={busy}>
        <span aria-hidden="true">G</span>
        {mode === 'signin' ? 'Войти через Google' : 'Регистрация через Google'}
      </button>
      <div className="auth-divider"><span>или по email</span></div>
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
