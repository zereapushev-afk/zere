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
        <span className="brand__mark">о</span>
        <span>обмен</span>
      </Link>
      <nav className="site-nav" aria-label="Основная навигация">
        <a href="#gallery">Работы</a>
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
