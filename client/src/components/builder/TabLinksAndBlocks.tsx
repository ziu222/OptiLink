import type { IBioPage } from '../../types/bio';

interface TabLinksAndBlocksProps {
  bioData: IBioPage | null;
  setBioData: (data: IBioPage | null) => void;
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
            <div className="mock-avatar" style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#334155', backgroundImage: `url('${bioData?.avatarUrl || 'https://i.pinimg.com/736x/5c/41/50/5c41506bf405e3fbf21f062ef902e864.jpg'}')`, backgroundSize: 'cover', backgroundPosition: 'center' }}></div>
            <label style={{ display: 'inline-block', padding: '8px 16px', background: 'rgba(255,255,255,0.1)', borderRadius: '8px', fontSize: '12px', cursor: 'pointer' }}>
              Tải ảnh mới
              <input 
                type="file" 
                accept="image/*" 
                style={{ display: 'none' }} 
                onChange={(e) => {
                  if (e.target.files && e.target.files[0] && bioData) {
                    const url = URL.createObjectURL(e.target.files[0]);
                    setBioData({ ...bioData, avatarUrl: url });
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
          <label style={{ fontSize: '12px', color: '#94a3b8', fontWeight: 600 }}>Huy hiệu hiển thị</label>
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
