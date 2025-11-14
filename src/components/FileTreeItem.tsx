import { ChevronDown, ChevronRight, Folder } from 'lucide-react';
import { useState } from 'react';

interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
}

interface FileTreeItemProps {
  item: FileItem;
  level: number;
  expandedFolders: Set<string>;
  selectedFiles: Set<string>;
  onToggleFolder: (path: string) => void;
  onFileClick: (file: FileItem, event: React.MouseEvent) => void;
  onContextMenu: (event: React.MouseEvent, file: FileItem) => void;
  getFileIcon: (name: string) => { icon: any; color: string };
}

export function FileTreeItem({
  item,
  level,
  expandedFolders,
  selectedFiles,
  onToggleFolder,
  onFileClick,
  onContextMenu,
  getFileIcon
}: FileTreeItemProps) {
  const [children, setChildren] = useState<FileItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const isExpanded = expandedFolders.has(item.path);

  const loadChildren = async () => {
    if (!item.isDirectory || children.length > 0) return;

    setIsLoading(true);
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.readDirectory(item.path);
        if (result.success && result.files) {
          const childItems = result.files.map((file: any) => ({
            name: file.name,
            path: file.path,
            isDirectory: file.isDirectory
          }));
          setChildren(childItems);
        }
      }
    } catch (error) {
      console.error('Error loading children:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClick = async (e: React.MouseEvent) => {
    if (item.isDirectory) {
      onToggleFolder(item.path);
      if (!isExpanded) {
        await loadChildren();
      }
    } else {
      onFileClick(item, e);
    }
  };

  return (
    <div>
      {/* Item principal */}
      <div
        onClick={handleClick}
        onContextMenu={(e) => onContextMenu(e, item)}
        className={`flex items-center gap-1.5 px-2 py-1 hover:bg-[#2a2d2e] cursor-pointer group ${
          selectedFiles.has(item.path) ? 'bg-[#37373d]' : ''
        }`}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {item.isDirectory ? (
          <>
            {isLoading ? (
              <div className="w-3.5 h-3.5 animate-spin">⟳</div>
            ) : isExpanded ? (
              <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
            )}
            <Folder className="w-3.5 h-3.5 text-blue-400" />
          </>
        ) : (
          <>
            <div className="w-3.5" />
            {(() => {
              const { icon: Icon, color } = getFileIcon(item.name);
              return <Icon className="w-3.5 h-3.5" style={{ color }} />;
            })()}
          </>
        )}
        <span className="text-sm text-gray-300 truncate">{item.name}</span>
      </div>

      {/* Filhos recursivos */}
      {item.isDirectory && isExpanded && children.length > 0 && (
        <div>
          {children.map((child) => (
            <FileTreeItem
              key={child.path}
              item={child}
              level={level + 1}
              expandedFolders={expandedFolders}
              selectedFiles={selectedFiles}
              onToggleFolder={onToggleFolder}
              onFileClick={onFileClick}
              onContextMenu={onContextMenu}
              getFileIcon={getFileIcon}
            />
          ))}
        </div>
      )}
    </div>
  );
}
