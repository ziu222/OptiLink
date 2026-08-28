import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './layouts.css';

import { BioProfile } from '../bio/BioProfile';
import { BioBlocks } from '../bio/BioBlocks';

const LayoutOverlap = () => {
  const { bioData } = useTheme();
  if (!bioData) return null;
  return (
    <div className="layout-overlap-center">
      <div className="hero-banner" style={{ backgroundImage: `url(${bioData.themeConfig.background.url})` }} />
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
      <div className="split-left" style={{ backgroundImage: `url(${bioData.themeConfig.background.url})`, backgroundSize: 'cover' }}>
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

export const LayoutRenderer: React.FC = () => {
  const { themeConfig } = useTheme();

  // Chọn Layout dựa trên config
  switch (themeConfig.layout) {
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
