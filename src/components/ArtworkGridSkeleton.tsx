const SKELETON_CARDS = 3;

export function ArtworkGridSkeleton() {
  return (
    <div className="art-grid" aria-label="Работы загружаются" aria-busy="true">
      {Array.from({ length: SKELETON_CARDS }, (_, index) => (
        <div className="art-card art-card--skeleton" key={index} aria-hidden="true">
          <div className="art-card__visual skeleton-shimmer" />
          <div className="art-card__body">
            <div className="skeleton-line skeleton-line--short" />
            <div className="skeleton-line skeleton-line--title" />
            <div className="skeleton-line skeleton-line--medium" />
          </div>
        </div>
      ))}
    </div>
  );
}
