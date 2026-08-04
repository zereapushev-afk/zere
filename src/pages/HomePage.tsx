import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { ArtworkGallery } from '../components/ArtworkGallery';
import { AuthModal } from '../components/AuthModal';
import { HomeHero } from '../components/HomeHero';
import { PublishModal } from '../components/PublishModal';
import { SiteHeader } from '../components/SiteHeader';
import { TradeModal } from '../components/TradeModal';
import { categories, type Artwork } from '../data/artworks';
import { loadArtworks } from '../lib/artworks';
import { debugError, debugLog } from '../lib/debug';
import { isDeveloper } from '../lib/developer';
import { loadFavoriteIds, setFavorite } from '../lib/favorites';
import { supabase } from '../lib/supabase';
import { useGalleryDebug } from '../lib/useGalleryDebug';
import { useArtworkModeration } from '../lib/useArtworkModeration';

export function HomePage() {
  const [category, setCategory] = useState(categories[0]);
  const [query, setQuery] = useState('');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [session, setSession] = useState<Session | null>();
  const [isGalleryLoading, setIsGalleryLoading] = useState(true);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => {
      debugLog('Начальная сессия получена', { isAuthenticated: Boolean(data.session) });
      setSession(data.session);
    });
    const { data } = supabase.auth.onAuthStateChange((event, nextSession) => {
      debugLog('Состояние авторизации изменилось', {
        event,
        isAuthenticated: Boolean(nextSession),
      });
      setSession(nextSession);
      if (nextSession) setIsAuthOpen(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const refreshArtworks = useCallback(async () => {
    if (session === undefined) return;
    setIsGalleryLoading(true);
    debugLog('Обновление галереи началось', { isAuthenticated: Boolean(session) });
    let artworksLoaded = true;
    try {
      const loadedArtworks = await loadArtworks(session?.user ?? null);
      setArtworks(loadedArtworks);
      debugLog('Работы записаны в состояние страницы', { count: loadedArtworks.length });
    } catch (error) {
      debugError('Не удалось записать работы в состояние страницы', error);
      setArtworks([]);
      artworksLoaded = false;
    }
    if (session) {
      try {
        setFavorites(await loadFavoriteIds());
      } catch (error) {
        debugError('Не удалось загрузить лайки; работы остаются на странице', error);
        setFavorites([]);
      }
    } else setFavorites([]);
    setIsGalleryLoading(!artworksLoaded);
  }, [session]);

  useEffect(() => {
    void refreshArtworks();
  }, [refreshArtworks]);

  useEffect(() => {
    if (session === undefined || !isGalleryLoading) return;
    const retryTimer = window.setTimeout(() => void refreshArtworks(), 5000);
    return () => window.clearTimeout(retryTimer);
  }, [isGalleryLoading, refreshArtworks, session]);

  const visibleArtworks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return artworks.filter((artwork) => {
      const matchesCategory = category === categories[0] || artwork.category === category;
      const matchesQuery = `${artwork.title} ${artwork.author} ${artwork.city}`
        .toLowerCase()
        .includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [artworks, category, query]);

  useGalleryDebug(artworks.length, visibleArtworks.length, category, query);
  const removeAsModerator = useArtworkModeration(refreshArtworks);

  async function toggleFavorite(id: string) {
    const nextValue = !favorites.includes(id);
    setFavorites((current) => nextValue ? [...current, id] : current.filter((item) => item !== id));
    try {
      await setFavorite(id, nextValue);
    } catch {
      void refreshArtworks();
    }
  }

  function requireAuth(action: () => void) {
    if (!session) {
      setIsAuthOpen(true);
      return;
    }
    action();
  }

  return (
    <>
      <SiteHeader
        isAuthenticated={Boolean(session)}
        user={session?.user}
        isDeveloper={isDeveloper(session?.user)}
        onAuth={() => setIsAuthOpen(true)}
        onSignOut={() => void supabase.auth.signOut()}
        onPublish={() => requireAuth(() => setIsPublishing(true))}
      />
      <main>
        <HomeHero onPublish={() => requireAuth(() => setIsPublishing(true))} />

        <ArtworkGallery
          artworks={visibleArtworks}
          categories={categories}
          category={category}
          query={query}
          favoriteIds={favorites}
          onCategoryChange={setCategory}
          onQueryChange={setQuery}
          onFavorite={(id) => requireAuth(() => void toggleFavorite(id))}
          onTrade={(artwork) => requireAuth(() => setSelectedArtwork(artwork))}
          onPublish={() => requireAuth(() => setIsPublishing(true))}
          onModerate={isDeveloper(session?.user) ? (artwork) => void removeAsModerator(artwork) : undefined}
          isLoading={isGalleryLoading}
          hasAnyArtworks={artworks.length > 0}
        />

      </main>
      <TradeModal artwork={selectedArtwork} onClose={() => setSelectedArtwork(null)} />
      <PublishModal
        isOpen={isPublishing}
        onClose={() => setIsPublishing(false)}
        onPublished={() => {
          setCategory(categories[0]);
          setQuery('');
          void refreshArtworks();
        }}
      />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
