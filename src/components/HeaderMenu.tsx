import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';

type HeaderMenuProps = {
  isAuthenticated: boolean;
  isDeveloper: boolean;
  onAuth: () => void;
  onPublish: () => void;
  onSignOut: () => void;
  onAllWorks?: () => void;
};

export function HeaderMenu({ isAuthenticated, isDeveloper, onAuth, onPublish, onSignOut, onAllWorks }: HeaderMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (!menuRef.current?.contains(event.target as Node)) setIsOpen(false);
    };
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false);
    };

    document.addEventListener('mousedown', closeOnOutsideClick);
    document.addEventListener('keydown', closeOnEscape);
    return () => {
      document.removeEventListener('mousedown', closeOnOutsideClick);
      document.removeEventListener('keydown', closeOnEscape);
    };
  }, [isOpen]);

  const closeMenu = () => setIsOpen(false);
  const runAction = (action: () => void) => {
    closeMenu();
    action();
  };

  return (
    <div className="header-menu" ref={menuRef}>
      <button
        className={`header-menu__trigger${isOpen ? ' header-menu__trigger--open' : ''}`}
        type="button"
        aria-label={isOpen ? 'Закрыть меню' : 'Открыть меню'}
        aria-expanded={isOpen}
        onClick={() => setIsOpen((open) => !open)}
      >
        <span />
        <span />
        <span />
      </button>

      {isOpen && (
        <nav className="header-menu__panel" aria-label="Меню сайта">
          {onAllWorks ? (
            <button type="button" onClick={() => runAction(onAllWorks)}>Все работы</button>
          ) : (
            <Link href="/#gallery" onClick={closeMenu}>Все работы</Link>
          )}
          {isAuthenticated && <Link href="/favorites" onClick={closeMenu}>Нравится</Link>}
          {isAuthenticated && <Link href="/profile" onClick={closeMenu}>Профиль</Link>}
          {isAuthenticated && <Link href="/messages" onClick={closeMenu}>Сообщения</Link>}
          <Link href="/support" onClick={closeMenu}>Поддержка</Link>
          {isDeveloper && <Link href="/developer-support" onClick={closeMenu}>Модераторство</Link>}
          {isAuthenticated && <Link href="/moderation" onClick={closeMenu}>{isDeveloper ? 'Удалённые работы' : 'Мои апелляции'}</Link>}
          <button type="button" onClick={() => runAction(onPublish)}>+ Выложить работу</button>
          <button
            className="header-menu__auth"
            type="button"
            onClick={() => runAction(isAuthenticated ? onSignOut : onAuth)}
          >
            {isAuthenticated ? 'Выйти из аккаунта' : 'Войти или зарегистрироваться'}
          </button>
        </nav>
      )}
    </div>
  );
}
