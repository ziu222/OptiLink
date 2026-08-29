import React from 'react';
import type { IThemeConfig } from '../../types/bio';

interface TabDesignProps {
  themeConfig: IThemeConfig;
  setThemeConfig: React.Dispatch<React.SetStateAction<IThemeConfig>>;
}

export function TabDesign({ themeConfig, setThemeConfig }: TabDesignProps) {
  // Helpers for extracting c1 and c2 from linear-gradient(135deg, c1, c2)
  const extractColors = (gradient: string) => {
    const match = gradient.match(/linear-gradient\([^,]+,\s*(#[a-f0-9]+|\w+),\s*(#[a-f0-9]+|\w+)\)/i);
    return match ? { c1: match[1], c2: match[2] } : { c1: '#0f1115', c2: '#16181d' };
  };

  const { c1, c2 } = extractColors(themeConfig.background.value || '');

  const handleUpdate = (updates: Partial<IThemeConfig>) => {
    setThemeConfig(prev => ({ ...prev, ...updates }));
  };

  const handlePresetChange = (v: string) => {
    if (v === 'anime') {
      handleUpdate({
        preset: v,
        background: { type: 'gradient', value: 'linear-gradient(135deg, #FFB7B2, #B5EAD7)' },
        heroBanner: { ...themeConfig.heroBanner, enabled: false },
        cardStyling: { background: 'glass', borderStyle: 'none', borderRadius: '40px' },
        profile: { ...themeConfig.profile, avatarFrame: 'none' },
        fontFamily: "'Outfit', sans-serif",
        textColor: '#555555',
        buttonStyle: { ...themeConfig.buttonStyle, hoverEffect: 'hover-scale', borderRadius: '30px' }
      });
    } else if (v === 'discord') {
      handleUpdate({
        preset: v,
        background: { type: 'gradient', value: 'linear-gradient(135deg, #1a1a2e, #5865F2)' },
        heroBanner: { ...themeConfig.heroBanner, enabled: true },
        cardStyling: { background: '#1e2124', borderStyle: 'none', borderRadius: '16px' },
        profile: { ...themeConfig.profile, avatarFrame: 'discord' },
        fontFamily: "'Inter', sans-serif",
        textColor: '#ffffff',
        buttonStyle: { ...themeConfig.buttonStyle, hoverEffect: 'hover-color', borderRadius: '12px' }
      });
    } else {
      handleUpdate({
        preset: 'commerce',
        background: { type: 'gradient', value: 'linear-gradient(135deg, #0f1115, #16181d)' },
        heroBanner: { ...themeConfig.heroBanner, enabled: true },
        cardStyling: { background: '#16181d', borderStyle: 'none', borderRadius: '40px' },
        profile: { ...themeConfig.profile, avatarFrame: 'neon' },
        fontFamily: "'Inter', sans-serif",
        textColor: '#ffffff',
        buttonStyle: { ...themeConfig.buttonStyle, hoverEffect: 'hover-color', borderRadius: '12px' }
      });
    }
  };

  return (
    <>
      <h3 className="section-title">Templates (Giao diện cài sẵn)</h3>
      <div className="card" style={{ marginBottom: '16px' }}>
        <select style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'rgba(15, 23, 42, 0.5)', color: 'white', border: '1px solid rgba(255,255,255,0.1)' }} value={themeConfig.preset} onChange={(e) => handlePresetChange(e.target.value)}>
          <option value="commerce">Mặc định: Storefront (Thương mại)</option>
          <option value="anime">Anime Pastel (Thẻ kính)</option>
          <option value="discord">Discord Gamer</option>
        </select>
      </div>

      <h3 className="section-title">Bố cục & Nền (Layout & BG)</h3>
      <div className="card">
        <div className="input-group">
          <label>Nền toàn trang (Gradient/Solid)</label>
          <div style={{ display: 'flex', gap: '10px', marginBottom: '8px' }}>
            <input type="color" value={c1} onChange={(e) => handleUpdate({ background: { type: 'gradient', value: `linear-gradient(135deg, ${e.target.value}, ${c2})` } })} />
            <input type="color" value={c2} onChange={(e) => handleUpdate({ background: { type: 'gradient', value: `linear-gradient(135deg, ${c1}, ${e.target.value})` } })} />
          </div>
        </div>
        <div className="input-group">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <label style={{ margin: 0 }}>Ảnh bìa ngang (Hero Banner) 🖼️</label>
            <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
              <input type="checkbox" checked={themeConfig.heroBanner?.enabled} onChange={(e) => handleUpdate({ heroBanner: { ...themeConfig.heroBanner, enabled: e.target.checked } })} /> <span style={{ fontSize: '12px', color: '#cbd5e1' }}>Bật</span>
            </label>
          </div>
          {themeConfig.heroBanner?.enabled && (
            <div style={{ marginTop: '12px' }}>
              <label style={{
                display: 'inline-block', padding: '8px 16px', background: 'rgba(255,255,255,0.1)', 
                borderRadius: '8px', fontSize: '12px', cursor: 'pointer', color: '#fff', border: '1px solid rgba(255,255,255,0.2)'
              }}>
                Tải ảnh bìa mới
                <input 
                  type="file" 
                  accept="image/*" 
                  style={{ display: 'none' }} 
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      const url = URL.createObjectURL(e.target.files[0]);
                      handleUpdate({ heroBanner: { ...themeConfig.heroBanner, enabled: true, url: url } });
                    }
                  }}
                />
              </label>
            </div>
          )}
        </div>
      </div>

      <h3 className="section-title">Thẻ Bio & Viền (Card Styling)</h3>
      <div className="card">
        <div className="input-group">
          <label>Nền Thẻ Bio (Card Background)</label>
          <select value={themeConfig.cardStyling?.background} onChange={(e) => handleUpdate({ cardStyling: { ...themeConfig.cardStyling, background: e.target.value } })}>
            <option value="#16181d">Màu Tối (Solid Dark)</option>
            <option value="#f8fafc">Màu Sáng (Solid Light)</option>
            <option value="glass">Kính mờ (Glassmorphism)</option>
            <option value="transparent">Trong suốt</option>
          </select>
        </div>
        <div className="input-group">
          <label>Kiểu viền Thẻ (Border Style)</label>
          <select value={themeConfig.cardStyling?.borderStyle} onChange={(e) => handleUpdate({ cardStyling: { ...themeConfig.cardStyling, borderStyle: e.target.value } })}>
            <option value="none">Không viền</option>
            <option value="solid">Viền Liền (Solid)</option>
            <option value="dashed">Viền Đứt (Dashed)</option>
            <option value="glow">Phát sáng (Neon Glow)</option>
          </select>
        </div>
        {themeConfig.cardStyling?.borderStyle !== 'none' && (
          <>
            <div className="input-group">
              <label>Màu viền (Border Color)</label>
              <input type="color" value={themeConfig.cardStyling?.borderColor} onChange={(e) => handleUpdate({ cardStyling: { ...themeConfig.cardStyling, borderColor: e.target.value } })} />
            </div>
            <div className="input-group">
              <label>Độ dày viền (Border Thickness): <span style={{ color: '#3b82f6' }}>{themeConfig.cardStyling?.borderThickness}px</span></label>
              <input type="range" min="1" max="10" value={parseInt(themeConfig.cardStyling?.borderThickness || '2')} onChange={(e) => handleUpdate({ cardStyling: { ...themeConfig.cardStyling, borderThickness: e.target.value + 'px' } })} />
            </div>
          </>
        )}
        <div className="input-group" style={{ marginBottom: '0' }}>
          <label>Độ bo góc (Border Radius)</label>
          <select value={themeConfig.cardStyling?.borderRadius} onChange={(e) => handleUpdate({ cardStyling: { ...themeConfig.cardStyling, borderRadius: e.target.value } })}>
            <option value="0px">Vuông góc (0px)</option>
            <option value="16px">Bo nhẹ (16px)</option>
            <option value="40px">Tròn (40px)</option>
          </select>
        </div>
      </div>

      <h3 className="section-title">Phông chữ & Văn bản (Typography)</h3>
      <div className="card">
        <div className="input-group">
          <label>Google Font Family</label>
          <select value={themeConfig.fontFamily} onChange={(e) => handleUpdate({ fontFamily: e.target.value })}>
            <option value="'Inter', sans-serif">Inter (Hiện đại, Mặc định)</option>
            <option value="'Outfit', sans-serif">Outfit (Cứng cáp, Tròn)</option>
            <option value="'Playfair Display', serif">Playfair (Cổ điển, Sang trọng)</option>
            <option value="'Comic Neue', cursive">Comic Neue (Vui nhộn)</option>
            <option value="'Space Mono', monospace">Space Mono (Tech, Code)</option>
          </select>
        </div>
        <div className="input-group" style={{ marginBottom: '0' }}>
          <label>Màu chữ (Text Color)</label>
          <input type="color" value={themeConfig.textColor} onChange={(e) => handleUpdate({ textColor: e.target.value })} />
        </div>
      </div>

      <h3 className="section-title">Avatar Styling</h3>
      <div className="card">
        <div className="input-group" style={{ marginBottom: '0' }}>
          <label>Khung viền Avatar (Frames)</label>
          <select value={themeConfig.profile.avatarFrame} onChange={(e) => handleUpdate({ profile: { ...themeConfig.profile, avatarFrame: e.target.value as any } })}>
            <option value="neon">Viền Neon Tai Dơi (CSS)</option>
            <option value="none">Trơn (Không có)</option>
            <option value="discord">Vòng sáng xoay (CSS)</option>
            <option value="image">Khung ảnh Custom (Game/Tai thỏ)</option>
          </select>
        </div>
      </div>

      <h3 className="section-title">Kiểu dáng Nút bấm (Link Buttons)</h3>
      <div className="card">
        <div className="input-group">
          <label>Độ bo góc (Shape)</label>
          <div className="options-grid">
            <div className={`option-box ${themeConfig.buttonStyle.borderRadius === '0px' ? 'active' : ''}`} onClick={() => handleUpdate({ buttonStyle: { ...themeConfig.buttonStyle, borderRadius: '0px' } })}>Vuông</div>
            <div className={`option-box ${themeConfig.buttonStyle.borderRadius === '12px' ? 'active' : ''}`} onClick={() => handleUpdate({ buttonStyle: { ...themeConfig.buttonStyle, borderRadius: '12px' } })}>Bo nhẹ</div>
            <div className={`option-box ${themeConfig.buttonStyle.borderRadius === '30px' ? 'active' : ''}`} onClick={() => handleUpdate({ buttonStyle: { ...themeConfig.buttonStyle, borderRadius: '30px' } })}>Viên thuốc</div>
          </div>
        </div>
        <div className="input-group" style={{ marginBottom: '0' }}>
          <label>Hiệu ứng Hover (Nhẹ nhàng)</label>
          <select value={themeConfig.buttonStyle.hoverEffect} onChange={(e) => handleUpdate({ buttonStyle: { ...themeConfig.buttonStyle, hoverEffect: e.target.value as any } })}>
            <option value="hover-color">Đổi màu (Đảo ngược)</option>
            <option value="hover-scale">Phóng to nhẹ (Soft Scale)</option>
            <option value="hover-lift">Nổi lên (Float Up)</option>
            <option value="hover-glow">Phát sáng (Neon Glow)</option>
          </select>
        </div>
      </div>

      <h3 className="section-title">Hiệu ứng rơi (Falling Effects)</h3>
      <div className="card">
        <div className="input-group" style={{ marginBottom: '0' }}>
          <select value={themeConfig.effect} onChange={(e) => handleUpdate({ effect: e.target.value as any })}>
            <option value="none">Không có</option>
            <option value="sakura">🌸 Hoa anh đào (Sakura)</option>
            <option value="snow">❄️ Tuyết rơi (Snow)</option>
            <option value="star">✨ Ánh sao bay (Stars)</option>
            <option value="rain">🌧️ Mưa (Rain)</option>
            <option value="leaf">🍂 Lá mùa thu (Autumn Leaves)</option>
            <option value="bubble">🫧 Bong bóng nổi (Bubbles)</option>
          </select>
        </div>
      </div>
    </>
  );
}
