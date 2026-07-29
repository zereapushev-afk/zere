import type { Artwork } from '../data/artworks';

type ArtworkCardProps = {
  artwork: Artwork;
  isFavorite: boolean;
  onFavorite: () => void;
  onTrade: () => void;
};

export function ArtworkCard({ artwork, isFavorite, onFavorite, onTrade }: ArtworkCardProps) {
  return (
    <article className="art-card">
      <div className="art-card__visual" style={{ backgroundColor: artwork.color }}>
        <span aria-hidden="true">{artwork.image}</span>
        <button
          className={`favorite ${isFavorite ? 'favorite--active' : ''}`}
          onClick={onFavorite}
          aria-label="Добавить в избранное"
        >
          {isFavorite ? '♥' : '♡'}
        </button>
      </div>
      <div className="art-card__body">
        <div className="art-card__meta">
          <span>{artwork.category}</span>
          <span>{artwork.city}</span>
        </div>
        <h3>{artwork.title}</h3>
        <p className="author">Автор: {artwork.author}</p>
        <p className="offer">{artwork.offer}</p>
        <button className="trade-link" onClick={onTrade}>
          Предложить обмен <span>→</span>
        </button>
      </div>
    </article>
  );
}
