import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

type ArtworkImageProps = {
  src: string;
  alt: string;
  filePath?: string;
};

export function ArtworkImage({ src, alt, filePath }: ArtworkImageProps) {
  const [status, setStatus] = useState<'loading' | 'loaded' | 'error'>('loading');
  const [showSkeleton, setShowSkeleton] = useState(false);
  const [imageUrl, setImageUrl] = useState(src);
  const [hasRetried, setHasRetried] = useState(false);

  useEffect(() => {
    setStatus('loading');
    setShowSkeleton(false);
    setImageUrl(src);
    setHasRetried(false);
    const timer = window.setTimeout(() => setShowSkeleton(true), 500);
    return () => window.clearTimeout(timer);
  }, [src]);

  async function retryWithFreshUrl() {
    if (!filePath || hasRetried) {
      setStatus('error');
      return;
    }
    setHasRetried(true);
    const { data, error } = await supabase.storage.from('artworks').createSignedUrl(filePath, 3600);
    if (error || !data.signedUrl) {
      setStatus('error');
      return;
    }
    setStatus('loading');
    setImageUrl(data.signedUrl);
  }

  return (
    <>
      {((status === 'loading' && showSkeleton) || status === 'error') && (
        <span className="artwork-skeleton" aria-label="Изображение загружается" />
      )}
      <img
        className={status === 'loaded' ? 'artwork-image--loaded' : 'artwork-image--loading'}
        src={imageUrl}
        alt={alt}
        onLoad={() => setStatus('loaded')}
        onError={() => void retryWithFreshUrl()}
      />
    </>
  );
}
