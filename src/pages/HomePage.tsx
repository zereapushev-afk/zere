import { useEffect, useMemo, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { ArtworkCard } from '../components/ArtworkCard';
import { AuthModal } from '../components/AuthModal';
import { DecorativeStars } from '../components/DecorativeStars';
import { PublishModal } from '../components/PublishModal';
import { SiteHeader } from '../components/SiteHeader';
import { TradeModal } from '../components/TradeModal';
import { artworks, categories, type Artwork } from '../data/artworks';
import { supabase } from '../lib/supabase';

export function HomePage() {
  const [category, setCategory] = useState(categories[0]);
  const [query, setQuery] = useState('');
  const [favorites, setFavorites] = useState<number[]>([]);
  const [selectedArtwork, setSelectedArtwork] = useState<Artwork | null>(null);
  const [isPublishing, setIsPublishing] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [session, setSession] = useState<Session | null>(null);

  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      setSession(nextSession);
      if (nextSession) setIsAuthOpen(false);
    });
    return () => data.subscription.unsubscribe();
  }, []);

  const visibleArtworks = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();
    return artworks.filter((artwork) => {
      const matchesCategory = category === categories[0] || artwork.category === category;
      const matchesQuery = `${artwork.title} ${artwork.author} ${artwork.city}`
        .toLowerCase()
        .includes(normalizedQuery);
      return matchesCategory && matchesQuery;
    });
  }, [category, query]);

  function toggleFavorite(id: number) {
    setFavorites((current) =>
      current.includes(id) ? current.filter((item) => item !== id) : [...current, id],
    );
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
          <h1>Меняйся тем,<br /><em>что ты создаёшь</em></h1>
          <p>Место, где авторы обмениваются анимацией, музыкой и иллюстрациями — без ценников и посредников.</p>
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

        <section className="gallery" id="gallery">
          <div className="section-heading">
            <div><span className="eyebrow">Найди что-то своё</span><h2>Свежие работы</h2></div>
            <input
              className="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Поиск по работам"
              aria-label="Поиск"
            />
          </div>
          <div className="filters">
            {categories.map((item) => (
              <button
                className={category === item ? 'filter filter--active' : 'filter'}
                key={item}
                onClick={() => setCategory(item)}
              >
                {item}
              </button>
            ))}
          </div>
          <div className="art-grid">
            {visibleArtworks.map((artwork) => (
              <ArtworkCard
                key={artwork.id}
                artwork={artwork}
                isFavorite={favorites.includes(artwork.id)}
                onFavorite={() => toggleFavorite(artwork.id)}
                onTrade={() => requireAuth(() => setSelectedArtwork(artwork))}
              />
            ))}
          </div>
          {visibleArtworks.length === 0 && (
            <div className="empty-state">
              <div className="empty-state__art" aria-hidden="true">
                <span>✦</span><span>♪</span><span>◌</span>
              </div>
              <span className="eyebrow">Начни первым</span>
              <h3>Нет добавленных работ</h3>
              <p>Здесь появятся анимации, музыка и иллюстрации авторов.</p>
              <button className="button" onClick={() => requireAuth(() => setIsPublishing(true))}>
                Добавить свою работу
              </button>
            </div>
          )}
        </section>

      </main>
      <TradeModal artwork={selectedArtwork} onClose={() => setSelectedArtwork(null)} />
      <PublishModal isOpen={isPublishing} onClose={() => setIsPublishing(false)} />
      <AuthModal isOpen={isAuthOpen} onClose={() => setIsAuthOpen(false)} />
    </>
  );
}
