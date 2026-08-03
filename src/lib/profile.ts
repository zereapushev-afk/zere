import type { User } from '@supabase/supabase-js';
import { supabase } from './supabase';

export type UserProfile = {
  user_id: string;
  display_name: string;
  bio: string;
  avatar_path: string | null;
};

export function defaultProfile(user: User): UserProfile {
  return {
    user_id: user.id,
    display_name: user.user_metadata.full_name ?? user.email?.split('@')[0] ?? 'Пользователь',
    bio: '',
    avatar_path: null,
  };
}

export async function loadProfile(user: User) {
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', user.id).maybeSingle();
  if (error) throw error;
  return (data as UserProfile | null) ?? defaultProfile(user);
}

export async function loadPublicProfile(userId: string) {
  const { data, error } = await supabase.from('profiles').select('*').eq('user_id', userId).maybeSingle();
  if (error) throw error;
  return data as UserProfile | null;
}

export async function loadPublicProfiles(userIds: string[]) {
  if (userIds.length === 0) return [];
  const { data, error } = await supabase.from('profiles').select('*').in('user_id', userIds);
  if (error) throw error;
  return data as UserProfile[];
}

export async function saveProfile(profile: UserProfile, avatar: File | null) {
  let avatarPath = profile.avatar_path;
  if (avatar) {
    avatarPath = `${profile.user_id}/avatar`;
    const { error } = await supabase.storage.from('avatars').upload(avatarPath, avatar, {
      contentType: avatar.type,
      upsert: true,
    });
    if (error) throw error;
  }

  const { error } = await supabase.from('profiles').upsert({
    user_id: profile.user_id,
    display_name: profile.display_name,
    bio: profile.bio,
    avatar_path: avatarPath,
    updated_at: new Date().toISOString(),
  });
  if (error) throw error;
  return { ...profile, avatar_path: avatarPath };
}

export async function getAvatarUrl(path: string | null) {
  if (!path) return null;
  const { data, error } = await supabase.storage.from('avatars').createSignedUrl(path, 3600);
  if (error) throw error;
  return data.signedUrl;
}
