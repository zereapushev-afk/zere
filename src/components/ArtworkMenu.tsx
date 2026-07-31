import { useEffect, useRef, useState } from 'react';

type ArtworkMenuProps = {
  onEdit: () => void;
  onDelete: () => void;
};

export function ArtworkMenu({ onEdit, onDelete }: ArtworkMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function closeMenu(event: MouseEvent) {
      if (!menuRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener('mousedown', closeMenu);
    return () => document.removeEventListener('mousedown', closeMenu);
  }, []);

  function runAction(action: () => void) {
    setIsOpen(false);
    action();
  }

  return (
    <div className="artwork-menu" ref={menuRef}>
      <button
        className="artwork-menu__trigger"
        type="button"
        aria-label="Действия с работой"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        •••
      </button>
      {isOpen && (
        <div className="artwork-menu__items">
          <button type="button" onClick={() => runAction(onEdit)}>Изменить</button>
          <button type="button" className="danger-button" onClick={() => runAction(onDelete)}>
            Удалить
          </button>
        </div>
      )}
    </div>
  );
}
