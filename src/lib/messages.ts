import { supabase } from './supabase';

export type DirectMessage = {
  id: string;
  sender_id: string;
  recipient_id: string;
  body: string;
  created_at: string;
  offered_artwork_id: string | null;
  requested_artwork_id: string | null;
  trade_status: 'pending' | 'accepted' | 'rejected' | null;
};

export async function sendDirectMessage(recipientId: string, body: string) {
  const { error } = await supabase.from('direct_messages').insert({ recipient_id: recipientId, body });
  if (error) throw error;
}

export async function sendTradeOffer(recipientId: string, body: string, offeredArtworkId: string, requestedArtworkId: string) {
  const { error } = await supabase.from('direct_messages').insert({
    recipient_id: recipientId,
    body,
    offered_artwork_id: offeredArtworkId,
    requested_artwork_id: requestedArtworkId,
    trade_status: 'pending',
  });
  if (error) throw error;
}

export async function answerTradeOffer(messageId: string, status: 'accepted' | 'rejected') {
  const { error } = await supabase
    .from('direct_messages')
    .update({ trade_status: status })
    .eq('id', messageId)
    .eq('trade_status', 'pending');
  if (error) throw error;
}

export async function loadDirectMessages() {
  const { data, error } = await supabase.from('direct_messages').select('*').order('created_at');
  if (error) throw error;
  return data as DirectMessage[];
}
