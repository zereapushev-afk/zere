import { useCallback } from 'react';
import type { Artwork } from '../data/artworks';
import { moderateArtwork } from './moderation';

export function useArtworkModeration(onModerated: () => Promise<void>) {
  return useCallback(async (artwork: Artwork) => {
    const reason = window.prompt(
      `Почему нужно удалить работу «${artwork.title}»? Автор увидит эту причину.`,
    )?.trim();
    if (!reason) return;
    if (reason.length < 5) {
      window.alert('Напиши причину подробнее — минимум 5 символов.');
      return;
    }
    try {
      await moderateArtwork(artwork.id, reason);
      await onModerated();
    } catch {
      window.alert('Не удалось удалить работу. Проверь права разработчика и подключение к базе.');
    }
  }, [onModerated]);
}
