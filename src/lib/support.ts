import { supabase } from './supabase';

export type SupportTopic = 'ai_appeal' | 'artwork_report' | 'development_suggestion' | 'other';

export type SupportRequest = {
  id: string;
  user_id: string;
  user_email: string | null;
  topic: SupportTopic;
  message: string;
  ai_score: number | null;
  artwork_title: string | null;
  evidence_path: string | null;
  status: 'new' | 'reviewing' | 'resolved';
  reply: string | null;
  replied_at: string | null;
  created_at: string;
};

export const SUPPORT_TOPIC_LABELS: Record<SupportTopic, string> = {
  ai_appeal: 'Апелляция AI',
  artwork_report: 'Жалоба на работу',
  development_suggestion: 'Предложение',
  other: 'Другое',
};

type SupportMessage = {
  topic: SupportTopic;
  message: string;
  aiScore: number | null;
  evidence: File | null;
  artworkTitle: string | null;
};

export async function sendSupportMessage({ topic, message, aiScore, evidence, artworkTitle }: SupportMessage) {
  let evidencePath: string | null = null;
  if (evidence) {
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) throw new Error('Войди в аккаунт');
    const safeName = evidence.name.replace(/[^a-zA-Zа-яА-ЯёЁ0-9._-]/g, '_');
    evidencePath = `${userData.user.id}/${crypto.randomUUID()}-${safeName}`;
    const { error } = await supabase.storage.from('support-evidence').upload(evidencePath, evidence);
    if (error) throw error;
  }

  const { error } = await supabase.from('support_messages').insert({
    topic,
    message,
    ai_score: topic === 'ai_appeal' ? aiScore : null,
    evidence_path: evidencePath,
    artwork_title: topic === 'artwork_report' ? artworkTitle : null,
  });
  if (error) {
    if (evidencePath) await supabase.storage.from('support-evidence').remove([evidencePath]);
    throw error;
  }
}

export async function loadSupportRequests() {
  const { data, error } = await supabase
    .from('support_messages')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as SupportRequest[];
}

export async function loadMySupportRequests() {
  const { data: userData } = await supabase.auth.getUser();
  if (!userData.user) return [];
  const { data, error } = await supabase
    .from('support_messages')
    .select('*')
    .eq('user_id', userData.user.id)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data as SupportRequest[];
}

export async function replyToSupportRequest(id: string, reply: string) {
  const { error } = await supabase.rpc('reply_to_support_request', {
    request_id: id,
    reply_text: reply,
  });
  if (error) throw error;
}

export async function getEvidenceUrl(path: string) {
  const { data, error } = await supabase.storage.from('support-evidence').createSignedUrl(path, 300);
  if (error) throw error;
  return data.signedUrl;
}
