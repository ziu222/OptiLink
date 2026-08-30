import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './layouts.css';

import { BioProfile } from '../bio/BioProfile';
import { BioBlocks } from '../bio/BioBlocks';
import { FallingEffect } from '../effects/FallingEffect';
import { extractGradientColors } from '../../utils/color';

const LayoutOverlap = () => {
  const { bioData } = useTheme();
  if (!bioData) return null;
  return (
    <div className="layout-overlap-center">
      <div className="hero-banner" style={{ backgroundImage: `url(${bioData.themeConfig.heroBanner?.url || ''})` }} />
      <div className="profile-section">
        <BioProfile bioData={bioData} />
      </div>
      <BioBlocks blocks={bioData.blocks} />
    </div>
  );
};

const LayoutLeftAligned = () => {
  const { bioData } = useTheme();
  if (!bioData) return null;
  return (
    <div className="layout-left-aligned">
      <div className="profile-section">
        <BioProfile bioData={bioData} />
      </div>
      <BioBlocks blocks={bioData.blocks} />
    </div>
  );
};

const LayoutMinimal = () => {
  const { bioData } = useTheme();
  if (!bioData) return null;
  return (
    <div className="layout-minimal-top">
      <BioProfile bioData={bioData} />
      <BioBlocks blocks={bioData.blocks} />
    </div>
  );
};

const LayoutSplitScreen = () => {
  const { bioData } = useTheme();
  if (!bioData) return null;
  return (
    <div className="layout-split-screen">
      <div className="split-left" style={{ backgroundImage: `url(${bioData.themeConfig.heroBanner?.url || ''})`, backgroundSize: 'cover' }}>
        <BioProfile bioData={bioData} />
      </div>
      <div className="split-right">
        <BioBlocks blocks={bioData.blocks} />
      </div>
    </div>
  );
};

const LayoutFloating = () => {
  const { bioData } = useTheme();
  if (!bioData) return null;
  return (
    <div className="layout-card-floating">
      <div className="glass-card">
        <BioProfile bioData={bioData} />
        <BioBlocks blocks={bioData.blocks} />
      </div>
    </div>
  );
};

const renderLayout = (layout: string | undefined) => {
  switch (layout) {
    case 'left_aligned':
      return <LayoutLeftAligned />;
    case 'minimal_top':
      return <LayoutMinimal />;
    case 'split_screen':
      return <LayoutSplitScreen />;
    case 'card_floating':
      return <LayoutFloating />;
    case 'overlap_center':
    default:
      return <LayoutOverlap />;
  }
};

export const LayoutRenderer: React.FC = () => {
  const { themeConfig, bioData } = useTheme();
  const { c1, c2 } = extractGradientColors(themeConfig.background.value || '');
  const bgType = themeConfig.background.type;

  const bgStyle = {
    position: 'relative',
    width: '100%',
    '--bg-c1': c1,
    '--bg-c2': c2,
    '--bg-image': bgType === 'image' ? `url('${themeConfig.background.url || ''}')` : 'none',
    '--bg-avatar': `url('${themeConfig.background.url || bioData?.avatarUrl || ''}')`,
  } as React.CSSProperties;

  return (
    <div className={`layout-bg bg-${bgType}`} style={bgStyle}>
      {bgType === 'video' && themeConfig.background.url && (
        <video className="layout-bg-video" src={themeConfig.background.url} autoPlay loop muted playsInline />
      )}
      <FallingEffect effect={themeConfig.effect} />
      {renderLayout(themeConfig.layout)}
    </div>
  );
};
