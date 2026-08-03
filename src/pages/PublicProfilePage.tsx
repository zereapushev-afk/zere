import { useEffect, useState } from 'react';
import type { Session } from '@supabase/supabase-js';
import { Link, useParams } from 'wouter';
import { ArtworkCard } from '../components/ArtworkCard';
import { MessageComposer } from '../components/MessageComposer';
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

  useEffect(() => {
    void supabase.auth.getSession().then(async ({ data }) => {
      setSession(data.session);
      if (!data.session) return;
      try {
        const loaded = await loadPublicProfile(id);
        setProfile(loaded);
        setAvatarUrl(await getAvatarUrl(loaded?.avatar_path ?? null));
        setArtworks(await loadArtworks(data.session.user, id));
      } catch {
        setProfile(null);
      }
    });
  }, [id]);

  return (
    <>
      <header className="simple-header"><Link className="brand" href="/"><span className="brand__mark">A</span><span>Art Swap</span></Link><Link href="/">На главную</Link></header>
      <main className="public-profile-page">
        {!session ? <p className="support-card">Войди в аккаунт, чтобы посмотреть профиль автора.</p> : profile === undefined ? <p>Загружаю…</p> : !profile ? <p className="support-card">Профиль не найден.</p> : (
          <>
            <section className="public-profile-header">
              <div className="profile-avatar">{avatarUrl ? <img src={avatarUrl} alt="Аватар автора" /> : profile.display_name.slice(0, 1).toUpperCase()}</div>
              <div><span className="eyebrow">Профиль автора</span><h1>{profile.display_name}</h1><p>{profile.bio || 'Автор пока не добавил био.'}</p></div>
            </section>
            {session.user.id === profile.user_id ? <Link className="button button--small" href="/profile">Редактировать мой профиль</Link> : <section className="author-message"><h2>Написать автору</h2><MessageComposer recipientId={profile.user_id} /></section>}
            <section className="author-artworks"><h2>Работы автора</h2><div className="art-grid">{artworks.map((artwork) => <ArtworkCard key={artwork.id} artwork={artwork} isFavorite={false} onFavorite={() => undefined} onTrade={() => undefined} showTrade={false} />)}</div>{artworks.length === 0 && <p>У автора пока нет опубликованных работ.</p>}</section>
          </>
        )}
      </main>
    </>
  );
}
