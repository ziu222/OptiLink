import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { PageHeader } from '../../components/workspace/PageHeader/PageHeader';
import { ContentPanel } from '../../components/workspace/panels/ContentPanel/ContentPanel';
import { AdminLinkRow } from '../../components/admin/AdminLinkRow/AdminLinkRow';
import { AdminLinkConfigPanel } from '../../components/admin/AdminLinkConfigPanel/AdminLinkConfigPanel';
import { getLink } from '../../api/admin';
import type { AdminLink } from '../../api/admin';
import '../Workspace/workspace.css';

const BREADCRUMB = [{ label: 'Liên kết', to: '/admin/links' }];

export function AdminLinkDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [link, setLink] = useState<AdminLink | null>(null);
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
          title={state === 'error' ? 'Không tìm thấy liên kết' : 'Đang tải…'}
        />
        {state === 'error' && <p className="link-list-empty">Liên kết này không tồn tại.</p>}
      </>
    );
  }

  return (
    <>
      <PageHeader breadcrumb={BREADCRUMB} title={link.title || 'Chưa có tiêu đề'} />
      <div className="page-content">
        <ContentPanel title="Liên kết đã rút gọn">
          <div className="link-list">
            <AdminLinkRow
              link={link}
              showViewDetail={false}
              onDeleted={() => navigate('/admin/links')}
            />
          </div>
        </ContentPanel>

        <AdminLinkConfigPanel link={link} onSaved={setLink} />
      </div>
    </>
  );
}
