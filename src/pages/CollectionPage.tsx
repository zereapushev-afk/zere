import { useCallback, useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { ArtworkCard } from '../components/ArtworkCard';
import { ArtworkGridSkeleton } from '../components/ArtworkGridSkeleton';
import { AuthModal } from '../components/AuthModal';
import { EditArtworkModal } from '../components/EditArtworkModal';
import { PublishModal } from '../components/PublishModal';
import { ProfileCard } from '../components/ProfileCard';
import { SiteHeader } from '../components/SiteHeader';
import type { Artwork } from '../data/artworks';
import { deleteArtwork, loadArtworks } from '../lib/artworks';
import { loadFavoriteIds, setFavorite } from '../lib/favorites';
import { isDeveloper } from '../lib/developer';
import { supabase } from '../lib/supabase';

type CollectionPageProps = {
  favoritesOnly?: boolean;
};

export function CollectionPage({ favoritesOnly = false }: CollectionPageProps) {
  const [session, setSession] = useState<Session | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [isPublishing, setIsPublishing] = useState(false);
  const [editingArtwork, setEditingArtwork] = useState<Artwork | null>(null);

  const refresh = useCallback(async (activeSession: Session | null) => {
    setIsLoading(true);
    if (!activeSession) {
      setArtworks([]);
      setFavoriteIds([]);
      setIsLoading(false);
      return;
    }
    try {
      try {
        setArtworks(await loadArtworks(activeSession.user, favoritesOnly ? undefined : activeSession.user.id));
      } catch {
        setArtworks([]);
      }
      try {
        setFavoriteIds(await loadFavoriteIds());
      } catch {
        setFavoriteIds([]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [favoritesOnly]);

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

  async function removeArtwork(artwork: Artwork) {
    const shouldDelete = window.confirm(`Удалить работу «${artwork.title}»? Это действие нельзя отменить.`);
    if (!shouldDelete) return;

    try {
      await deleteArtwork(artwork);
      await refresh(session);
    } catch {
      window.alert('Не получилось удалить работу. Попробуй ещё раз.');
    }
  }

  const visibleArtworks = favoritesOnly
    ? artworks.filter((artwork) => favoriteIds.includes(artwork.id))
    : artworks;

  return (
    <>
      <SiteHeader
        isAuthenticated={Boolean(session)}
        isDeveloper={isDeveloper(session?.user)}
        onAuth={() => setIsAuthOpen(true)}
        onSignOut={() => void supabase.auth.signOut()}
        onPublish={() => session ? setIsPublishing(true) : setIsAuthOpen(true)}
      />
      <main className="collection-page">
        {!favoritesOnly && session && <ProfileCard user={session.user} />}
        <span className="eyebrow">{favoritesOnly ? 'Твоя коллекция' : 'Твоё творчество'}</span>
        <h1>{favoritesOnly ? 'Нравится' : 'Мои работы'}</h1>
        <p>{favoritesOnly ? 'Все работы, которые ты отметил сердечком.' : 'Все работы, которые ты опубликовал.'}</p>
        {isLoading ? (
          <ArtworkGridSkeleton />
        ) : (
          <div className="art-grid">
            {visibleArtworks.map((artwork) => (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                isFavorite={favoriteIds.includes(artwork.id)}
                onFavorite={() => void toggleFavorite(artwork.id)}
                onTrade={() => undefined}
                showTrade={false}
                onEdit={favoritesOnly ? undefined : () => setEditingArtwork(artwork)}
                onDelete={favoritesOnly ? undefined : () => void removeArtwork(artwork)}
              />
            ))}
          </div>
        )}
        {!isLoading && visibleArtworks.length === 0 && (
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
      <EditArtworkModal
        artwork={editingArtwork}
        onClose={() => setEditingArtwork(null)}
        onSaved={() => void refresh(session)}
      />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
