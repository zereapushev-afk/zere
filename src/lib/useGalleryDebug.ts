import { useEffect } from 'react';
import { debugLog } from './debug';

export function useGalleryDebug(
  total: number,
  visible: number,
  category: string,
  query: string,
) {
  useEffect(() => {
    debugLog('Галерея отфильтрована', {
      total,
      visible,
      category,
      hasSearchQuery: Boolean(query.trim()),
    });
  }, [total, visible, category, query]);
}
