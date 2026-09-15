import { LoadingCircle } from '../../components/workspace/LoadingCircle/LoadingCircle';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import './builder.css';
import './builder-polish.css';
import { Sidebar } from '../../components/workspace/Sidebar/Sidebar';
import { BuilderSidebar } from '../../components/builder/BuilderSidebar';
import { TabLinksAndBlocks } from '../../components/builder/TabLinksAndBlocks';
import { TabDesign } from '../../components/builder/TabDesign';
import { BioCardPreview } from '../../components/bio/BioCardPreview';
import { useTheme } from '../../contexts/ThemeContext';
import { saveBio } from '../../api/bio';

export function BuilderPage() {
  const { themeConfig, setThemeConfig, bioData, setBioData } = useTheme();
  const [activeTab, setActiveTab] = useState('tab-links');
  const [publishState, setPublishState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [fullPreview, setFullPreview] = useState(false);
  const [motionPaused, setMotionPaused] = useState(false);
  const [allowMotion, setAllowMotion] = useState(false);
  const [reducedMotion, setReducedMotion] = useState(() => matchMedia('(prefers-reduced-motion: reduce)').matches);
  useEffect(() => {
    const query = matchMedia('(prefers-reduced-motion: reduce)');
    const sync = () => { setReducedMotion(query.matches); setAllowMotion(false); };
    query.addEventListener('change', sync);
    return () => query.removeEventListener('change', sync);
  }, []);
  const motionStopped = motionPaused || (reducedMotion && !allowMotion);

  const handlePublish = async () => {
    if (!bioData) return;
    setPublishState('saving');
    try {
      const saved = await saveBio({ ...bioData, themeConfig });
      setBioData(saved);
      setPublishState('saved');
      setTimeout(() => setPublishState('idle'), 2000);
    } catch (err) {
      console.error('Publish failed', err);
      setPublishState('error');
    }
  };

  // Temporary local state for blocks (until we connect drag and drop to bioData)
  const blocks = bioData?.blocks || [];
  
  const handleAddBlock = (type: string = 'LINK') => {
    if (bioData) {
      let initialContent = {};
      if (type === 'LINK') initialContent = { title: 'Liên kết mới', url: '' };
      if (type === 'TEXT') initialContent = { title: 'Khối văn bản', text: '' };
      if (type === 'IMAGE') initialContent = { title: 'Hình ảnh', imageUrl: '' };
      
      setBioData({
        ...bioData,
        blocks: [...blocks, { 
          id: Date.now().toString(), 
          type, 
          isHidden: false, 
          order: blocks.length, 
          content: initialContent 
        } as any]
      });
    }
  };

  const handleDeleteBlock = (id: string) => {
    if (bioData) {
      setBioData({
        ...bioData,
        blocks: blocks.filter(b => b.id !== id)
      });
    }
  };

  return (
    <div className={`builder-layout${fullPreview ? ' is-full-preview' : ''}`} data-motion-paused={motionPaused}>
      {!fullPreview && (
        <>
          {/* 1. APP NAV (shared with the rest of OptiLink) + BIO PAGE SUB-NAV */}
          <Sidebar />
          <Link to="/dashboard" className="builder-back-link">← Dashboard</Link>
          <BuilderSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* 2. EDITOR PANEL */}
          <div className="editor-panel">
            <div className="header">
              <h2>{activeTab === 'tab-links' ? 'Links & Blocks' : activeTab === 'tab-design' ? 'Appearance (Design)' : 'Analytics'}</h2>
              <button className="btn-save" onClick={handlePublish} disabled={publishState === 'saving'}>
                {publishState === 'saving' ? <LoadingCircle inline label="Đang lưu…" /> : publishState === 'saved' ? 'Đã lưu ✓' : publishState === 'error' ? 'Lỗi, thử lại' : 'Publish'}
              </button>
            </div>

            <div className="content-area">
              {/* TAB 1: LINKS & BLOCKS */}
              <div className={`tab-content ${activeTab === 'tab-links' ? 'active' : ''}`}>
                <TabLinksAndBlocks
                  bioData={bioData}
                  setBioData={setBioData}
                  handleAddBlock={handleAddBlock}
                  handleDeleteBlock={handleDeleteBlock}
                />
              </div>

              {/* TAB 2: DESIGN */}
              <div className={`tab-content ${activeTab === 'tab-design' ? 'active' : ''}`}>
                <TabDesign
                  themeConfig={themeConfig}
                  setThemeConfig={setThemeConfig}
                />
              </div>

              {/* TAB 3: ANALYTICS */}
              <div className={`tab-content ${activeTab === 'tab-analytics' ? 'active' : ''}`}>
                 <h3 className="section-title">Analytics (Coming Soon)</h3>
                 <p style={{color: 'var(--text)', fontSize: '14px'}}>Tính năng thống kê sẽ được phát triển sau.</p>
              </div>
            </div>
          </div>
        </>
      )}

      {/* 3. PREVIEW AREA */}
      <BioCardPreview bioData={bioData} themeConfig={themeConfig} motionPaused={motionStopped} allowMotion={allowMotion}>
        <button
          type="button"
          className="preview-toggle-btn"
          onClick={() => setFullPreview((v) => !v)}
          title={fullPreview ? 'Thoát xem toàn màn hình' : 'Xem toàn màn hình'}
        >
          {fullPreview ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4m0 0v4m0-4h4m7 5l5-5m0 0v4m0-4h-4M9 15l-5 5m0 0v-4m0 4h4m7-5l5 5m0 0v-4m0 4h-4"/></svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
          )}
        </button>
        <div className="preview-caption">LIVE PREVIEW</div>
        <button type="button" className="bio-motion-toggle" aria-pressed={!motionStopped} onClick={() => { setMotionPaused(!motionStopped); if (motionStopped) setAllowMotion(true); }}>
          {motionStopped ? 'Bật chuyển động' : 'Tạm dừng chuyển động'}
        </button>
      </BioCardPreview>
    </div>
  );
}
