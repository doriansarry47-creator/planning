import React from 'react';
import { Moon, Sun, Monitor } from 'lucide-react';
import { useTheme } from './theme-provider';
import { Button } from './button';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const cycleTheme = () => {
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  const getIcon = () => {
    switch (theme) {
      case 'light':
        return <Sun className="h-5 w-5" />;
      case 'dark':
        return <Moon className="h-5 w-5" />;
      case 'system':
        return <Monitor className="h-5 w-5" />;
    }
  };

  const getLabel = () => {
    switch (theme) {
      case 'light':
        return 'Clair';
      case 'dark':
        return 'Sombre';
      case 'system':
        return 'Système';
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={cycleTheme}
      className="gap-2 transition-all duration-200 hover:scale-105"
      title={`Mode actuel : ${getLabel()}`}
    >
      {getIcon()}
      <span className="hidden sm:inline">{getLabel()}</span>
    </Button>
  );
}

// Version compacte pour le menu mobile
export function ThemeToggleCompact() {
  const { theme, setTheme, actualTheme } = useTheme();

  return (
    <div className="flex items-center justify-center gap-1 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
      <button
        onClick={() => setTheme('light')}
        className={`p-2 rounded-md transition-all duration-200 ${
          theme === 'light'
            ? 'bg-white dark:bg-gray-700 shadow-sm'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        title="Mode clair"
      >
        <Sun className={`h-4 w-4 ${theme === 'light' ? 'text-amber-500' : 'text-gray-600 dark:text-gray-400'}`} />
      </button>
      <button
        onClick={() => setTheme('dark')}
        className={`p-2 rounded-md transition-all duration-200 ${
          theme === 'dark'
            ? 'bg-white dark:bg-gray-700 shadow-sm'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        title="Mode sombre"
      >
        <Moon className={`h-4 w-4 ${theme === 'dark' ? 'text-blue-500' : 'text-gray-600 dark:text-gray-400'}`} />
      </button>
      <button
        onClick={() => setTheme('system')}
        className={`p-2 rounded-md transition-all duration-200 ${
          theme === 'system'
            ? 'bg-white dark:bg-gray-700 shadow-sm'
            : 'hover:bg-gray-200 dark:hover:bg-gray-700'
        }`}
        title="Mode système"
      >
        <Monitor className={`h-4 w-4 ${theme === 'system' ? 'text-purple-500' : 'text-gray-600 dark:text-gray-400'}`} />
      </button>
    </div>
  );
}
