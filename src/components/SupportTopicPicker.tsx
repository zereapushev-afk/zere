import type { SupportTopic } from '../lib/support';

type SupportTopicPickerProps = {
  onSelect: (topic: SupportTopic) => void;
};

const TOPICS: { topic: SupportTopic; title: string; description: string }[] = [
  { topic: 'ai_appeal', title: 'Подать апелляцию', description: 'Если проверка работы кажется ошибочной.' },
  { topic: 'artwork_report', title: 'Пожаловаться на работу', description: 'Сообщить о чужой работе, которая нарушает правила.' },
  { topic: 'development_suggestion', title: 'Предложить улучшение', description: 'Поделиться идеей по развитию и разработке.' },
  { topic: 'other', title: 'Другое', description: 'Написать разработчику о другой проблеме.' },
];

export function SupportTopicPicker({ onSelect }: SupportTopicPickerProps) {
  return (
    <div className="support-topics" role="radiogroup" aria-label="Выбери тему обращения">
      {TOPICS.map(({ topic, title, description }) => (
        <button className="support-topic" key={topic} role="radio" aria-checked="false" onClick={() => onSelect(topic)}>
          <span>{title}</span>
          <small>{description}</small>
          <b aria-hidden="true">→</b>
        </button>
      ))}
    </div>
  );
}
