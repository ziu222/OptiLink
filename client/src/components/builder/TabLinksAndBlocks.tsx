import React from 'react';
import type { IBioPage } from '../../types/bio';
import { uploadBioMedia } from '../../api/bio';

interface TabLinksAndBlocksProps {
  bioData: IBioPage | null;
  setBioData: React.Dispatch<React.SetStateAction<IBioPage | null>>;
  handleAddLink: () => void;
  handleDeleteBlock: (id: string) => void;
}

export function TabLinksAndBlocks({ bioData, setBioData, handleAddLink, handleDeleteBlock }: TabLinksAndBlocksProps) {
  const blocks = bioData?.blocks || [];
  return (
    <>
      <h3 className="section-title">Hồ sơ cá nhân (Profile)</h3>
      <div className="card profile-card" style={{ padding: '16px' }}>
        <div className="profile-header-edit">
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div className="mock-avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', background: 'var(--code-bg)', backgroundImage: `url('${bioData?.avatarUrl || 'https://i.pinimg.com/736x/5c/41/50/5c41506bf405e3fbf21f062ef902e864.jpg'}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
            <label style={{ display: 'inline-block', padding: '8px 16px', background: 'var(--code-bg)', borderRadius: '8px', fontSize: '12px', cursor: 'pointer', color: 'var(--text-h)', border: '1px solid var(--border)' }}>
              Tải ảnh mới
              <input 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file || !bioData) return;
                  const previewUrl = URL.createObjectURL(file);
                  setBioData({ ...bioData, avatarUrl: previewUrl });
                  try {
                    const url = await uploadBioMedia(file);
                    setBioData((prev) => (prev ? { ...prev, avatarUrl: url } : prev));
                  } catch (err) {
                    console.error('Avatar upload failed', err);
                  }
                }}
              />
            </label>
          </div>
          <div className="profile-inputs">
            <input type="text" defaultValue="Phù Sinh Nhược Mộng" placeholder="Tên hiển thị" />
            <input type="text" defaultValue="@lucvu.1147" placeholder="Username (Tùy chọn)" />
          </div>
        </div>
        <div className="bio-editor-group">
          <div className="rich-text-toolbar">
            <button className="toolbar-btn">B</button>
            <button className="toolbar-btn">I</button>
            <button className="toolbar-btn">Spoiler</button>
          </div>
          <textarea className="bio-textarea" defaultValue="Góc Review & Mua sắm hàng mới về. Markdown **được hỗ trợ**! Nhấn vào [Spoiler]" placeholder="Viết giới thiệu ngắn..."></textarea>
        </div>
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 600 }}>Huy hiệu hiển thị</label>
          <div className="badges-selector">
            <label className="badge-check"><input type="checkbox" defaultChecked /> 🦅 Early</label>
            <label className="badge-check"><input type="checkbox" defaultChecked /> 💎 PRO</label>
          </div>
        </div>
      </div>

      <h3 className="section-title">Nội dung (Blocks)</h3>
      <div className="block-list">
        {blocks.map((block: any) => (
          <div key={block.id} className="block-item">
            <div className="block-header">
              <div className="drag-icon">⋮⋮</div>
              <div className="block-info">
                <span className="block-type">{block.type}</span>
                <div className="block-name">{block.content?.title || 'Chưa có tiêu đề'}</div>
              </div>
              <div className="block-actions">
                <button onClick={() => handleDeleteBlock(block.id)} title="Xóa block">✕</button>
              </div>
            </div>
          </div>
        ))}
        <button className="btn-add" onClick={handleAddLink}>+ Thêm Liên Kết (Link)</button>
      </div>
    </>
  );
}
