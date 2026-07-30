import { useCallback, useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { ArtworkGallery } from '../components/ArtworkGallery';
import { AuthModal } from '../components/AuthModal';
import { DecorativeStars } from '../components/DecorativeStars';
import { PublishModal } from '../components/PublishModal';
import { SiteHeader } from '../components/SiteHeader';
import { TradeModal } from '../components/TradeModal';
import { categories, type Artwork } from '../data/artworks';
import { loadArtworks } from '../lib/artworks';
import { debugError, debugLog } from '../lib/debug';
import { loadFavoriteIds, setFavorite } from '../lib/favorites';
import { supabase } from '../lib/supabase';
import { useGalleryDebug } from '../lib/useGalleryDebug';

export function HomePage() {
  const [category, setCategory] = useState(categories[0]);
  const [query, setQuery] = useState('');
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

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
    debugLog('Обновление галереи началось', { isAuthenticated: Boolean(session) });
    if (!session) {
      setArtworks([]);
      setFavorites([]);
      debugLog('Галерея очищена: активной сессии нет');
      return;
    }
    try {
      const loadedArtworks = await loadArtworks(session.user);
      setArtworks(loadedArtworks);
      debugLog('Работы записаны в состояние страницы', { count: loadedArtworks.length });
    } catch (error) {
      debugError('Не удалось записать работы в состояние страницы', error);
      setArtworks([]);
    }
    try {
      setFavorites(await loadFavoriteIds());
    } catch (error) {
      debugError('Не удалось загрузить лайки; работы остаются на странице', error);
      setFavorites([]);
    }
  }, [session]);

  useEffect(() => {
    void refreshArtworks();
  }, [refreshArtworks]);

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
        onAuth={() => setIsAuthOpen(true)}
        onSignOut={() => void supabase.auth.signOut()}
        onPublish={() => requireAuth(() => setIsPublishing(true))}
      />
      <main>
        <section className="hero">
          <DecorativeStars />
          <span className="eyebrow">Творчество находит новый дом</span>
          <h1>Art Swap —<br /><em>обмен творческих работ</em></h1>
          <p>Делись работами в любом формате, находи близкое тебе творчество и предлагай честный обмен.</p>
          <div className="hero__actions">
            <a className="button" href="#gallery">Смотреть работы</a>
            <button className="text-button" onClick={() => requireAuth(() => setIsPublishing(true))}>Выложить свою →</button>
          </div>
          <ol className="hero-guide" aria-label="Как обменяться работой">
            <li><b>01</b><span>Выложи свою работу</span></li>
            <li><b>02</b><span>Найди то, что нравится</span></li>
            <li><b>03</b><span>Предложи автору обмен</span></li>
          </ol>
        </section>

        <ArtworkGallery
          artworks={visibleArtworks}
          categories={categories}
          category={category}
          query={query}
          favoriteIds={favorites}
          onCategoryChange={setCategory}
          onQueryChange={setQuery}
          onFavorite={(id) => void toggleFavorite(id)}
          onTrade={(artwork) => requireAuth(() => setSelectedArtwork(artwork))}
          onPublish={() => requireAuth(() => setIsPublishing(true))}
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
