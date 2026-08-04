import { AI_BLOCK_THRESHOLD, type AiCheckResult } from '../lib/aiArtworkCheck';

type AiCheckNoticeProps = {
  result: AiCheckResult;
};

export function AiCheckNotice({ result }: AiCheckNoticeProps) {
  return (
    <div className={`ai-check ${result.blocked ? 'ai-check--blocked' : 'ai-check--passed'}`} role="status">
      <strong>Оценка ИИ: {result.score}%</strong>
      <span>
        {result.blocked
          ? `Публикация недоступна: результат достиг ${AI_BLOCK_THRESHOLD}%.`
          : 'Проверка пройдена — работу можно опубликовать.'}
      </span>
      <small>Это автоматическая оценка признаков, а не доказательство авторства.</small>
    </div>
  );
}
