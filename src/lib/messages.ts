import { supabase } from './supabase';

export type DirectMessage = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
};

export async function sendDirectMessage(recipientId: string, body: string) {
  const { error } = await supabase.from('direct_messages').insert({ recipient_id: recipientId, body });
  if (error) throw error;
}

export async function loadDirectMessages() {
  const { data, error } = await supabase.from('direct_messages').select('*').order('created_at');
  if (error) throw error;
  return data as DirectMessage[];
}
