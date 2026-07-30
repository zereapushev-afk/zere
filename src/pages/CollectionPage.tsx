import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { ArtworkCard } from '../components/ArtworkCard';
import { AuthModal } from '../components/AuthModal';
import { PublishModal } from '../components/PublishModal';
import { SiteHeader } from '../components/SiteHeader';
import type { Artwork } from '../data/artworks';
import { loadArtworks } from '../lib/artworks';
import { loadFavoriteIds, setFavorite } from '../lib/favorites';
import { supabase } from '../lib/supabase';

type CollectionPageProps = {
  favoritesOnly?: boolean;
};

export function CollectionPage({ favoritesOnly = false }: CollectionPageProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);

  const refresh = useCallback(async (activeSession: Session | null) => {
    if (!activeSession) {
      setArtworks([]);
      setFavoriteIds([]);
      return;
    }
    try {
      setArtworks(await loadArtworks(activeSession.user));
    } catch {
      setArtworks([]);
    }
    try {
      setFavoriteIds(await loadFavoriteIds());
    } catch {
      setFavoriteIds([]);
    }
  }, []);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      void refresh(data.session);
    });
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      void refresh(nextSession);
    });
    return () => data.subscription.unsubscribe();
  }, [refresh]);

  async function toggleFavorite(id: string) {
    const nextValue = !favoriteIds.includes(id);
    setFavoriteIds((current) => nextValue ? [...current, id] : current.filter((item) => item !== id));
    try {
      await setFavorite(id, nextValue);
    } catch {
      void refresh(session);
    }
  }

  const visibleArtworks = favoritesOnly
    ? artworks.filter((artwork) => favoriteIds.includes(artwork.id))
    : artworks;

  return (
    <>
      <SiteHeader
        isAuthenticated={Boolean(session)}
        onAuth={() => setIsAuthOpen(true)}
        onSignOut={() => void supabase.auth.signOut()}
        onPublish={() => session ? setIsPublishing(true) : setIsAuthOpen(true)}
      />
      <main className="collection-page">
        <span className="eyebrow">{favoritesOnly ? 'Твоя коллекция' : 'Личный профиль'}</span>
        <h1>{favoritesOnly ? 'Нравится' : 'Мои работы'}</h1>
        <p>{favoritesOnly ? 'Все работы, которые ты отметил сердечком.' : 'Все работы, которые ты опубликовал.'}</p>
        <div className="art-grid">
          {visibleArtworks.map((artwork) => (
            <ArtworkCard
              key={artwork.id}
              artwork={artwork}
              isFavorite={favoriteIds.includes(artwork.id)}
              onFavorite={() => void toggleFavorite(artwork.id)}
              onTrade={() => undefined}
              showTrade={false}
            />
          ))}
        </div>
        {visibleArtworks.length === 0 && (
          <p className="collection-page__empty">
            {!session ? 'Войди в аккаунт, чтобы увидеть эту страницу.' : favoritesOnly ? 'Здесь пока нет понравившихся работ.' : 'Ты пока не опубликовал ни одной работы.'}
          </p>
        )}
      </main>
      <PublishModal
        isOpen={isPublishing}
        onClose={() => setIsPublishing(false)}
        onPublished={() => void refresh(session)}
      />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
