import { useEffect, useRef } from 'react';

const AD_CLIENT = 'ca-pub-4171729358478046';
const AD_SLOT = '8780617493';

export function AdSenseCard() {
  const hasRequestedAd = useRef(false);

  useEffect(() => {
    if (hasRequestedAd.current) return;
    hasRequestedAd.current = true;

    const adsWindow = window as Window & {
      adsbygoogle?: Array<Record<string, never>>;
    };

    try {
      (adsWindow.adsbygoogle ??= []).push({});
    } catch {
      // Ad blockers and an unapproved site can prevent AdSense from loading.
    }
  }, []);

  return (
    <aside className="adsense-card" aria-label="Реклама">
      <span className="adsense-card__label">Реклама</span>
      <ins
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={AD_CLIENT}
        data-ad-slot={AD_SLOT}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}
