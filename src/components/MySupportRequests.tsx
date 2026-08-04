import { useEffect, useState } from 'react';
import { loadMySupportRequests, SUPPORT_TOPIC_LABELS, type SupportRequest } from '../lib/support';
import { ContentListSkeleton } from './ContentListSkeleton';

export function MySupportRequests() {
  const [requests, setRequests] = useState<SupportRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    void loadMySupportRequests()
      .then((loaded) => { setRequests(loaded); setIsLoading(false); })
      .catch(() => setIsLoading(true));
  }, []);

  if (isLoading) return <ContentListSkeleton label="Обращения загружаются" />;
  if (requests.length === 0) return null;

  return (
    <section className="my-support-requests">
      <h2>Мои обращения</h2>
      {requests.map((request) => (
        <article className="support-request" key={request.id}>
          <div className="support-request__meta">
            <strong>{SUPPORT_TOPIC_LABELS[request.topic]}</strong>
            <time>{new Date(request.created_at).toLocaleDateString('ru-RU')}</time>
          </div>
          <p>{request.message}</p>
          {request.reply ? <div className="support-reply"><b>Ответ поддержки</b><p>{request.reply}</p></div> : <small>Ответ ещё готовится</small>}
        </article>
      ))}
    </section>
  );
}
