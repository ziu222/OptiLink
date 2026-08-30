import React from 'react';
import type { IBioPage } from '../../types/bio';
import { uploadBioMedia } from '../../api/bio';

interface TabLinksAndBlocksProps {
  bioData: IBioPage | null;
  setBioData: React.Dispatch<React.SetStateAction<IBioPage | null>>;
  handleAddBlock: (type: string) => void;
  handleDeleteBlock: (id: string) => void;
}

export function TabLinksAndBlocks({ bioData, setBioData, handleAddBlock, handleDeleteBlock }: TabLinksAndBlocksProps) {
  const [showAddMenu, setShowAddMenu] = React.useState(false);
  const [expandedBlockId, setExpandedBlockId] = React.useState<string | null>(null);

  const blocks = bioData?.blocks || [];

  const updateBlockTitle = (id: string, title: string) => {
    if (!bioData) return;
    setBioData({
      ...bioData,
      blocks: bioData.blocks.map((b) => (b.id === id ? { ...b, content: { ...b.content, title } } : b)),
    });
  };

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
            <input
              type="text"
              value={bioData?.title || ''}
              placeholder="Tên hiển thị"
              onChange={(e) => bioData && setBioData({ ...bioData, title: e.target.value })}
            />
            <input
              type="text"
              value={bioData?.username || ''}
              placeholder="Username (Tùy chọn)"
              onChange={(e) => bioData && setBioData({ ...bioData, username: e.target.value })}
            />
          </div>
        </div>
        <div className="bio-editor-group">
          <div className="rich-text-toolbar">
            <button className="toolbar-btn">B</button>
            <button className="toolbar-btn">I</button>
            <button className="toolbar-btn">Spoiler</button>
          </div>
          <textarea
            className="bio-textarea"
            value={bioData?.bio || ''}
            placeholder="Viết giới thiệu ngắn..."
            onChange={(e) => bioData && setBioData({ ...bioData, bio: e.target.value })}
          ></textarea>
        </div>
        <div>
          <label style={{ fontSize: '12px', color: 'var(--text)', fontWeight: 600 }}>Huy hiệu hiển thị</label>
          <div className="badges-selector">
            <label className="badge-check">
              <input
                type="checkbox"
                checked={bioData?.badges?.early ?? false}
                onChange={(e) => bioData && setBioData({ ...bioData, badges: { ...bioData.badges, early: e.target.checked } })}
              /> Early
            </label>
            <label className="badge-check">
              <input
                type="checkbox"
                checked={bioData?.badges?.pro ?? false}
                onChange={(e) => bioData && setBioData({ ...bioData, badges: { ...bioData.badges, pro: e.target.checked } })}
              /> PRO
            </label>
          </div>
        </div>
      </div>

      <h3 className="section-title">Nội dung (Blocks)</h3>
      <div className="block-list">
        {blocks.map((block: any) => (
          <div key={block.id} className="block-item" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
            <div className="block-header" style={{ display: 'flex', width: '100%', alignItems: 'center' }}>
              <div className="drag-icon">⋮⋮</div>
              <div className="block-info" style={{ flex: 1, display: 'flex', gap: '8px', alignItems: 'center' }}>
                <span className="block-type" style={{ padding: '4px 8px', background: 'var(--code-bg)', borderRadius: '4px', fontSize: '11px' }}>{block.type}</span>
                <span style={{ fontSize: '14px', fontWeight: 500, flex: 1 }}>{block.content?.title || 'Chưa có tiêu đề'}</span>
              </div>
              <div className="block-actions" style={{ display: 'flex', gap: '8px' }}>
                <button onClick={() => setExpandedBlockId(expandedBlockId === block.id ? null : block.id)} style={{ padding: '4px 8px', background: 'var(--primary)', color: 'white', borderRadius: '4px', border: 'none', cursor: 'pointer' }}>
                  {expandedBlockId === block.id ? 'Thu gọn' : 'Sửa'}
                </button>
                <button onClick={() => handleDeleteBlock(block.id)} title="Xóa block" style={{ padding: '4px 8px', background: 'transparent', border: '1px solid var(--border)', borderRadius: '4px', cursor: 'pointer', color: 'var(--text-h)' }}>✕</button>
              </div>
            </div>
            
            {expandedBlockId === block.id && (
              <div className="block-editor-inline" style={{ marginTop: '12px', padding: '12px', background: 'var(--bg)', borderRadius: '8px', border: '1px solid var(--border)' }}>
                <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Tiêu đề</label>
                <input
                  type="text"
                  value={block.content?.title || ''}
                  placeholder="Tiêu đề khối"
                  style={{ width: '100%', marginBottom: '12px', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text)' }}
                  onChange={(e) => updateBlockTitle(block.id, e.target.value)}
                />
                
                {block.type === 'LINK' && (
                  <>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>URL đích</label>
                    <input
                      type="url"
                      value={block.content?.url || ''}
                      placeholder="https://..."
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text)' }}
                      onChange={(e) => {
                        if (!bioData) return;
                        setBioData({
                          ...bioData,
                          blocks: bioData.blocks.map((b) => (b.id === block.id ? { ...b, content: { ...b.content, url: e.target.value } } : b)),
                        });
                      }}
                    />
                  </>
                )}

                {block.type === 'TEXT' && (
                  <>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>Nội dung văn bản</label>
                    <textarea
                      value={block.content?.text || ''}
                      placeholder="Nhập nội dung..."
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text)', minHeight: '80px' }}
                      onChange={(e) => {
                        if (!bioData) return;
                        setBioData({
                          ...bioData,
                          blocks: bioData.blocks.map((b) => (b.id === block.id ? { ...b, content: { ...b.content, text: e.target.value } } : b)),
                        });
                      }}
                    ></textarea>
                  </>
                )}

                {block.type === 'IMAGE' && (
                  <>
                    <label style={{ display: 'block', fontSize: '12px', marginBottom: '4px' }}>URL Hình ảnh</label>
                    <input
                      type="url"
                      value={block.content?.imageUrl || ''}
                      placeholder="https://..."
                      style={{ width: '100%', padding: '8px', borderRadius: '4px', border: '1px solid var(--border)', background: 'var(--code-bg)', color: 'var(--text)', marginBottom: '8px' }}
                      onChange={(e) => {
                        if (!bioData) return;
                        setBioData({
                          ...bioData,
                          blocks: bioData.blocks.map((b) => (b.id === block.id ? { ...b, content: { ...b.content, imageUrl: e.target.value } } : b)),
                        });
                      }}
                    />
                    {block.content?.imageUrl && <img src={block.content.imageUrl} alt="preview" style={{ maxWidth: '100%', maxHeight: '150px', borderRadius: '8px' }} />}
                  </>
                )}
              </div>
            )}
          </div>
        ))}
        
        <div style={{ position: 'relative', marginTop: '16px' }}>
          <button className="btn-add" onClick={() => setShowAddMenu(!showAddMenu)} style={{ width: '100%', padding: '12px', background: 'var(--primary)', color: 'white', borderRadius: '8px', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            + Thêm Khối Mới
          </button>
          
          {showAddMenu && (
            <div style={{ position: 'absolute', bottom: '100%', left: 0, right: 0, background: 'var(--card-bg)', border: '1px solid var(--border)', borderRadius: '8px', padding: '8px', marginBottom: '8px', display: 'flex', flexDirection: 'column', gap: '4px', zIndex: 10, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
              <button onClick={() => { handleAddBlock('LINK'); setShowAddMenu(false); }} style={{ padding: '8px 12px', background: 'transparent', border: 'none', color: 'var(--text-h)', textAlign: 'left', cursor: 'pointer', borderRadius: '4px' }}>🔗 Link (Liên kết)</button>
              <button onClick={() => { handleAddBlock('TEXT'); setShowAddMenu(false); }} style={{ padding: '8px 12px', background: 'transparent', border: 'none', color: 'var(--text-h)', textAlign: 'left', cursor: 'pointer', borderRadius: '4px' }}>📝 Text (Văn bản)</button>
              <button onClick={() => { handleAddBlock('IMAGE'); setShowAddMenu(false); }} style={{ padding: '8px 12px', background: 'transparent', border: 'none', color: 'var(--text-h)', textAlign: 'left', cursor: 'pointer', borderRadius: '4px' }}>🖼️ Image (Hình ảnh)</button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
