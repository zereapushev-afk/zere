import type { User } from '@supabase/supabase-js';
import type { Artwork } from '../data/artworks';
import { debugError, debugLog } from './debug';
import { supabase } from './supabase';
import { getAvatarUrl, loadPublicProfiles } from './profile';

type EntryRow = {
  id: string;
  title: string;
  category: string | null;
  offer: string | null;
  file_path: string | null;
  user_id: string;
};

export async function loadArtworks(user: User | null, ownerId?: string): Promise<Artwork[]> {
  if (!user) {
    debugLog('Загрузка работ пропущена: пользователь не авторизован');
    return [];
  }

  let query = supabase
    .from('entries')
    .select('id, title, category, offer, file_path, user_id')
    .order('created_at', { ascending: false });
  if (ownerId) query = query.eq('user_id', ownerId);
  const { data, error } = await query;

  if (error) {
    debugError('Supabase не вернул список работ', error);
    throw error;
  }

  debugLog('Записи работ получены из Supabase', { count: data.length });

  const entries = data as EntryRow[];
  const profiles = await loadPublicProfiles([...new Set(entries.map((entry) => entry.user_id))]);
  const profileMap = new Map(profiles.map((profile) => [profile.user_id, profile]));

  return Promise.all(entries.map(async (entry) => {
    let imageUrl: string | undefined;
    const profile = profileMap.get(entry.user_id);

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
      author: profile?.display_name ?? 'Автор',
      authorId: entry.user_id,
      authorAvatarUrl: profile?.avatar_path ? (await getAvatarUrl(profile.avatar_path)) ?? undefined : undefined,
      category: entry.category ?? 'Другое',
      city: 'Онлайн',
      imageUrl,
      filePath: entry.file_path ?? undefined,
      offer: entry.offer ?? 'Автор открыт к предложениям',
      color: '#f7c8cc',
    };
  }));
}

export async function updateArtwork(id: string, title: string, offer: string) {
  const { error } = await supabase
    .from('entries')
    .update({ title, offer })
    .eq('id', id)
    .select('id')
    .single();
  if (error) throw error;
}

export async function deleteArtwork(artwork: Artwork) {
  const { error } = await supabase.from('entries').delete().eq('id', artwork.id);
  if (error) throw error;

  if (artwork.filePath) {
    await supabase.storage.from('artworks').remove([artwork.filePath]);
  }
}
