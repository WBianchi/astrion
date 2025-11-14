import { useState, useEffect } from 'react';
import { 
  FolderOpen, 
  File, 
  Save, 
  FolderPlus,
  FilePlus,
  Trash2,
  Edit3,
  Copy,
  Scissors,
  Clipboard,
  Search,
  X,
  Terminal as TerminalIcon
} from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { WindowControls } from './WindowControls';

// Hook para atalhos de teclado
function useKeyboardShortcut(key: string, ctrlKey: boolean, callback: () => void) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key.toLowerCase() === key.toLowerCase() && e.ctrlKey === ctrlKey) {
        e.preventDefault();
        callback();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [key, ctrlKey, callback]);
}

interface MenuItemProps {
  label: string;
  items: {
    label: string;
    icon?: any;
    shortcut?: string;
    separator?: boolean;
    action: () => void;
  }[];
}

function MenuItem({ label, items }: MenuItemProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="px-3 py-1 text-sm hover:bg-[#3e3e42] transition-colors">
        {label}
      </button>
      
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 w-64 bg-[#252526] border border-[#3e3e42] shadow-lg z-50">
          {items.map((item, index) => (
            item.separator ? (
              <div key={index} className="h-px bg-[#3e3e42] my-1" />
            ) : (
              <button
                key={index}
                onClick={() => {
                  item.action();
                  setIsOpen(false);
                }}
                className="w-full flex items-center gap-3 px-3 py-2 text-sm hover:bg-[#3e3e42] transition-colors text-left"
              >
                {item.icon && <item.icon className="w-4 h-4 text-gray-400" />}
                <span className="flex-1 text-gray-300">{item.label}</span>
                {item.shortcut && (
                  <span className="text-xs text-gray-500">{item.shortcut}</span>
                )}
              </button>
            )
          ))}
        </div>
      )}
    </div>
  );
}

