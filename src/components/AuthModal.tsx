import { Auth } from './Auth';

type AuthModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function AuthModal({ isOpen, onClose }: AuthModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal auth-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Закрыть">×</button>
        <span className="eyebrow">Присоединяйся</span>
        <Auth onSuccess={onClose} />
      </section>
    </div>
  );
}
