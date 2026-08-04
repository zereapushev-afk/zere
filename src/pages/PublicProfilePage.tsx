import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Link, useParams } from 'wouter';
import { ArtworkCard } from '../components/ArtworkCard';
import { ArtworkGridSkeleton } from '../components/ArtworkGridSkeleton';
import { ContentListSkeleton } from '../components/ContentListSkeleton';
import { MessageComposer } from '../components/MessageComposer';
import { SimpleHeader } from '../components/SimpleHeader';
import type { Artwork } from '../data/artworks';
import { loadArtworks } from '../lib/artworks';
import { getAvatarUrl, loadPublicProfile, type UserProfile } from '../lib/profile';
import { supabase } from '../lib/supabase';

export function PublicProfilePage() {
  const { id = '' } = useParams<{ id: string }>();
  const [session, setSession] = useState<Session | null>();
  const [profile, setProfile] = useState<UserProfile | null>();
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [areArtworksLoading, setAreArtworksLoading] = useState(true);

  useEffect(() => {
    void supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      try {
        const loaded = await loadPublicProfile(id);
        setProfile(loaded);
        if (!loaded) return;
        try {
          setAvatarUrl(await getAvatarUrl(loaded.avatar_path));
        } catch {
          setAvatarUrl(null);
        }
        try {
          setArtworks(await loadArtworks(data.session?.user ?? null, id));
          setAreArtworksLoading(false);
        } catch {
          setAreArtworksLoading(true);
        }
      } catch {
        setProfile(undefined);
      }
    });
  }, [id]);

  return (
    <>
      <SimpleHeader />
      <main className="public-profile-page">
        {session === undefined || profile === undefined ? <ContentListSkeleton count={2} label="Профиль загружается" /> : !profile ? <p className="support-card">Профиль не найден.</p> : (
          <>
            <section className="public-profile-header">
              <div className="profile-avatar">{avatarUrl ? <img src={avatarUrl} alt="Аватар автора" /> : profile.display_name.slice(0, 1).toUpperCase()}</div>
              <div><span className="eyebrow">Профиль автора</span><h1>{profile.display_name}</h1><p>{profile.bio || 'Автор пока не добавил био.'}</p></div>
            </section>
            {session?.user.id === profile.user_id ? <Link className="button button--small" href="/profile">Редактировать мой профиль</Link> : session ? <section className="author-message"><h2>Написать автору</h2><MessageComposer recipientId={profile.user_id} /></section> : null}
            <section className="author-artworks"><h2>Работы автора</h2>{areArtworksLoading ? <ArtworkGridSkeleton /> : <><div className="art-grid">{artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} isFavorite={false} onFavorite={() => undefined} onTrade={() => undefined} showTrade={false} />)}</div>{artworks.length === 0 && <p>У автора пока нет опубликованных работ.</p>}</>}</section>
          </>
        )}
      </main>
    </>
  );
}