export function MenuBar() {
  const { currentFile, workspacePath, setCurrentFile, addOpenFile, setWorkspacePath, setFileTree } = useEditorStore();

  const handleOpenFolder = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.showOpenDialog({
        properties: ['openDirectory'],
        title: 'Select Workspace Folder'
      });
      
      if (!result.canceled && result.filePaths.length > 0) {
        const folderPath = result.filePaths[0];
        const dirResult = await window.electronAPI.readDirectory(folderPath);
        if (dirResult.success && dirResult.files) {
          setWorkspacePath(folderPath);
          setFileTree(dirResult.files);
        }
      }
    } else {
      alert('Open Folder only works in Electron mode');
    }
  };

  const handleOpenFile = async () => {
    if (window.electronAPI) {
      const result = await window.electronAPI.showOpenDialog({
        properties: ['openFile'],
        title: 'Open File',
        filters: [
          { name: 'All Files', extensions: ['*'] },
          { name: 'JavaScript', extensions: ['js', 'jsx', 'ts', 'tsx'] },
          { name: 'Text', extensions: ['txt', 'md'] },
          { name: 'JSON', extensions: ['json'] }
        ]
      });
      
      if (!result.canceled && result.filePaths.length > 0) {
        const filePath = result.filePaths[0];
        const fileResult = await window.electronAPI.readFile(filePath);
        if (fileResult.success) {
          const fileName = filePath.split('/').pop() || 'untitled';
          const fileItem = {
            name: fileName,
            path: filePath,
            isDirectory: false,
            content: fileResult.content || ''
          };
          setCurrentFile(fileItem);
          addOpenFile(fileItem);
        }
      }
    } else {
      alert('Open File only works in Electron mode');
    }
  };

  const handleSaveFile = async () => {
    if (!currentFile) {
      alert('No file open to save');
      return;
    }
    
    if (window.electronAPI) {
      const result = await window.electronAPI.writeFile(
        currentFile.path, 
        currentFile.content || ''
      );
      if (result.success) {
        alert('File saved successfully!');
      } else {
        alert(`Error saving file: ${result.error}`);
      }
    } else {
      alert('Save File only works in Electron mode');
    }
  };

  const handleNewFile = async () => {
    if (window.electronAPI) {
      const fileName = prompt('New file name:');
      if (fileName) {
        const homeDir = await window.electronAPI.getHomeDir();
        const filePath = `${homeDir}/${fileName}`;
        const result = await window.electronAPI.createFile(filePath);
        if (result.success) {
          const fileItem = {
            name: fileName,
            path: filePath,
            isDirectory: false,
            content: ''
          };
          setCurrentFile(fileItem);
          addOpenFile(fileItem);
        }
      }
    } else {
      alert('New File only works in Electron mode');
    }
  };

  const handleNewFolder = async () => {
    if (window.electronAPI) {
      const folderName = prompt('New folder name:');
      if (folderName) {
        const homeDir = await window.electronAPI.getHomeDir();
        const folderPath = `${homeDir}/${folderName}`;
        const result = await window.electronAPI.createDirectory(folderPath);
        if (result.success) {
          alert(`Folder created: ${folderPath}`);
        }
      }
    } else {
      alert('New Folder only works in Electron mode');
    }
  };

  const handleDeleteFile = async () => {
    if (!currentFile) {
      alert('No file selected to delete');
      return;
    }

    if (window.electronAPI) {
      const confirm = window.confirm(`Delete ${currentFile.name}?`);
      if (confirm) {
        const result = await window.electronAPI.deletePath(currentFile.path);
        if (result.success) {
          alert('File deleted successfully!');
          setCurrentFile(null);
        }
      }
    } else {
      alert('Delete File only works in Electron mode');
    }
  };

  const handleRenameFile = async () => {
    if (!currentFile) {
      alert('No file selected to rename');
      return;
    }

    const newName = prompt('New name:', currentFile.name);
    if (newName && window.electronAPI) {
      // const newPath = currentFile.path.replace(currentFile.name, newName);
      // TODO: Implementar método de rename no IPC
      alert('Rename feature coming soon!');
    }
  };

  // Atalhos de teclado
  useKeyboardShortcut('k', true, handleOpenFolder);
  useKeyboardShortcut('s', true, handleSaveFile);

  const fileMenuItems = [
    { label: 'Open Folder...', icon: FolderOpen, shortcut: 'Ctrl+K', action: handleOpenFolder },
    { label: 'Open File...', icon: File, shortcut: 'Ctrl+O', action: handleOpenFile },
    { label: 'Open Recent', icon: File, action: () => alert('Recent files coming soon!') },
    { separator: true, label: '', action: () => {} },
    { label: 'New File', icon: FilePlus, shortcut: 'Ctrl+N', action: handleNewFile },
    { label: 'New Folder', icon: FolderPlus, action: handleNewFolder },
    { separator: true, label: '', action: () => {} },
    { label: 'Save', icon: Save, shortcut: 'Ctrl+S', action: handleSaveFile },
    { label: 'Save As...', icon: Save, shortcut: 'Ctrl+Shift+S', action: () => alert('Save As coming soon!') },
    { label: 'Save All', icon: Save, action: () => alert('Save All coming soon!') },
    { separator: true, label: '', action: () => {} },
    { label: 'Rename', icon: Edit3, shortcut: 'F2', action: handleRenameFile },
    { label: 'Delete', icon: Trash2, shortcut: 'Del', action: handleDeleteFile },
    { separator: true, label: '', action: () => {} },
    { label: 'Close Editor', icon: X, shortcut: 'Ctrl+W', action: () => setCurrentFile(null) },
  ];

  const editMenuItems = [
    { label: 'Undo', shortcut: 'Ctrl+Z', action: () => alert('Undo coming soon!') },
    { label: 'Redo', shortcut: 'Ctrl+Y', action: () => alert('Redo coming soon!') },
    { separator: true, label: '', action: () => {} },
    { label: 'Cut', icon: Scissors, shortcut: 'Ctrl+X', action: () => document.execCommand('cut') },
    { label: 'Copy', icon: Copy, shortcut: 'Ctrl+C', action: () => document.execCommand('copy') },
    { label: 'Paste', icon: Clipboard, shortcut: 'Ctrl+V', action: () => document.execCommand('paste') },
    { separator: true, label: '', action: () => {} },
    { label: 'Find', icon: Search, shortcut: 'Ctrl+F', action: () => alert('Find coming soon!') },
    { label: 'Replace', shortcut: 'Ctrl+H', action: () => alert('Replace coming soon!') },
  ];

  const viewMenuItems = [
    { label: 'Command Palette', shortcut: 'Ctrl+Shift+P', action: () => alert('Command Palette coming soon!') },
    { separator: true, label: '', action: () => {} },
    { label: 'Explorer', icon: FolderOpen, shortcut: 'Ctrl+Shift+E', action: () => alert('Toggle Explorer') },
    { label: 'Search', icon: Search, shortcut: 'Ctrl+Shift+F', action: () => alert('Toggle Search') },
    { label: 'Terminal', shortcut: 'Ctrl+`', action: () => alert('Toggle Terminal') },
    { separator: true, label: '', action: () => {} },
    { label: 'Appearance', action: () => alert('Appearance settings coming soon!') },
  ];

  const handleOpenDevTools = () => {
    if (window.electronAPI) {
      window.electronAPI.toggleDevTools();
    } else {
      // No navegador, abre o console do browser
      console.log('DevTools: Use F12 ou Ctrl+Shift+I para abrir o console');
    }
  };

  const helpMenuItems = [
    { label: 'Open Developer Console', icon: TerminalIcon, shortcut: 'F12', action: handleOpenDevTools },
    { separator: true, label: '', action: () => {} },
    { label: 'Documentation', action: () => window.open('https://github.com', '_blank') },
    { label: 'Keyboard Shortcuts', shortcut: 'Ctrl+K Ctrl+S', action: () => alert('Shortcuts coming soon!') },
    { separator: true, label: '', action: () => {} },
    { label: 'About', action: () => alert('Astrion v1.0.0\nBuilt with Electron + React + Ollama') },
  ];

  const handleDoubleClick = () => {
    if (window.electronAPI) {
      window.electronAPI.windowMaximize();
    }
  };

  return (
    <div 
      className="h-9 bg-[#252526] border-b border-[#3e3e42] flex items-center px-2 text-gray-300"
      onDoubleClick={handleDoubleClick}
      style={{ WebkitAppRegion: 'drag' } as any}
    >
      {/* Window Controls */}
      <div style={{ WebkitAppRegion: 'no-drag' } as any}>
        <WindowControls />
      </div>
      
      <div className="flex items-center gap-1 ml-2" style={{ WebkitAppRegion: 'no-drag' } as any}>
        <MenuItem label="File" items={fileMenuItems} />
        <MenuItem label="Edit" items={editMenuItems} />
        <MenuItem label="View" items={viewMenuItems} />
        <MenuItem label="Help" items={helpMenuItems} />
      </div>
      
      {/* Workspace & File Indicator */}
      <div className="ml-auto flex items-center gap-4 text-xs text-gray-500">
        {workspacePath && (
          <div className="flex items-center gap-2">
            <FolderOpen className="w-3 h-3" />
            <span>{workspacePath.split('/').pop()}</span>
          </div>
        )}
        {currentFile && (
          <div className="flex items-center gap-2">
            <File className="w-3 h-3" />
            <span>{currentFile.name}</span>
          </div>
        )}
      </div>
    </div>
  );
}
