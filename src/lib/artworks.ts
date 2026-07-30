import type { User } from '@supabase/supabase-js';
import type { Artwork } from '../data/artworks';
import { debugError, debugLog } from './debug';
import { supabase } from './supabase';

type EntryRow = {
  id: string;
  title: string;
  category: string | null;
  offer: string | null;
  file_path: string | null;
};

export async function loadArtworks(user: User | null): Promise<Artwork[]> {
  if (!user) {
    debugLog('Загрузка работ пропущена: пользователь не авторизован');
    return [];
  }

  const { data, error } = await supabase
    .from('entries')
    .select('id, title, category, offer, file_path')
    .order('created_at', { ascending: false });

  if (error) {
    debugError('Supabase не вернул список работ', error);
    throw error;
  }

  debugLog('Записи работ получены из Supabase', { count: data.length });

  return Promise.all((data as EntryRow[]).map(async (entry) => {
    let imageUrl: string | undefined;

    if (entry.file_path) {
      const { data: signedFile } = await supabase.storage
        .from('artworks')
        .createSignedUrl(entry.file_path, 60 * 60);
      imageUrl = signedFile?.signedUrl;
      debugLog('Ссылка на файл подготовлена', {
        entryId: entry.id,
        hasImageUrl: Boolean(imageUrl),
      });
    }

    return {
      id: entry.id,
      title: entry.title,
      author: user.user_metadata.full_name ?? user.email ?? 'Автор',
      category: entry.category ?? 'Другое',
      city: 'Онлайн',
      imageUrl,
      offer: entry.offer ?? 'Автор открыт к предложениям',
      color: '#f7c8cc',
    };
  }));
}
