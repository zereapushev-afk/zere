import { Link } from 'wouter';

type SiteHeaderProps = {
  onPublish: () => void;
  onAuth: () => void;
  onSignOut: () => void;
  isAuthenticated: boolean;
};

export function SiteHeader({ onPublish, onAuth, onSignOut, isAuthenticated }: SiteHeaderProps) {
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
      </nav>
      <button className="header-auth" onClick={isAuthenticated ? onSignOut : onAuth}>
        {isAuthenticated ? 'Выйти' : 'Регистрация'}
      </button>
      <button className="button button--small header-publish" onClick={onPublish}>
        + Выложить работу
      </button>
    </header>
  );
}
