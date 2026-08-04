import type { Artwork } from '../data/artworks';
import { getAvatarUrl, loadPublicProfiles } from './profile';
import { supabase } from './supabase';

type RemovedEntryRow = {
  id: string;
  title: string;
  category: string | null;
  offer: string | null;
  file_path: string | null;
  user_id: string;
  moderation_reason: string | null;
  moderated_at: string | null;
};

export type RemovedArtwork = Artwork & {
  moderationReason: string;
  moderatedAt: string;
  appeal?: { body: string; status: 'pending' | 'accepted' };
};

export async function loadRemovedArtworks(): Promise<RemovedArtwork[]> {
  const { data, error } = await supabase
    .from('entries')
    .select('id, title, category, offer, file_path, user_id, moderation_reason, moderated_at')
    .eq('is_removed', true)
    .order('moderated_at', { ascending: false });
  if (error) throw error;

  const entries = data as RemovedEntryRow[];
  const profiles = await loadPublicProfiles([...new Set(entries.map((entry) => entry.user_id))]);
  const profileMap = new Map(profiles.map((profile) => [profile.user_id, profile]));
  const { data: appeals, error: appealsError } = await supabase
    .from('artwork_appeals').select('entry_id, body, status');
  if (appealsError) throw appealsError;

  return Promise.all(entries.map(async (entry) => {
    const profile = profileMap.get(entry.user_id);
    const appeal = appeals.find((item) => item.entry_id === entry.id);
    const { data: file } = entry.file_path
      ? await supabase.storage.from('artworks').createSignedUrl(entry.file_path, 3600)
      : { data: null };
    return {
      id: entry.id,
      title: entry.title,
      author: profile?.display_name ?? 'Автор',
      authorId: entry.user_id,
      authorAvatarUrl: profile?.avatar_path ? (await getAvatarUrl(profile.avatar_path)) ?? undefined : undefined,
      category: entry.category ?? 'Другое',
      city: 'Онлайн',
      imageUrl: file?.signedUrl,
      filePath: entry.file_path ?? undefined,
      offer: entry.offer ?? '',
      color: '#f7c8cc',
      moderationReason: entry.moderation_reason ?? 'Причина не указана',
      moderatedAt: entry.moderated_at ?? '',
      appeal: appeal ? { body: appeal.body, status: appeal.status as 'pending' | 'accepted' } : undefined,
    };
  }));
}

export async function moderateArtwork(id: string, reason: string) {
  const { error } = await supabase.rpc('moderate_artwork', { target_entry_id: id, reason });
  if (error) throw error;
}

export async function restoreArtwork(id: string) {
  const { error } = await supabase.rpc('restore_artwork', { target_entry_id: id });
  if (error) throw error;
}

export async function submitArtworkAppeal(id: string, body: string) {
  const { error } = await supabase.rpc('submit_artwork_appeal', { target_entry_id: id, appeal_body: body });
  if (error) throw error;
}
