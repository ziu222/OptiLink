import { FormSelect } from '../workspace/FormSelect/FormSelect';
import { LoadingCircle } from '../workspace/LoadingCircle/LoadingCircle';
import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';
import type { IBioPage, IBlock } from '../../types/bio';
import { uploadBioMedia } from '../../api/bio';
import { listLinks, type ShortenedLink } from '../../api/links';

interface TabLinksAndBlocksProps {
  bioData: IBioPage | null;
  setBioData: Dispatch<SetStateAction<IBioPage | null>>;
  handleAddBlock: (type: string) => void;
  handleDeleteBlock: (id: string) => void;
}

const BLOCK_LABEL: Record<string, string> = { LINK: 'Liên kết', TEXT: 'Văn bản', IMAGE: 'Hình ảnh' };

export function TabLinksAndBlocks({ bioData, setBioData, handleAddBlock, handleDeleteBlock }: TabLinksAndBlocksProps) {
  const [showAddMenu, setShowAddMenu] = useState(false);
  const [expandedBlockId, setExpandedBlockId] = useState<string | null>(null);
  const [savedLinks, setSavedLinks] = useState<ShortenedLink[]>([]);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const blocks = bioData?.blocks || [];

  useEffect(() => {
    let cancelled = false;
    listLinks({ limit: 100, status: 'active', sort: 'newest' })
      .then((result) => { if (!cancelled) setSavedLinks(result.links); })
      .catch(() => { /* A new account can build its first block without a library. */ });
    return () => { cancelled = true; };
  }, []);

  const updateBio = (patch: Partial<IBioPage>) => {
    setBioData(current => current ? { ...current, ...patch } : current);
  };

  const updateBlock = (id: string, content: Record<string, unknown>) => {
    if (!bioData) return;
    setBioData({ ...bioData, blocks: bioData.blocks.map((block) => block.id === id ? { ...block, content: { ...block.content, ...content } } : block) });
  };

  const selectLibraryLink = (block: IBlock, linkId: string) => {
    const link = savedLinks.find((item) => item.id === linkId);
    if (!link) return;
    updateBlock(block.id, { title: block.content?.title || link.title || 'Liên kết mới', url: link.originalUrl, clickUrl: link.shortUrl, shortLinkId: link.id });
  };

  const uploadAvatar = async (file: File | undefined) => {
    if (!file || !bioData) return;
    setUploading(true);
    setUploadError('');
    try { updateBio({ avatarUrl: await uploadBioMedia(file) }); }
    catch { setUploadError('Không thể tải ảnh lên. Hãy thử lại.'); }
    finally { setUploading(false); }
  };

  return <>
    <div className="builder-section-heading"><span>HỒ SƠ</span><h3>Thông tin hiển thị</h3><p>Đây là phần đầu tiên mọi người nhìn thấy trên Bio Page.</p></div>
    <section className="bio-profile-editor">
      {uploadError && <p className="bio-editor-field--wide" role="alert">{uploadError}</p>}
      <div className="bio-avatar-editor"><div className="bio-avatar-preview" style={{ backgroundImage: bioData?.avatarUrl ? `url('${bioData.avatarUrl}')` : undefined }}>{!bioData?.avatarUrl && (bioData?.title || 'O').charAt(0)}</div><label className="bio-media-upload"><span>{uploading ? <LoadingCircle inline label="Đang tải ảnh…" /> : 'Thay ảnh avatar'}</span><small>PNG, JPG hoặc WebP</small><input type="file" disabled={uploading} accept="image/png,image/jpeg,image/webp" onChange={(event) => void uploadAvatar(event.target.files?.[0])} /></label></div>
      <div className="bio-profile-fields"><label className="bio-editor-field"><span>Tên hiển thị</span><input type="text" value={bioData?.title || ''} placeholder="Tên của bạn hoặc thương hiệu" onChange={(event) => updateBio({ title: event.target.value })} /></label><label className="bio-editor-field"><span>Địa chỉ Bio Page</span><input type="text" value={bioData?.username || ''} placeholder="ten-cua-ban" onChange={(event) => updateBio({ username: event.target.value.toLowerCase().replace(/\s+/g, '-') })} /></label></div>
      <label className="bio-editor-field bio-editor-field--wide"><span>Giới thiệu ngắn</span><textarea value={bioData?.bio || ''} placeholder="Một câu giới thiệu ngắn, rõ ràng và đáng nhớ…" onChange={(event) => updateBio({ bio: event.target.value })} /></label>
      <fieldset className="bio-badge-field"><legend>Huy hiệu hiển thị</legend><p>Chọn những dấu mốc muốn hiện cạnh tên của bạn.</p><div className="bio-badge-options">
        <label className={`bio-badge-option${bioData?.badges?.early ? ' is-selected' : ''}`}><input type="checkbox" checked={bioData?.badges?.early ?? false} onChange={(event) => updateBio({ badges: { ...bioData?.badges, early: event.target.checked } })} /><span className="bio-badge-mark">E</span><span><strong>Early</strong><small>Thành viên từ sớm</small></span></label>
        <label className={`bio-badge-option${bioData?.badges?.pro ? ' is-selected' : ''}`}><input type="checkbox" checked={bioData?.badges?.pro ?? false} onChange={(event) => updateBio({ badges: { ...bioData?.badges, pro: event.target.checked } })} /><span className="bio-badge-mark">P</span><span><strong>Pro</strong><small>Không gian chuyên nghiệp</small></span></label>
      </div></fieldset>
    </section>

    <div className="builder-section-heading builder-section-heading--blocks"><span>NỘI DUNG</span><h3>Blocks trên Bio Page</h3><p>Mỗi link mới sẽ tự được lưu vào Link Library khi bạn Publish.</p></div>
    <div className="bio-block-list">
      {blocks.map((block) => <article className={`bio-edit-block${expandedBlockId === block.id ? ' is-open' : ''}`} key={block.id}>
        <button type="button" className="bio-edit-block-summary" onClick={() => setExpandedBlockId(expandedBlockId === block.id ? null : block.id)} aria-expanded={expandedBlockId === block.id}><span className="bio-edit-block-order">{String(block.order + 1).padStart(2, '0')}</span><span className="bio-edit-block-copy"><small>{BLOCK_LABEL[block.type] || block.type}</small><strong>{block.content?.title || block.content?.label || 'Khối chưa có tiêu đề'}</strong></span><span className="bio-edit-block-toggle">{expandedBlockId === block.id ? 'Thu gọn' : 'Chỉnh sửa'}</span></button>
        {expandedBlockId === block.id && <div className="bio-edit-block-body">
          <label className="bio-editor-field"><span>Tiêu đề</span><input type="text" value={block.content?.title || ''} placeholder="Đặt tên cho block" onChange={(event) => updateBlock(block.id, { title: event.target.value })} /></label>
          {block.type === 'LINK' && <><label className="bio-editor-field"><span>Dùng link đã lưu</span><FormSelect aria-label="Dùng link đã lưu" value={block.content?.shortLinkId || ''} onValueChange={(value) => selectLibraryLink(block, value)}><option value="">Chọn từ Link Library</option>{savedLinks.map((link) => <option key={link.id} value={link.id}>{link.title || 'Liên kết chưa đặt tên'} · {link.shortUrl}</option>)}</FormSelect></label><label className="bio-editor-field"><span>URL đích</span><input type="url" value={block.content?.url || ''} placeholder="https://…" onChange={(event) => updateBlock(block.id, { url: event.target.value, shortLinkId: undefined, clickUrl: undefined })} /><small>Nhập URL mới để tạo short link tự động lúc Publish.</small></label></>}
          {block.type === 'TEXT' && <label className="bio-editor-field"><span>Nội dung</span><textarea value={block.content?.text || ''} placeholder="Viết nội dung của bạn…" onChange={(event) => updateBlock(block.id, { text: event.target.value })} /></label>}
          {block.type === 'IMAGE' && <label className="bio-editor-field"><span>Ảnh</span><input type="url" value={block.content?.imageUrl || ''} placeholder="https://…" onChange={(event) => updateBlock(block.id, { imageUrl: event.target.value })} /></label>}
          <button type="button" className="bio-delete-block" onClick={() => handleDeleteBlock(block.id)}>Xóa block này</button>
        </div>}
      </article>)}
    </div>
    <div className="bio-add-block-wrap"><button type="button" className="bio-add-block" onClick={() => setShowAddMenu((current) => !current)} aria-expanded={showAddMenu}>Thêm block</button>{showAddMenu && <div className="bio-add-block-menu"><button type="button" onClick={() => { handleAddBlock('LINK'); setShowAddMenu(false); }}>Liên kết</button><button type="button" onClick={() => { handleAddBlock('TEXT'); setShowAddMenu(false); }}>Văn bản</button><button type="button" onClick={() => { handleAddBlock('IMAGE'); setShowAddMenu(false); }}>Hình ảnh</button></div>}</div>
  </>;
}
