import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { LayoutRenderer } from '../../components/layouts/LayoutRenderer';
import { BlockEditor } from '../../components/builder/BlockEditor';
import './builder.css';

export const BuilderPage: React.FC = () => {
  const { bioData, setThemeConfig, themeConfig } = useTheme();

  if (!bioData) {
    return <div className="builder-loading">Đang tải dữ liệu...</div>;
  }

  const handleLayoutChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setThemeConfig({ ...themeConfig, layout: e.target.value as any });
  };

  const handleBackgroundUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Mock upload URL for real-time preview
      const url = URL.createObjectURL(file);
      setThemeConfig({ ...themeConfig, background: { type: 'image', url } });
    }
  };

  return (
    <div className="builder-layout">
      {/* Cột trái: Editor */}
      <div className="builder-sidebar">
        <div className="builder-header">
          <h2>OptiLink Builder</h2>
          <button className="btn-save">Lưu thay đổi</button>
        </div>
        
        <div className="builder-panel">
          <h3>Giao diện (Theme)</h3>
          <div className="control-group">
            <label>Chọn Layout</label>
            <select value={themeConfig.layout} onChange={handleLayoutChange}>
              <option value="overlap_center">Overlap Center (Beacons)</option>
              <option value="left_aligned">Left Aligned (Pro)</option>
              <option value="minimal_top">Minimal Top (Linktree)</option>
              <option value="split_screen">Split Screen (Desktop)</option>
              <option value="card_floating">Card Floating (Glassmorphism)</option>
            </select>
          </div>
          
          <div className="control-group">
            <label>Hình nền (Background)</label>
            <input type="file" accept="image/*" onChange={handleBackgroundUpload} />
          </div>
        </div>

        <div className="builder-panel">
          <h3>Quản lý Khối (Blocks)</h3>
          <BlockEditor />
        </div>
      </div>

      {/* Cột phải: Preview Real-time */}
      <div className="builder-preview-area">
        <div className="device-frame">
          <div className="device-screen">
             <LayoutRenderer />
          </div>
        </div>
      </div>
    </div>
  );
};
