import { supabase } from './supabase';

export async function loadFavoriteIds(): Promise<string[]> {
  const { data, error } = await supabase.from('favorites').select('entry_id');
  if (error) throw error;
  return data.map((favorite) => favorite.entry_id);
}

export async function setFavorite(entryId: string, isFavorite: boolean) {
  const { error } = isFavorite
    ? await supabase.from('favorites').insert({ entry_id: entryId })
    : await supabase.from('favorites').delete().eq('entry_id', entryId);

  if (error) throw error;
}
