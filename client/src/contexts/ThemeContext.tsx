import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import type { IBioPage, IThemeConfig } from '../types/bio';
import { getMyBio } from '../api/bio';

// Cấu hình mặc định nếu API chưa trả về
const defaultTheme: IThemeConfig = {
  preset: 'commerce',
  layout: 'overlap_center',
  background: { type: 'gradient', value: 'linear-gradient(135deg, #0f1115, #16181d)' },
  heroBanner: { enabled: true, url: 'https://images.unsplash.com/photo-1616150143891-b3b320d36780?auto=format&fit=crop&w=500&q=80' },
  cardStyling: {
    background: '#16181d',
    borderStyle: 'none',
    borderColor: '#ff007f',
    borderThickness: '2',
    borderRadius: '40px'
  },
  profile: { avatarFrame: 'neon' },
  effect: 'none',
  buttonStyle: { hoverEffect: 'hover-color', borderRadius: '12px', backgroundColor: '#fff', textColor: '#000' },
  fontFamily: "'Inter', sans-serif",
  textColor: '#ffffff'
};

interface ThemeContextType {
  themeConfig: IThemeConfig;
  setThemeConfig: React.Dispatch<React.SetStateAction<IThemeConfig>>;
  bioData: IBioPage | null;
  setBioData: React.Dispatch<React.SetStateAction<IBioPage | null>>;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const mockBioData: IBioPage = {
  _id: 'mock-id-123',
  userId: 'owner-id',
  username: 'optilink_demo',
  title: 'Cửa hàng của Demo KOL',
  bio: 'Chào mừng bạn đến với Bio Page của mình! Kéo xuống để xem các sản phẩm nhé.',
  avatarUrl: 'https://i.pravatar.cc/150?u=a042581f4e29026704d',
  socialLinks: {
    facebook: '#',
    instagram: '#',
    tiktok: '#'
  },
  themeConfig: defaultTheme,
  isActive: true,
  blocks: [
    {
      id: 'tab-1',
      type: 'TAB_GROUP',
      isHidden: false,
      order: 0,
      content: {
        tabs: [
          { id: 'tab-all', label: 'Tất cả SP' },
          { id: 'tab-sale', label: 'Khuyến mãi' }
        ]
      }
    },
    {
      id: 'search-1',
      type: 'SEARCH_BAR',
      isHidden: false,
      order: 1,
      content: { placeholder: 'Tìm mỹ phẩm, quần áo...' }
    },
    {
      id: 'cat-1',
      type: 'CATEGORY_FILTER',
      isHidden: false,
      order: 2,
      content: { categories: ['Thời trang', 'Mỹ phẩm', 'Đồ công nghệ'] }
    },
    {
      id: 'prod-1',
      type: 'PRODUCT_CARD',
      isHidden: false,
      order: 3,
      content: {
        title: 'Áo thun Local Brand Cao Cấp',
        price: '250.000đ',
        category: 'Thời trang',
        imageUrl: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=100&q=80',
        shortLinkId: 'ao-thun-123'
      }
    },
    {
      id: 'prod-2',
      type: 'PRODUCT_CARD',
      isHidden: false,
      order: 4,
      content: {
        title: 'Son Môi Hàn Quốc Siêu Lì',
        price: '180.000đ',
        category: 'Mỹ phẩm',
        imageUrl: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?auto=format&fit=crop&w=100&q=80',
        shortLinkId: 'son-moi-123'
      }
    }
  ]
};

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeConfig, setThemeConfig] = useState<IThemeConfig>(defaultTheme);
  const [bioData, setBioData] = useState<IBioPage | null>(mockBioData);

  useEffect(() => {
    getMyBio()
      .then((bio) => {
        if (bio) {
          setBioData(bio);
          setThemeConfig(bio.themeConfig);
        }
      })
      .catch(() => {
        // Not logged in or no saved bio yet — keep the demo defaults.
      });
  }, []);

  return (
    <ThemeContext.Provider value={{ themeConfig, setThemeConfig, bioData, setBioData }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
