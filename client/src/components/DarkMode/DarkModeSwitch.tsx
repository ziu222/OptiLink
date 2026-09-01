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
        aria-label={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        title={dark ? 'Switch to light mode' : 'Switch to dark mode'}
        className="darkmode-compact"
      >
        {dark ? 'Light' : 'Dark'}
      </button>
    );
  }

  return (
    <SegmentedToggle
      ariaLabel="Theme"
      options={[
        { value: true, label: 'Dark' },
        { value: false, label: 'Light' },
      ]}
      value={dark}
      onChange={setMode}
    />
  );
}
