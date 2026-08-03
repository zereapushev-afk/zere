import { useEffect, useState } from 'react';

type ArtworkImageProps = {
  src: string;
  alt: string;
};

export function ArtworkImage({ src, alt }: ArtworkImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [showSkeleton, setShowSkeleton] = useState(false);

  useEffect(() => {
    setStatus('loading');
    setShowSkeleton(false);
    const timer = window.setTimeout(() => setShowSkeleton(true), 500);
    return () => window.clearTimeout(timer);
  }, [src]);

  return (
    <>
      {status === 'loading' && showSkeleton && (
        <span className="artwork-skeleton" aria-label="Изображение загружается" />
      )}
      {status === 'error' && (
        <span className="artwork-image-error">Не удалось загрузить изображение</span>
      )}
      <img
        className={status === 'loaded' ? 'artwork-image--loaded' : 'artwork-image--loading'}
        src={src}
        alt={alt}
        onLoad={() => setStatus('loaded')}
        onError={() => setStatus('error')}
      />
    </>
  );
}
