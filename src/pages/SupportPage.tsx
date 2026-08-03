import { useEffect, useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { Link } from 'wouter';
import { SupportForm } from '../components/SupportForm';
import { MySupportRequests } from '../components/MySupportRequests';
import { SupportTopicPicker } from '../components/SupportTopicPicker';
import type { SupportTopic } from '../lib/support';
import { supabase } from '../lib/supabase';

function readAppealScore() {
  const value = sessionStorage.getItem('aiAppealScore');
  const score = value === null ? null : Number(value);
  return Number.isFinite(score) ? score : null;
}

export function SupportPage() {
  const [user, setUser] = useState<User | null>(null);
  const [aiScore] = useState(readAppealScore);
  const [topic, setTopic] = useState<SupportTopic | null>(aiScore === null ? null : 'ai_appeal');

  useEffect(() => {
    void supabase.auth.getUser().then(({ data }) => setUser(data.user));
  }, []);

  return (
    <>
      <header className="simple-header">
        <Link className="brand" href="/"><span className="brand__mark">A</span><span>Art Swap</span></Link>
        <Link href="/">На главную</Link>
      </header>
      <main className="support-page">
        <span className="eyebrow">Поддержка</span>
        {!user ? (
          <><h1>Нужна помощь?</h1><p className="support-card">Чтобы отправить обращение, сначала <Link href="/">войди в аккаунт</Link>.</p></>
        ) : topic ? (
          <SupportForm topic={topic} aiScore={aiScore} onBack={() => setTopic(null)} />
        ) : (
          <><h1>Что случилось?</h1><p>Выбери один вариант — мы покажем подходящую форму.</p><SupportTopicPicker onSelect={setTopic} /></>
        )}
        {user && !topic && <MySupportRequests />}
      </main>
    </>
  );
}
