type PublishModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function PublishModal({ isOpen, onClose }: PublishModalProps) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={onClose}>
      <section className="modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <button className="modal__close" onClick={onClose} aria-label="Закрыть">×</button>
        <span className="eyebrow">Новая публикация</span>
        <h2>Покажи свою работу</h2>
        <p>Добавь описание и расскажи, что хочешь получить в обмен.</p>
        <label>
          Название
          <input placeholder="Название работы" />
        </label>
        <label>
          Категория
          <select defaultValue="">
            <option value="" disabled>Выбери категорию</option>
            <option>Анимация</option>
            <option>Музыка</option>
            <option>Иллюстрация</option>
          </select>
        </label>
        <label>
          Что хочешь получить?
          <textarea placeholder="Опиши желаемый обмен" rows={3} />
        </label>
        <button className="button" onClick={onClose}>Опубликовать</button>
      </section>
    </div>
  );
}
