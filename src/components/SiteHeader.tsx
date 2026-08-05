import { Link } from 'wouter';
import type { User } from '@supabase/supabase-js';
import { HeaderMenu } from './HeaderMenu';
import { ProfileMenu } from './ProfileMenu';

type SiteHeaderProps = {
  onPublish: () => void;
  onAuth: () => void;
  onSignOut: () => void;
  isAuthenticated: boolean;
  user?: User | null;
  isDeveloper?: boolean;
  onAllWorks?: () => void;
};

export function SiteHeader({ onPublish, onAuth, onSignOut, onAllWorks, isAuthenticated, user = null, isDeveloper = false }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span className="brand__mark">A</span>
        <span>Art Swap</span>
      </Link>
      <nav className="site-nav" aria-label="Основная навигация">
        {onAllWorks ? <button type="button" onClick={onAllWorks}>Все работы</button> : <Link href="/#gallery">Все работы</Link>}
        {isAuthenticated && <Link href="/messages">Сообщения</Link>}
        {isDeveloper && <Link href="/developer-support">Модераторство</Link>}
      </nav>
      <HeaderMenu
        isAuthenticated={isAuthenticated}
        isDeveloper={isDeveloper}
        onAuth={onAuth}
        onPublish={onPublish}
        onSignOut={onSignOut}
        onAllWorks={onAllWorks}
      />
      <button className="button button--small header-publish" onClick={onPublish}>
        + Выложить работу
      </button>
      <ProfileMenu user={user} onAuth={onAuth} onSignOut={onSignOut} />
    </header>
  );
}
