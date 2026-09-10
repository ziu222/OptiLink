import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/workspace/PageHeader/PageHeader';
import { ShortenedLinksPanel } from '../../components/workspace/panels/ShortenedLinksPanel/ShortenedLinksPanel';
import { LinkConfigPanel } from '../../components/workspace/panels/LinkConfigPanel/LinkConfigPanel';
import { QrPanel } from '../../components/workspace/panels/QrPanel/QrPanel';
import { getLink } from '../../api/links';
import type { ShortenedLink } from '../../api/links';
import './workspace.css';

const BREADCRUMB = [{ label: 'Shorten Link', to: '/dashboard' }];

export function LinkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [link, setLink] = useState<ShortenedLink | null>(null);
  const [state, setState] = useState<'loading' | 'ready' | 'error'>('loading');

  useEffect(() => {
    if (!id) return;
    getLink(id)
      .then((result) => {
        setLink(result);
        setState('ready');
      })
      .catch(() => setState('error'));
  }, [id]);

  if (state !== 'ready' || !link) {
    return (
      <>
        <PageHeader
          breadcrumb={BREADCRUMB}
          title={state === 'error' ? 'Link not found' : 'Loading…'}
        />
        {state === 'error' && (
          <p className="link-list-empty">This link doesn’t exist or isn’t yours.</p>
        )}
      </>
    );
  }

  return (
    <>
      <PageHeader breadcrumb={BREADCRUMB} title={link.title || 'Untitle'} />
      <div className="page-content">
        <ShortenedLinksPanel
          title="Shortened Link"
          links={[link]}
          showViewDetail={false}
          onDeleted={() => navigate('/dashboard')}
        />
        <div className="link-detail-config-row">
          <LinkConfigPanel link={link} onSaved={setLink} />
          <QrPanel link={link} />
        </div>
      </div>
    </>
  );
}
