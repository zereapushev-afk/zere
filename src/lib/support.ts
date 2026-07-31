import { supabase } from './supabase';

export async function sendSupportMessage(message: string, aiScore: number | null, evidence: File | null) {
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
    topic: aiScore === null ? 'support' : 'ai_appeal',
    message,
    ai_score: aiScore,
    evidence_path: evidencePath,
  });
  if (error) {
    if (evidencePath) await supabase.storage.from('support-evidence').remove([evidencePath]);
    throw error;
  }
}
