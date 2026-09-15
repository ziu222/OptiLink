import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { BioCardPreview } from '../components/bio/BioCardPreview';
import { getBioByUsername } from '../api/bio';
import type { IBioPage } from '../types/bio';
import '../pages/Builder/builder.css';
import '../pages/Builder/builder-polish.css';
import '../routes/routeStatus.css';

type FetchState = 'loading' | 'ready' | 'not-found' | 'error';

export function PublicBioPage() {
  const { username } = useParams<{ username: string }>();
  const [bioData, setBioData] = useState<IBioPage | null>(null);
  const [state, setState] = useState<FetchState>('loading');
  const [motionPaused, setMotionPaused] = useState(
    () => matchMedia('(prefers-reduced-motion: reduce)').matches,
  );
  const [allowMotion, setAllowMotion] = useState(false);

  useEffect(() => {
    if (!username) return;
    let cancelled = false;
    setState('loading');
    getBioByUsername(username)
      .then((bio) => {
        if (cancelled) return;
        if (!bio) {
          setState('not-found');
          return;
        }
        setBioData(bio);
        setState('ready');
      })
      .catch(() => {
        if (!cancelled) setState('error');
      });
    return () => {
      cancelled = true;
    };
  }, [username]);

  useEffect(() => {
    document.title = bioData?.title ? `${bioData.title} · OptiLink` : 'OptiLink';
  }, [bioData]);

  if (state === 'loading') {
    return <div className="route-status">Đang tải…</div>;
  }

  if (state === 'not-found') {
    return (
      <div className="route-status">
        Không tìm thấy trang bio <strong>@{username}</strong>.
      </div>
    );
  }

  if (state === 'error') {
    return <div className="route-status">Không thể tải trang bio. Vui lòng thử lại.</div>;
  }

  return (
    <div className="builder-layout is-full-preview">
      <BioCardPreview
        bioData={bioData}
        themeConfig={bioData!.themeConfig}
        motionPaused={motionPaused}
        allowMotion={allowMotion}
        interactive
      >
        <button
          type="button"
          className="bio-motion-toggle"
          aria-pressed={!motionPaused}
          onClick={() => {
            setMotionPaused(!motionPaused);
            if (motionPaused) setAllowMotion(true);
          }}
        >
          {motionPaused ? 'Bật chuyển động' : 'Tạm dừng chuyển động'}
        </button>
      </BioCardPreview>
    </div>
  );
}
