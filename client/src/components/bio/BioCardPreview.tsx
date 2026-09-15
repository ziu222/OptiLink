import React from 'react';
import type { IBioPage, IThemeConfig } from '../../types/bio';
import { FallingEffect } from '../effects/FallingEffect';
import { extractGradientColors } from '../../utils/color';
import '../../pages/Builder/builder.css';
import '../../pages/Builder/builder-polish.css';

interface BioCardPreviewProps {
  bioData: IBioPage | null;
  themeConfig: IThemeConfig;
  motionPaused: boolean;
  allowMotion: boolean;
  /** Render LINK/PRODUCT_CARD blocks as real clickable links (public page). Defaults to
   * false for the owner's editor preview, which is intentionally inert. */
  interactive?: boolean;
  /** Owner-only overlay controls (fullscreen toggle, "LIVE PREVIEW" caption, motion
   * toggle) rendered inside the same positioned .preview-area container. */
  children?: React.ReactNode;
}

/**
 * Pure rendering of the bio card (avatar, badges, title, blocks) driven by
 * themeConfig. Shared by the owner's live preview (BuilderPage) and the
 * public bio page, so the two never drift apart.
 */
export const BioCardPreview: React.FC<BioCardPreviewProps> = ({
  bioData,
  themeConfig,
  motionPaused,
  allowMotion,
  interactive = false,
  children,
}) => {
  const { c1, c2 } = extractGradientColors(themeConfig.background.value || '');
  const bgType = themeConfig.background.type;

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
  const btnBg = themeConfig.buttonStyle?.backgroundColor;
  const btnTextColor = themeConfig.buttonStyle?.textColor;
  const effect = themeConfig.effect || 'none';
  const blocks = bioData?.blocks || [];

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
    '--btn-bg': btnBg,
    '--btn-text': btnTextColor,
    fontFamily,
  } as React.CSSProperties;

  const bgStyle = {
    '--bg-c1': c1,
    '--bg-c2': c2,
    '--bg-image': bgType === 'image' ? `url('${themeConfig.background.url || ''}')` : 'none',
    '--bg-avatar': `url('${themeConfig.background.url || bioData?.avatarUrl || ''}')`,
  } as React.CSSProperties;

  return (
    <div className={`preview-area bg-${bgType}`} style={bgStyle}>
      {bgType === 'video' && themeConfig.background.url && (
        <video className="preview-bg-video" src={themeConfig.background.url} autoPlay loop muted playsInline />
      )}
      <FallingEffect effect={effect} paused={motionPaused} allowMotion={allowMotion} />
      {children}

      <div
        className={`card-wrapper ${borderStyle === 'glow' ? 'border-glow' : ''} ${borderStyle === 'led' ? 'border-led' : ''}`}
        style={wrapperStyle}
      >
        <div className={`mock-bio-inner ${showBanner ? 'layout-banner-on' : 'layout-banner-off'}`} style={innerStyle}>
          {showBanner && (
            <div
              className="mock-hero-banner"
              style={{
                backgroundImage: `url('${themeConfig.heroBanner?.url || 'https://images.unsplash.com/photo-1616150143891-b3b320d36780?auto=format&fit=crop&w=500&q=80'}')`,
              }}
            />
          )}

          <div className="mock-avatar-wrapper">
            <div className={`mock-avatar-frame ${avatarFrame !== 'none' ? `frame-${avatarFrame}` : 'frame-none'}`} />
            <img src={bioData?.avatarUrl || 'https://i.pravatar.cc/150'} className="mock-avatar" alt="Avatar" />
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

          {blocks
            .filter((block) => !block.isHidden)
            .slice()
            .sort((a, b) => a.order - b.order)
            .map((block) => {
              if (block.type === 'TEXT') {
                return (
                  <p className="mock-text-block" key={block.id}>
                    {block.content?.text || block.content?.title}
                  </p>
                );
              }
              if (block.type === 'IMAGE') {
                return block.content?.imageUrl ? (
                  <img className="mock-image-block" key={block.id} src={block.content.imageUrl} alt={block.content?.title || ''} />
                ) : null;
              }
              if (block.type === 'LINK') {
                const label = block.content?.title || 'Chưa có tiêu đề';
                const href = block.content?.clickUrl || block.content?.url;
                return interactive && href ? (
                  <a key={block.id} href={href} target="_blank" rel="noopener noreferrer" className={`mock-link ${btnHover}`}>
                    {label}
                  </a>
                ) : (
                  <div key={block.id} className={`mock-link ${btnHover}`}>
                    {label}
                  </div>
                );
              }
              if (block.type === 'PRODUCT_CARD') {
                const inner = (
                  <>
                    <img
                      src={block.content?.imageUrl || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=150&q=80'}
                      alt={block.content?.title}
                    />
                    <div>
                      <div className="mock-product-title">{block.content?.title || 'Chưa có tiêu đề'}</div>
                      <div className="mock-product-price">{block.content?.price || '0đ'}</div>
                    </div>
                  </>
                );
                return interactive ? (
                  <a
                    key={block.id}
                    href={`/s/${block.content?.shortLinkId || block.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mock-product"
                  >
                    {inner}
                  </a>
                ) : (
                  <div key={block.id} className="mock-product">
                    {inner}
                  </div>
                );
              }
              return null;
            })}
        </div>
      </div>
    </div>
  );
};
