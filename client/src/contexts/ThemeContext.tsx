import React, { createContext, useContext, useState, ReactNode } from 'react';
import { IBioPage, IThemeConfig } from '../types/bio';

// Cấu hình mặc định nếu API chưa trả về
const defaultTheme: IThemeConfig = {
  layout: 'overlap_center',
  background: { type: 'avatar_blur' },
  profile: {},
  effect: 'none',
  buttonStyle: { hoverEffect: 'scale_up', borderRadius: '12px', backgroundColor: '#fff', textColor: '#000' }
};

interface ThemeContextType {
  themeConfig: IThemeConfig;
  setThemeConfig: (config: IThemeConfig) => void;
  bioData: IBioPage | null;
  setBioData: (data: IBioPage | null) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [themeConfig, setThemeConfig] = useState<IThemeConfig>(defaultTheme);
  const [bioData, setBioData] = useState<IBioPage | null>(null);

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
