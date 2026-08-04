import { useEffect, useRef, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Link } from 'wouter';
import { getAvatarUrl, loadProfile } from '../lib/profile';

type ProfileMenuProps = {
  user: User | null;
  onAuth: () => void;
  onSignOut: () => void;
};

export function ProfileMenu({ user, onAuth, onSignOut }: ProfileMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  const [initial, setInitial] = useState('Я');
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    void loadProfile(user).then(async (profile) => {
      setInitial(profile.display_name.slice(0, 1).toUpperCase());
      setAvatarUrl(await getAvatarUrl(profile.avatar_path));
    }).catch(() => setInitial(user.email?.slice(0, 1).toUpperCase() ?? 'Я'));
  }, [user]);

  useEffect(() => {
    if (!isOpen) return;
    const close = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    document.addEventListener('mousedown', close);
    return () => document.removeEventListener('mousedown', close);
  }, [isOpen]);

  if (!user) {
    return <button className="header-auth" onClick={onAuth}>Регистрация</button>;
  }

  return (
    <div className="profile-menu" ref={menuRef}>
      <button
        className="profile-menu__avatar"
        type="button"
        aria-label="Открыть меню профиля"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        {avatarUrl ? <img src={avatarUrl} alt="" /> : <span>{initial}</span>}
      </button>
      {isOpen && (
        <nav className="profile-menu__panel" aria-label="Меню профиля">
          <Link href="/profile" onClick={() => setIsOpen(false)}>Профиль</Link>
          <Link href="/favorites" onClick={() => setIsOpen(false)}>Нравится</Link>
          <Link href="/support" onClick={() => setIsOpen(false)}>Поддержка</Link>
          <Link href="/moderation" onClick={() => setIsOpen(false)}>Удалённые работы</Link>
          <button type="button" onClick={onSignOut}>Выйти</button>
        </nav>
      )}
    </div>
  );
}
