import React, { useState } from 'react';
import './builder.css';
import { Sidebar } from '../../components/workspace/Sidebar';
import { BuilderSidebar } from '../../components/builder/BuilderSidebar';
import { TabLinksAndBlocks } from '../../components/builder/TabLinksAndBlocks';
import { TabDesign } from '../../components/builder/TabDesign';
import { FallingEffect } from '../../components/effects/FallingEffect';
import { useTheme } from '../../contexts/ThemeContext';
import { saveBio } from '../../api/bio';
import { extractGradientColors } from '../../utils/color';

export function BuilderPage() {
  const { themeConfig, setThemeConfig, bioData, setBioData } = useTheme();
  const [activeTab, setActiveTab] = useState('tab-links');
  const [publishState, setPublishState] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [fullPreview, setFullPreview] = useState(false);

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

  const { c1, c2 } = extractGradientColors(themeConfig.background.value || '');
  const bgType = themeConfig.background.type;

  // Derived states for preview
  const showBanner = themeConfig.heroBanner?.enabled ?? true;
  const cardBg = themeConfig.cardStyling?.background || '#16181d';
  const borderStyle = themeConfig.cardStyling?.borderStyle || 'none';
  const borderColor = themeConfig.cardStyling?.borderColor || '#ff007f';
  const borderColor2 = themeConfig.cardStyling?.borderColor2 || '#00fff0';
  const borderThickness = themeConfig.cardStyling?.borderThickness || '2px';
  const borderRadius = themeConfig.cardStyling?.borderRadius || '40px';
  const fontFamily = themeConfig.fontFamily || "'Inter', sans-serif";
  const textColor = themeConfig.textColor || '#ffffff';
  const avatarFrame = themeConfig.profile?.avatarFrame || 'neon';
  const btnShape = themeConfig.buttonStyle?.borderRadius || '12px';
  const btnHover = themeConfig.buttonStyle?.hoverEffect || 'hover-color';
  const effect = themeConfig.effect || 'none';

  // Temporary local state for blocks (until we connect drag and drop to bioData)
  const blocks = bioData?.blocks || [];
  
  const handleAddBlock = (type: string = 'LINK') => {
    if (bioData) {
      let initialContent = {};
      if (type === 'LINK') initialContent = { title: '🔗 Liên kết mới', url: '' };
      if (type === 'TEXT') initialContent = { title: '📝 Khối văn bản', text: '' };
      if (type === 'IMAGE') initialContent = { title: '🖼️ Hình ảnh', imageUrl: '' };
      
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

  const wrapperStyle = {
    '--card-bg': cardBg === 'glass' ? 'rgba(255,255,255,0.3)' : cardBg,
    '--card-backdrop': cardBg === 'glass' ? 'blur(25px)' : 'none',
    '--card-border-style': borderStyle === 'glow' || borderStyle === 'led' ? 'solid' : borderStyle,
    '--card-border-color': borderColor,
    '--card-border-thickness': borderThickness,
    '--card-border-radius': borderRadius,
    '--led-c1': borderColor,
    '--led-c2': borderColor2,
  } as React.CSSProperties;

  const innerStyle = {
    '--text-main': textColor,
    '--btn-radius': btnShape,
    fontFamily: fontFamily,
  } as React.CSSProperties;

  const bgStyle = {
    '--bg-c1': c1,
    '--bg-c2': c2,
    '--bg-image': bgType === 'image' ? `url('${themeConfig.background.url || ''}')` : 'none',
    '--bg-avatar': `url('${themeConfig.background.url || bioData?.avatarUrl || ''}')`,
  } as React.CSSProperties;

  return (
    <div className={`builder-layout${fullPreview ? ' is-full-preview' : ''}`}>
      {!fullPreview && (
        <>
          {/* 1. APP NAV (shared with the rest of OptiLink) + BIO PAGE SUB-NAV */}
          <Sidebar />
          <BuilderSidebar activeTab={activeTab} setActiveTab={setActiveTab} />

          {/* 2. EDITOR PANEL */}
          <div className="editor-panel">
            <div className="header">
              <h2>{activeTab === 'tab-links' ? 'Links & Blocks' : activeTab === 'tab-design' ? 'Appearance (Design)' : 'Analytics'}</h2>
              <button className="btn-save" onClick={handlePublish} disabled={publishState === 'saving'}>
                {publishState === 'saving' ? 'Đang lưu...' : publishState === 'saved' ? 'Đã lưu ✓' : publishState === 'error' ? 'Lỗi, thử lại' : 'Publish'}
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
      <div className={`preview-area bg-${bgType}`} style={bgStyle}>
        {bgType === 'video' && themeConfig.background.url && (
          <video
            className="preview-bg-video"
            src={themeConfig.background.url}
            autoPlay
            loop
            muted
            playsInline
          />
        )}
        <button
          type="button"
          className="preview-toggle-btn"
          onClick={() => setFullPreview((v) => !v)}
          title={fullPreview ? 'Thoát xem toàn màn hình' : 'Xem toàn màn hình'}
        >
          {fullPreview ? (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 9L4 4m0 0v4m0-4h4m7 5l5-5m0 0v4m0-4h-4M9 15l-5 5m0 0v-4m0 4h4m7-5l5 5m0 0v-4m0 4h-4"/></svg>
          ) : (
            <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4"/></svg>
          )}
        </button>
        <FallingEffect effect={effect} />

        <div className={`card-wrapper ${borderStyle === 'glow' ? 'border-glow' : ''} ${borderStyle === 'led' ? 'border-led' : ''}`} style={wrapperStyle}>
          <div className={`mock-bio-inner ${showBanner ? 'layout-banner-on' : 'layout-banner-off'}`} style={innerStyle}>
            
            {showBanner && (
              <div 
                className="mock-hero-banner" 
                style={{backgroundImage: `url('${themeConfig.heroBanner?.url || 'https://images.unsplash.com/photo-1616150143891-b3b320d36780?auto=format&fit=crop&w=500&q=80'}')`}}
              ></div>
            )}

            <div className="mock-avatar-wrapper">
              <div className={`mock-avatar-frame ${avatarFrame !== 'none' ? `frame-${avatarFrame}` : 'frame-none'}`}></div>
              <img src={bioData?.avatarUrl || "https://i.pravatar.cc/150"} className="mock-avatar" alt="Avatar" />
            </div>
            
            {(bioData?.badges?.early || bioData?.badges?.pro) && (
              <div className="mock-badges">
                {bioData?.badges?.early && <div className="mock-badge">Early</div>}
                {bioData?.badges?.pro && <div className="mock-badge">PRO</div>}
              </div>
            )}

            <h1 className="mock-title">{bioData?.title || 'Tên hiển thị'}</h1>
            {bioData?.username && <p className="mock-username">@{bioData.username}</p>}
            <p className="mock-bio-text">{bioData?.bio || 'Mô tả ngắn của bạn...'}</p>
            
            {blocks.map(block => {
              if (block.type === 'LINK') {
                return (
                  <div key={block.id} className={`mock-link ${btnHover}`}>{block.content?.title || 'Chưa có tiêu đề'}</div>
                );
              }
              if (block.type === 'PRODUCT_CARD') {
                return (
                  <div key={block.id} className="mock-product">
                    <img src={block.content?.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=80'} alt={block.content?.title} />
                    <div>
                      <div className="mock-product-title">{block.content?.title || 'Chưa có tiêu đề'}</div>
                      <div className="mock-product-price">{block.content?.price || '0đ'}</div>
                    </div>
                  </div>
                );
              }
              return null;
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
