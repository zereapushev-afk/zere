import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Link } from 'wouter';
import { SupportRequestCard } from '../components/SupportRequestCard';
import { isDeveloper } from '../lib/developer';
import { loadSupportRequests, type SupportRequest } from '../lib/support';
import { supabase } from '../lib/supabase';

export function DeveloperSupportPage() {
  const [user, setUser] = useState<User | null>();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [error, setError] = useState('');

  const refresh = useCallback(async () => {
    try {
      setRequests(await loadSupportRequests());
      setError('');
    } catch {
      setError('Не удалось загрузить обращения. Проверь подключение к Supabase.');
    }
  }, []);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (isDeveloper(data.user)) void refresh();
    });
  }, [refresh]);

  return (
    <>
      <header className="simple-header">
        <Link className="brand" href="/"><span className="brand__mark">A</span><span>Art Swap</span></Link>
        <Link href="/">На главную</Link>
      </header>
      <main className="support-page developer-support-page">
        <span className="eyebrow">Для разработчика</span>
        <h1>Обращения</h1>
        {user === undefined ? <p>Загружаю…</p> : !isDeveloper(user) ? (
          <p className="support-card">Эта страница доступна только разработчику.</p>
        ) : (
          <>
            {error && <p className="form-error">{error}</p>}
            {!error && requests.length === 0 && <p className="support-card">Новых обращений пока нет.</p>}
            <div className="support-request-list">
              {requests.map((request) => <SupportRequestCard key={request.id} request={request} onReplied={() => void refresh()} />)}
            </div>
          </>
        )}
      </main>
    </>
  );
}
