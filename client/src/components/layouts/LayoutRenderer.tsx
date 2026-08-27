import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import './layouts.css';

// Component placeholders (Will be fully implemented in next steps)
const LayoutOverlap = () => <div className="layout-overlap"><h2>Layout Overlap Center</h2></div>;
const LayoutLeftAligned = () => <div className="layout-left-aligned"><h2>Layout Left Aligned</h2></div>;
const LayoutMinimal = () => <div className="layout-minimal"><h2>Layout Minimal Top</h2></div>;
const LayoutSplitScreen = () => <div className="layout-split-screen"><h2>Layout Split Screen</h2></div>;
const LayoutFloating = () => <div className="layout-floating"><h2>Layout Card Floating</h2></div>;

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
