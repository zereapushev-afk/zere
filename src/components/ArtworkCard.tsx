import type { Artwork } from '../data/artworks';
import { ArtworkMenu } from './ArtworkMenu';

type ArtworkCardProps = {
  artwork: Artwork;
  isFavorite: boolean;
  onFavorite: () => void;
  onTrade: () => void;
  showTrade?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
};

export function ArtworkCard({
  artwork,
  isFavorite,
  onFavorite,
  onTrade,
  showTrade = true,
  onEdit,
  onDelete,
}: ArtworkCardProps) {
  return (
    <article className="art-card">
      <div className="art-card__visual" style={{ backgroundColor: artwork.color }}>
        {artwork.imageUrl ? (
          <img src={artwork.imageUrl} alt={artwork.title} />
        ) : (
          <span aria-hidden="true">✦</span>
        )}
        {onEdit && onDelete ? (
          <ArtworkMenu onEdit={onEdit} onDelete={onDelete} />
        ) : (
          <button
            className={`favorite ${isFavorite ? 'favorite--active' : ''}`}
            onClick={onFavorite}
            aria-label="Добавить в избранное"
          >
            {isFavorite ? '♥' : '♡'}
          </button>
        )}
      </div>
      <div className="art-card__body">
        <div className="art-card__meta">
          <span>{artwork.category}</span>
          <span>{artwork.city}</span>
        </div>
        <h3>{artwork.title}</h3>
        <p className="author">Автор: {artwork.author}</p>
        <p className="offer">{artwork.offer}</p>
        {showTrade && (
          <button className="trade-link" onClick={onTrade}>
            Предложить обмен <span>→</span>
          </button>
        )}
      </div>
    </article>
  );
}
