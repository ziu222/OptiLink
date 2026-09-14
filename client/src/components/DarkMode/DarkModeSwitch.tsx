import { useState } from 'react';
import { getTheme, setTheme } from '../../lib/theme';
import { SegmentedToggle } from './SegmentedToggle';
import './DarkMode.css';

interface DarkModeSwitchProps {
  compact?: boolean;
}

export function DarkModeSwitch({ compact = false }: DarkModeSwitchProps) {
  const [dark, setDark] = useState(getTheme() === 'dark');

  const setMode = (isDark: boolean) => {
    setDark(isDark);
    setTheme(isDark ? 'dark' : 'light');
  };

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => setMode(!dark)}
        aria-label={dark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
        title={dark ? 'Chuyển sang chế độ sáng' : 'Chuyển sang chế độ tối'}
        className="darkmode-compact"
      >
        {dark ? 'Sáng' : 'Tối'}
      </button>
    );
  }

  return (
    <SegmentedToggle
      ariaLabel="Giao diện"
      options={[
        { value: true, label: 'Tối' },
        { value: false, label: 'Sáng' },
      ]}
      value={dark}
      onChange={setMode}
    />
  );
}
