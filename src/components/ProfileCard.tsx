import { useEffect, useState, type FormEvent } from 'react';
import type { User } from '@supabase/supabase-js';
import { getAvatarUrl, loadProfile, saveProfile, type UserProfile } from '../lib/profile';
import { AvatarCropper } from './AvatarCropper';
import { ContentListSkeleton } from './ContentListSkeleton';

type ProfileCardProps = { user: User };

export function ProfileCard({ user }: ProfileCardProps) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [avatar, setAvatar] = useState<File | null>(null);
  const [avatarToCrop, setAvatarToCrop] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    void loadProfile(user).then(async (loaded) => {
      setProfile(loaded);
      setAvatarUrl(await getAvatarUrl(loaded.avatar_path));
    }).catch(() => setError('Не удалось загрузить профиль.'));
  }, [user]);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!profile) return;
    setIsSaving(true);
    setError('');
    try {
      const saved = await saveProfile(profile, avatar);
      setProfile(saved);
      setAvatarUrl(await getAvatarUrl(saved.avatar_path));
      setAvatar(null);
      setIsEditing(false);
    } catch {
      setError('Не удалось сохранить изменения. Попробуй ещё раз.');
    } finally {
      setIsSaving(false);
    }
  }

  function chooseAvatar(file: File | undefined) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024 || !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      setError('Выбери JPG, PNG или WebP размером до 5 МБ.');
      return;
    }
    setError('');
    setAvatarToCrop(file);
  }

  if (!profile) return <section className="profile-card"><ContentListSkeleton count={2} label="Профиль загружается" /></section>;

  return (
    <section className="profile-card">
      <div className="profile-avatar">
        {avatarUrl ? <img src={avatarUrl} alt="Аватар профиля" /> : <span>{profile.display_name.slice(0, 1).toUpperCase()}</span>}
      </div>
      {isEditing ? (
        <form className="profile-form" onSubmit={handleSubmit}>
          <label>Имя<input value={profile.display_name} onChange={(e) => setProfile({ ...profile, display_name: e.target.value })} minLength={2} maxLength={50} required /></label>
          <label>Био<textarea value={profile.bio} onChange={(e) => setProfile({ ...profile, bio: e.target.value })} maxLength={300} rows={4} placeholder="Расскажи немного о себе и своём творчестве" /></label>
          <label>Новый аватар<input type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => chooseAvatar(e.target.files?.[0])} /></label>
          {error && <p className="form-error">{error}</p>}
          <div className="profile-actions"><button className="button button--small" disabled={isSaving}>{isSaving ? 'Сохраняю…' : 'Сохранить'}</button><button className="text-button" type="button" onClick={() => setIsEditing(false)}>Отмена</button></div>
        </form>
      ) : (
        <div className="profile-details">
          <h1>{profile.display_name}</h1>
          <p>{profile.bio || 'Здесь пока нет био.'}</p>
          <button className="button button--small" onClick={() => setIsEditing(true)}>Редактировать профиль</button>
        </div>
      )}
      {avatarToCrop && <AvatarCropper file={avatarToCrop} onCancel={() => setAvatarToCrop(null)} onCrop={(cropped, previewUrl) => { setAvatar(cropped); setAvatarUrl(previewUrl); setAvatarToCrop(null); }} />}
    </section>
  );
}
