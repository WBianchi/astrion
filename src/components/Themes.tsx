import { Check } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

export function Themes() {
  const { theme: selectedTheme, setTheme } = useTheme();

  const themes = [
    {
      id: 'dark' as const,
      name: 'Dark (Monokai)',
      description: 'Tema escuro com cores vibrantes',
      colors: {
        bg: '#1e1e1e',
        sidebar: '#252526',
        accent: '#007acc',
        text: '#d4d4d4'
      }
    },
    {
      id: 'light' as const,
      name: 'Light',
      description: 'Tema claro e limpo',
      colors: {
        bg: '#ffffff',
        sidebar: '#f3f3f3',
        accent: '#0066cc',
        text: '#000000'
      }
    },
    {
      id: 'dracula' as const,
      name: 'Dracula',
      description: 'Tema escuro com toques de roxo',
      colors: {
        bg: '#282a36',
        sidebar: '#21222c',
        accent: '#bd93f9',
        text: '#f8f8f2'
      }
    }
  ];

  const handleThemeSelect = (themeId: 'dark' | 'light' | 'dracula') => {
    setTheme(themeId);
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-r border-[#3e3e42]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3e3e42]">
        <span className="text-xs font-semibold text-gray-400 uppercase">Themes</span>
      </div>

      {/* Theme List */}
      <div className="flex-1 overflow-y-auto p-3">
        <div className="space-y-3">
          {themes.map((theme) => (
            <button
              key={theme.id}
              onClick={() => handleThemeSelect(theme.id)}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                selectedTheme === theme.id
                  ? 'border-blue-500 bg-[#2a2d2e]'
                  : 'border-[#3e3e42] hover:border-[#4e4e52] bg-[#252526]'
              }`}
            >
              {/* Theme Preview */}
              <div className="flex items-start gap-3 mb-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-sm font-semibold text-white">{theme.name}</h3>
                    {selectedTheme === theme.id && (
                      <Check className="w-4 h-4 text-blue-500" />
                    )}
                  </div>
                  <p className="text-xs text-gray-400">{theme.description}</p>
                </div>
              </div>

              {/* Color Preview */}
              <div className="flex gap-2">
                <div
                  className="w-8 h-8 rounded border border-gray-600"
                  style={{ backgroundColor: theme.colors.bg }}
                  title="Background"
                />
                <div
                  className="w-8 h-8 rounded border border-gray-600"
                  style={{ backgroundColor: theme.colors.sidebar }}
                  title="Sidebar"
                />
                <div
                  className="w-8 h-8 rounded border border-gray-600"
                  style={{ backgroundColor: theme.colors.accent }}
                  title="Accent"
                />
                <div
                  className="w-8 h-8 rounded border border-gray-600"
                  style={{ backgroundColor: theme.colors.text }}
                  title="Text"
                />
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Info */}
      <div className="px-3 py-2 border-t border-[#3e3e42] text-xs text-gray-500">
        💡 Mais temas em breve!
      </div>
    </div>
  );
}
