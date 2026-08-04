import { Fragment } from 'react';
import type { Artwork } from '../data/artworks';
import { AdSenseCard } from './AdSenseCard';
import { ArtworkCard } from './ArtworkCard';
import { ArtworkGridSkeleton } from './ArtworkGridSkeleton';

type ArtworkGalleryProps = {
  artworks: Artwork[];
  categories: string[];
  category: string;
  query: string;
  favoriteIds: string[];
  onCategoryChange: (category: string) => void;
  onQueryChange: (query: string) => void;
  onFavorite: (id: string) => void;
  onTrade: (artwork: Artwork) => void;
  onPublish: () => void;
  onModerate?: (artwork: Artwork) => void;
  isLoading: boolean;
  hasAnyArtworks: boolean;
};

export function ArtworkGallery({
  artworks,
  categories,
  category,
  query,
  favoriteIds,
  onCategoryChange,
  onQueryChange,
  onFavorite,
  onTrade,
  onPublish,
  onModerate,
  isLoading,
  hasAnyArtworks,
}: ArtworkGalleryProps) {
  return (
    <section className="gallery" id="gallery">
      <div className="section-heading">
        <div><span className="eyebrow">Найди что-то своё</span><h2>Свежие работы</h2></div>
        <input
          className="search"
          value={query}
          onChange={(event) => onQueryChange(event.target.value)}
          placeholder="Поиск по работам"
          aria-label="Поиск"
        />
      </div>
      <div className="filters">
        {categories.map((item) => (
          <button
            className={category === item ? 'filter filter--active' : 'filter'}
            key={item}
            onClick={() => onCategoryChange(item)}
          >
            {item}
          </button>
        ))}
      </div>
      {isLoading ? <ArtworkGridSkeleton /> : <div className="art-grid">
          {artworks.map((artwork, index) => (
            <Fragment key={artwork.id}>
              <ArtworkCard
                artwork={artwork}
                isFavorite={favoriteIds.includes(artwork.id)}
                onFavorite={() => onFavorite(artwork.id)}
                onTrade={() => onTrade(artwork)}
                onModerate={onModerate ? () => onModerate(artwork) : undefined}
              />
              {(index + 1) % 6 === 0 && <AdSenseCard />}
            </Fragment>
          ))}
        </div>}
      {!isLoading && artworks.length === 0 && (
        <div className="empty-state">
          <div className="empty-state__art" aria-hidden="true">
            <span>✦</span><span>♪</span><span>◌</span>
          </div>
          <span className="eyebrow">{hasAnyArtworks ? 'Измени запрос' : 'Начни первым'}</span>
          <h3>{hasAnyArtworks ? 'Ничего не найдено' : 'Нет добавленных работ'}</h3>
          <p>{hasAnyArtworks ? 'Попробуй другую категорию или поисковую фразу.' : 'Здесь появятся творческие работы авторов в самых разных форматах.'}</p>
          {!hasAnyArtworks && <button className="button" onClick={onPublish}>Добавить свою работу</button>}
        </div>
      )}
    </section>
  );
}
