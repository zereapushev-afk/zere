import { Link } from 'wouter';
import { HeaderMenu } from './HeaderMenu';

type SiteHeaderProps = {
  onPublish: () => void;
  onAuth: () => void;
  onSignOut: () => void;
  isAuthenticated: boolean;
  isDeveloper?: boolean;
};

export function SiteHeader({ onPublish, onAuth, onSignOut, isAuthenticated, isDeveloper = false }: SiteHeaderProps) {
  return (
    <header className="site-header">
      <Link className="brand" href="/">
        <span className="brand__mark">A</span>
        <span>Art Swap</span>
      </Link>
      <nav className="site-nav" aria-label="Основная навигация">
        <Link href="/#gallery">Все работы</Link>
        <Link href="/favorites">Нравится</Link>
        <Link href="/profile">Профиль</Link>
        <Link href="/support">Поддержка</Link>
        {isAuthenticated && <Link href="/messages">Сообщения</Link>}
        {isDeveloper && <Link href="/developer-support">Ответы</Link>}
      </nav>
      <HeaderMenu
        isAuthenticated={isAuthenticated}
        isDeveloper={isDeveloper}
        onAuth={onAuth}
        onPublish={onPublish}
        onSignOut={onSignOut}
      />
      <button className="header-auth" onClick={isAuthenticated ? onSignOut : onAuth}>
        {isAuthenticated ? 'Выйти' : 'Регистрация'}
      </button>
      <button className="button button--small header-publish" onClick={onPublish}>
        + Выложить работу
      </button>
    </header>
  );
}
