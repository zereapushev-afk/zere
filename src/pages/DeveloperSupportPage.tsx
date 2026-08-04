import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Link } from 'wouter';
import { SupportRequestCard } from '../components/SupportRequestCard';
import { ContentListSkeleton } from '../components/ContentListSkeleton';
import { SimpleHeader } from '../components/SimpleHeader';
import { isDeveloper } from '../lib/developer';
import { loadSupportRequests, type SupportRequest } from '../lib/support';
import { supabase } from '../lib/supabase';

export function DeveloperSupportPage() {
  const [user, setUser] = useState<User | null>();
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setRequests(await loadSupportRequests());
      setError('');
      setIsLoading(false);
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
      <SimpleHeader />
      <main className="support-page developer-support-page">
        <span className="eyebrow">Только для разработчика</span>
        <h1>Модераторство</h1>
        {user === undefined ? <ContentListSkeleton label="Модераторство загружается" /> : !isDeveloper(user) ? (
          <p className="support-card">Эта страница доступна только разработчику.</p>
        ) : (
          <>
            <div className="moderator-links">
              <b>Обращения поддержки</b>
              <Link className="button button--small" href="/moderation">Удалённые работы</Link>
            </div>
            {isLoading || error ? <ContentListSkeleton label="Обращения загружаются" /> : requests.length === 0 ? <p className="support-card">Новых обращений пока нет.</p> : <div className="support-request-list">
              {requests.map((request) => <SupportRequestCard key={request.id} request={request} onReplied={() => void refresh()} />)}
            </div>}
          </>
        )}
      </main>
    </>
  );
}
