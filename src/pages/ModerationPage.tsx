import { useCallback, useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { ModeratedArtworkCard } from '../components/ModeratedArtworkCard';
import { ContentListSkeleton } from '../components/ContentListSkeleton';
import { SimpleHeader } from '../components/SimpleHeader';
import { isDeveloper } from '../lib/developer';
import { loadRemovedArtworks, restoreArtwork, submitArtworkAppeal, type RemovedArtwork } from '../lib/moderation';
import { supabase } from '../lib/supabase';

export function ModerationPage() {
  const [user, setUser] = useState<User | null>();
  const [artworks, setArtworks] = useState<RemovedArtwork[]>([]);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoadFailed, setHasLoadFailed] = useState(false);

  const refresh = useCallback(async () => {
    setIsLoading(true);
    try {
      setArtworks(await loadRemovedArtworks());
      setError('');
      setHasLoadFailed(false);
      setIsLoading(false);
    } catch {
      setHasLoadFailed(true);
      setError('Не удалось загрузить удалённые работы. Возможно, миграция базы ещё не применена.');
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => {
      setUser(data.user);
      if (data.user) void refresh();
    });
  }, [refresh]);

  async function appeal(id: string, body: string) {
    try {
      await submitArtworkAppeal(id, body);
      await refresh();
    } catch {
      setError('Не удалось отправить апелляцию. Попробуй ещё раз.');
    }
  }

  async function restore(id: string) {
    try {
      await restoreArtwork(id);
      await refresh();
    } catch {
      setError('Не удалось восстановить работу.');
    }
  }

  return (
    <>
      <SimpleHeader />
      <main className="moderation-page">
        <span className="eyebrow">Модерация</span>
        <h1>{isDeveloper(user) ? 'Удалённые работы' : 'Мои апелляции'}</h1>
        {user === undefined ? <ContentListSkeleton label="Модерация загружается" /> : !user ? <p>Войди в аккаунт, чтобы открыть этот раздел.</p> : (
          <>
            {isLoading ? <ContentListSkeleton label="Удалённые работы загружаются" /> : hasLoadFailed ? <p className="form-error">{error}</p> : <>{error && <p className="form-error">{error}</p>}{artworks.length === 0 ? <p className="support-card">Удалённых работ пока нет.</p> : <div className="moderation-list">
              {artworks.map((artwork) => <ModeratedArtworkCard key={artwork.id} artwork={artwork} isDeveloper={isDeveloper(user)} onAppeal={(body) => appeal(artwork.id, body)} onRestore={() => restore(artwork.id)} />)}
            </div>}</>}
          </>
        )}
      </main>
    </>
  );
}
