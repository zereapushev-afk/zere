type ContentListSkeletonProps = {
  count?: number;
  label?: string;
};

export function ContentListSkeleton({ count = 3, label = 'Данные загружаются' }: ContentListSkeletonProps) {
  return (
    <div className="content-list-skeleton" aria-label={label} aria-busy="true">
      {Array.from({ length: count }, (_, index) => (
        <div className="content-skeleton-card skeleton-shimmer" key={index} aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
      ))}
    </div>
  );
}
