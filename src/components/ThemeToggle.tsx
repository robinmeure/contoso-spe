// src/components/ThemeToggle.tsx

import React from 'react';
import { Button } from '@fluentui/react-components';
import { 
  WeatherMoon20Regular, 
  WeatherSunny20Regular 
} from '@fluentui/react-icons';
import { useTheme } from '../theme/ThemeContext';

export const ThemeToggle: React.FC = () => {
  const { theme, toggleTheme } = useTheme();

  return (
    <Button
      icon={theme === 'light' ? <WeatherMoon20Regular /> : <WeatherSunny20Regular />}
      onClick={toggleTheme}
      aria-label={theme === 'light' ? 'Switch to dark theme' : 'Switch to light theme'}
    />
  );
};