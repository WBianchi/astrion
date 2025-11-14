import { useState, useEffect } from 'react';
import { Folder, ChevronRight, ChevronDown, Plus, FolderPlus, Sparkles, Trash2, Copy, Search, FileText, Edit, Globe } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { InputDialog } from './InputDialog';
import { getFileIcon } from '../utils/fileIcons';
import { FileTreeItem } from './FileTreeItem';
import { useToast } from './Toast';

export function FileExplorer() {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [showAIDialog, setShowAIDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; path: string; isBackground?: boolean } | null>(null);
  const [inputDialog, setInputDialog] = useState<{ type: 'file' | 'folder' | 'rename'; title: string; placeholder: string; defaultValue?: string; context?: string } | null>(null);
  
  const { fileTree, setFileTree, setCurrentFile, addOpenFile, workspacePath } = useEditorStore();
  const { showToast, ToastContainer } = useToast();

  useEffect(() => {
    console.log('🚀 FileExplorer mounted, workspacePath:', workspacePath);
    // Só carrega home se não tiver workspace
    if (!workspacePath) {
      console.log('📁 No workspace, loading home directory');
      loadHomeDirectory();
    } else {
      // Se já tem workspace (do localStorage), carrega os arquivos
      console.log('📁 Workspace exists, loading:', workspacePath);
      loadDirectory(workspacePath);
      setCurrentPath(workspacePath);
    }
  }, []);

  useEffect(() => {
    console.log('🔄 Workspace changed to:', workspacePath);
    // Quando workspace mudar, atualiza o currentPath e carrega arquivos
    if (workspacePath) {
      setCurrentPath(workspacePath);
      loadDirectory(workspacePath);
    }
  }, [workspacePath]);

  // Listener para refresh automático quando arquivos são criados
  useEffect(() => {
    const handleRefresh = () => {
      console.log('🔄 Auto-refresh triggered');
      if (workspacePath) {
        loadDirectory(workspacePath);
      }
    };

    window.addEventListener('refresh-file-tree', handleRefresh);
    return () => window.removeEventListener('refresh-file-tree', handleRefresh);
  }, [workspacePath]);

  // Auto-refresh a cada 3 segundos para detectar mudanças externas
  useEffect(() => {
    if (!workspacePath) return;
    
    const interval = setInterval(() => {
      console.log('🔄 Auto-refresh (polling)');
      loadDirectory(workspacePath);
    }, 3000); // 3 segundos
    
    return () => clearInterval(interval);
  }, [workspacePath]);

  const loadHomeDirectory = async () => {
    if (window.electronAPI && !workspacePath) {
      const homeDir = await window.electronAPI.getHomeDir();
      setCurrentPath(homeDir);
      loadDirectory(homeDir);
    }
  };

  const loadDirectory = async (path: string) => {
    if (window.electronAPI) {
      console.log('📂 Loading directory:', path);
      const result = await window.electronAPI.readDirectory(path);
      console.log('📂 Result:', JSON.stringify(result, null, 2));
      console.log('📂 result.success:', result.success);
      console.log('📂 result.files:', result.files);
      console.log('📂 result.files length:', result.files?.length);
      
      if (result.success && result.files && result.files.length > 0) {
        console.log('✅ Setting fileTree with', result.files.length, 'items');
        setFileTree(result.files);
      } else if (result.success && result.files && result.files.length === 0) {
        console.warn('⚠️ Directory is empty or no readable files');
        setFileTree([]);
      } else {
        console.error('❌ Failed to load directory:', result.error);
      }
    } else {
      console.error('❌ electronAPI not available');
    }
  };

  const toggleFolder = async (path: string) => {
    const newExpanded = new Set(expandedFolders);
    if (newExpanded.has(path)) {
      newExpanded.delete(path);
    } else {
      newExpanded.add(path);
      // Carrega os arquivos da pasta quando expandir
      await loadSubdirectory(path);
    }
    setExpandedFolders(newExpanded);
  };

  const loadSubdirectory = async (path: string) => {
    if (window.electronAPI) {
      console.log('📂 Loading subdirectory:', path);
      const result = await window.electronAPI.readDirectory(path);
      if (result.success && result.files) {
        // Adiciona os arquivos do subdiretório ao fileTree
        const newFiles = result.files.map((file: any) => ({
          name: file.name,
          path: file.path,
          isDirectory: file.isDirectory
        }));
        
        // Remove arquivos antigos desse diretório e adiciona os novos
        const filteredTree = fileTree.filter(f => !f.path.startsWith(path + '/'));
        const updatedTree = [...filteredTree, ...newFiles].sort((a, b) => {
          // Ordena: diretórios primeiro, depois por nome
          if (a.isDirectory && !b.isDirectory) return -1;
          if (!a.isDirectory && b.isDirectory) return 1;
          return a.name.localeCompare(b.name);
        });
        
        setFileTree(updatedTree);
      }
    }
  };

  const handleFileClick = async (file: any, event: React.MouseEvent) => {
    // Ctrl+Click: Abre múltiplas abas (não limpa seleção)
    if (event.ctrlKey || event.metaKey) {
      const newSelected = new Set(selectedFiles);
      if (newSelected.has(file.path)) {
        newSelected.delete(file.path);
      } else {
        newSelected.add(file.path);
      }
      setSelectedFiles(newSelected);
      
      // Se for arquivo, abre em nova aba
      if (!file.isDirectory && window.electronAPI) {
        const result = await window.electronAPI.readFile(file.path);
        if (result.success) {
          const fileItem = {
            name: file.name,
            path: file.path,
            isDirectory: false,
            content: result.content || ''
          };
          addOpenFile(fileItem); // Adiciona sem mudar o arquivo atual
        }
      }
      return;
    }

    // Seleção com Shift (seleciona range)
    if (event.shiftKey && selectedFiles.size > 0) {
      const lastSelected = Array.from(selectedFiles)[selectedFiles.size - 1];
      const lastIndex = fileTree.findIndex(f => f.path === lastSelected);
      const currentIndex = fileTree.findIndex(f => f.path === file.path);
      
      if (lastIndex !== -1 && currentIndex !== -1) {
        const start = Math.min(lastIndex, currentIndex);
        const end = Math.max(lastIndex, currentIndex);
        const newSelected = new Set(selectedFiles);
        
        for (let i = start; i <= end; i++) {
          newSelected.add(fileTree[i].path);
        }
        setSelectedFiles(newSelected);
        return;
      }
    }

    // Clique normal - limpa seleção e abre arquivo
    setSelectedFiles(new Set([file.path]));

    if (file.isDirectory) {
      toggleFolder(file.path);
      return;
    }

    // Ler conteúdo do arquivo
    if (window.electronAPI) {
      const result = await window.electronAPI.readFile(file.path);
      if (result.success) {
        const fileItem = {
          name: file.name,
          path: file.path,
          isDirectory: false,
          content: result.content || ''
        };
        setCurrentFile(fileItem);
        addOpenFile(fileItem);
      }
    }
  };

  const handleCreateFile = () => {
    if (!workspacePath && !currentPath) {
      alert('⚠️ Abra uma pasta primeiro!\n\nUse: File > Open Folder');
      return;
    }
    
    setInputDialog({
      type: 'file',
      title: 'New File',
      placeholder: 'filename.txt',
    });
  };

  const handleInputDialogConfirm = async (value: string) => {
    if (!inputDialog || !window.electronAPI) return;

    const basePath = inputDialog.context || workspacePath || currentPath;

    if (inputDialog.type === 'file') {
      const filePath = `${basePath}/${value}`;
      const result = await window.electronAPI.createFile(filePath);
      if (result.success) {
        if (workspacePath) {
          const dirResult = await window.electronAPI.readDirectory(workspacePath);
          if (dirResult.success && dirResult.files) {
            setFileTree(dirResult.files);
          }
        } else {
          loadDirectory(currentPath);
        }
      } else {
        alert(`❌ Erro ao criar arquivo: ${result.error}`);
      }
    } else if (inputDialog.type === 'folder') {
      const folderPath = `${basePath}/${value}`;
      const result = await window.electronAPI.createDirectory(folderPath);
      if (result.success) {
        if (workspacePath) {
          const dirResult = await window.electronAPI.readDirectory(workspacePath);
          if (dirResult.success && dirResult.files) {
            setFileTree(dirResult.files);
          }
        } else {
          loadDirectory(currentPath);
        }
      } else {
        alert(`❌ Erro ao criar pasta: ${result.error}`);
      }
    }

    setInputDialog(null);
  };

  const handleCreateFolder = () => {
    if (!workspacePath && !currentPath) {
      alert('⚠️ Abra uma pasta primeiro!\n\nUse: File > Open Folder');
      return;
    }
    
    setInputDialog({
      type: 'folder',
      title: 'New Folder',
      placeholder: 'folder-name',
    });
  };

  const handleOpenWithLiveServer = async () => {
    if (!contextMenu) return;
    
    const filePath = contextMenu.path;
    const isHtml = filePath.endsWith('.html') || filePath.endsWith('.htm');
    
    if (!isHtml) {
      alert('Live Server only works with HTML files');
      return;
    }

    // Inicia um servidor HTTP simples
    if (window.electronAPI) {
      const port = 5500;
      const dir = filePath.substring(0, filePath.lastIndexOf('/'));
      const fileName = filePath.split('/').pop();
      
      // Executa o live-server ou http-server
      const result = await window.electronAPI.executeCommand(
        `npx http-server "${dir}" -p ${port} -o ${fileName}`,
        dir
      );
      
      if (result.success) {
        alert(`Live Server started at http://localhost:${port}/${fileName}`);
      } else {
        alert(`Error starting Live Server: ${result.error}`);
      }
    }
    
    setContextMenu(null);
  };

  const handleDeleteSelected = async () => {
    if (selectedFiles.size === 0) {
      alert('No files selected');
      return;
    }

    const confirm = window.confirm(
      `Delete ${selectedFiles.size} item(s)?\n${Array.from(selectedFiles).map(p => p.split('/').pop()).join(', ')}`
    );

    if (confirm && window.electronAPI) {
      for (const filePath of selectedFiles) {
        await window.electronAPI.deletePath(filePath);
      }

      // Recarregar file tree
      if (workspacePath) {
        const result = await window.electronAPI.readDirectory(workspacePath);
        if (result.success && result.files) {
          setFileTree(result.files);
        }
      } else {
        loadDirectory(currentPath);
      }

      setSelectedFiles(new Set());
    }
  };

  const handleContextMenu = (event: React.MouseEvent, file: any) => {
    event.preventDefault();
    console.log('🖱️ Context menu:', { fileName: file.name, fullPath: file.path });
    setContextMenu({ x: event.clientX, y: event.clientY, path: file.path });
    
    // Se o arquivo não está selecionado, seleciona apenas ele
    if (!selectedFiles.has(file.path)) {
      setSelectedFiles(new Set([file.path]));
    }
  };

  const handleNewFileInContext = () => {
    if (!contextMenu) return;
    
    const dirPath = contextMenu.path.split('/').slice(0, -1).join('/');
    setInputDialog({
      type: 'file',
      title: 'New File',
      placeholder: 'filename.txt',
      context: dirPath,
    });
    setContextMenu(null);
  };

  const handleNewFolderInContext = () => {
    if (!contextMenu) return;
    
    const dirPath = contextMenu.path.split('/').slice(0, -1).join('/');
    setInputDialog({
      type: 'folder',
      title: 'New Folder',
      placeholder: 'folder-name',
      context: dirPath,
    });
    setContextMenu(null);
  };

  const handleCopyPath = () => {
    if (!contextMenu) return;
    console.log('📋 Copiando path absoluto:', contextMenu.path);
    navigator.clipboard.writeText(contextMenu.path);
    showToast(`Path copiado: ${contextMenu.path.split('/').pop()}`, 'success');
    setContextMenu(null);
  };

  const handleCopyRelativePath = () => {
    if (!contextMenu || !workspacePath) return;
    const relativePath = contextMenu.path.replace(workspacePath + '/', '');
    console.log('📋 Copiando relative path:', { full: contextMenu.path, workspace: workspacePath, relative: relativePath });
    navigator.clipboard.writeText(relativePath);
    showToast(`Relative path copiado: ${relativePath}`, 'success');
    setContextMenu(null);
  };

  const handleRename = () => {
    if (!contextMenu) return;
    
    const oldPath = contextMenu.path;
    const fileName = oldPath.split('/').pop() || '';
    const newName = prompt('Novo nome:', fileName);
    
    if (newName && newName !== fileName && window.electronAPI) {
      // TODO: Implementar rename usando fs.rename via IPC
      showToast('🚧 Função de renomear em desenvolvimento!', 'info');
    }
    setContextMenu(null);
  };

  const handleRevealInFileManager = () => {
    if (!contextMenu) return;
    alert(`🚧 Reveal in File Manager em desenvolvimento!\n\nPath:\n${contextMenu.path}`);
    setContextMenu(null);
  };

  const handleOpenInIntegratedTerminal = () => {
    if (!contextMenu) return;
    const dirPath = contextMenu.path.split('/').slice(0, -1).join('/');
    alert(`🚧 Open in Terminal em desenvolvimento!\n\nPath:\n${dirPath}`);
    setContextMenu(null);
  };

  const handleAIScaffold = () => {
    setShowAIDialog(true);
  };

  const handleGenerateStructure = async (projectType: string) => {
    if (!workspacePath || !window.electronAPI) {
      alert('Please open a workspace folder first');
      return;
    }

    // Aqui você pode integrar com a IA para gerar a estrutura
    const structures: Record<string, string[]> = {
      'nextjs-app': [
        'app/page.tsx',
        'app/layout.tsx',
        'app/api/route.ts',
        'components/Header.tsx',
        'components/Footer.tsx',
        'lib/utils.ts',
        'public/images/.gitkeep',
        'styles/globals.css',
        '.env.local',
        'next.config.js',
        'tsconfig.json',
        'package.json'
      ],
      'react-vite': [
        'src/App.tsx',
        'src/main.tsx',
        'src/components/Button.tsx',
        'src/hooks/useCustomHook.ts',
        'src/services/api.ts',
        'src/store/store.ts',
        'src/types/index.ts',
        'public/vite.svg',
        'index.html',
        'vite.config.ts',
        'tsconfig.json',
        'package.json'
      ],
      'express-api': [
        'src/server.ts',
        'src/routes/index.ts',
        'src/controllers/userController.ts',
        'src/middlewares/auth.ts',
        'src/models/User.ts',
        'src/config/database.ts',
        'src/utils/logger.ts',
        '.env',
        'package.json',
        'tsconfig.json'
      ]
    };

    const files = structures[projectType] || structures['react-vite'];
    
    for (const file of files) {
      const filePath: string = `${workspacePath}/${file}`;
      const dirPath: string = filePath.substring(0, filePath.lastIndexOf('/'));
      
      // Criar diretório se não existir
      if (dirPath !== workspacePath) {
        await window.electronAPI.createDirectory(dirPath);
      }
      
      // Criar arquivo
      await window.electronAPI.createFile(filePath);
    }

    // Recarregar file tree
    const result = await window.electronAPI.readDirectory(workspacePath);
    if (result.success && result.files) {
      setFileTree(result.files);
    }

    setShowAIDialog(false);
    alert(`Project structure created! ${files.length} files generated.`);
  };

  return (
    <div className="flex flex-col h-full bg-[#252526] border-r border-[#3e3e42]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3e3e42]">
        <span className="text-xs font-semibold text-gray-400 uppercase">Explorer</span>
        <div className="flex gap-1">
          <button
            onClick={handleAIScaffold}
            className="p-1 hover:bg-[#3e3e42] rounded transition-colors group"
            title="AI Scaffold Project"
          >
            <Sparkles className="w-4 h-4 text-purple-400 group-hover:text-purple-300" />
          </button>
          <button
            onClick={handleCreateFile}
            className="p-1 hover:bg-[#3e3e42] rounded transition-colors"
            title="New File"
          >
            <Plus className="w-4 h-4 text-gray-400" />
          </button>
          <button
            onClick={handleCreateFolder}
            className="p-1 hover:bg-[#3e3e42] rounded transition-colors"
            title="New Folder"
          >
            <FolderPlus className="w-4 h-4 text-gray-400" />
          </button>
          {selectedFiles.size > 0 && (
            <button
              onClick={handleDeleteSelected}
              className="p-1 hover:bg-[#3e3e42] rounded transition-colors"
              title={`Delete ${selectedFiles.size} item(s)`}
            >
              <Trash2 className="w-4 h-4 text-red-400" />
            </button>
          )}
        </div>
      </div>

      {/* Current Path */}
      <div className="px-3 py-2 text-xs text-gray-500 border-b border-[#3e3e42] truncate">
        {workspacePath || currentPath || 'No folder open'}
      </div>

      {/* File Tree */}
      <div 
        className="flex-1 overflow-y-auto"
        onContextMenu={(e) => {
          // Clique direito na área vazia
          if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('py-1')) {
            e.preventDefault();
            setContextMenu({ 
              x: e.clientX, 
              y: e.clientY, 
              path: workspacePath || currentPath,
              isBackground: true 
            });
          }
        }}
      >
        {fileTree.length === 0 ? (
          <div 
            className="p-4 text-sm text-gray-500 text-center"
            onContextMenu={(e) => {
              e.preventDefault();
              setContextMenu({ 
                x: e.clientX, 
                y: e.clientY, 
                path: workspacePath || currentPath,
                isBackground: true 
              });
            }}
          >
            No files to display
          </div>
        ) : (
          <div 
            className="py-1"
            onContextMenu={(e) => {
              if (e.target === e.currentTarget) {
                e.preventDefault();
                setContextMenu({ 
                  x: e.clientX, 
                  y: e.clientY, 
                  path: workspacePath || currentPath,
                  isBackground: true 
                });
              }
            }}
          >
            {fileTree
              .filter(item => {
                // Mostra apenas arquivos do nível root
                const parentPath = workspacePath || currentPath;
                const itemParent = item.path.substring(0, item.path.lastIndexOf('/'));
                return itemParent === parentPath;
              })
              .map((item) => (
                <FileTreeItem
                  key={item.path}
                  item={item}
                  level={0}
                  expandedFolders={expandedFolders}
                  selectedFiles={selectedFiles}
                  onToggleFolder={toggleFolder}
                  onFileClick={handleFileClick}
                  onContextMenu={handleContextMenu}
                  getFileIcon={getFileIcon}
                />
              ))}
          </div>
        )}
      </div>

      {/* AI Scaffold Dialog */}
      {showAIDialog && (
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-[#252526] border border-[#3e3e42] rounded-lg p-6 w-96">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              AI Project Scaffold
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Choose a project template and the AI will generate the complete structure for you!
            </p>
            
            <div className="space-y-3 mb-6">
              <button
                onClick={() => handleGenerateStructure('nextjs-app')}
                className="w-full p-3 bg-[#1e1e1e] hover:bg-[#2a2d2e] border border-[#3e3e42] rounded text-left transition-colors"
              >
                <div className="font-semibold text-white">Next.js App</div>
                <div className="text-xs text-gray-500">App Router + TypeScript + TailwindCSS</div>
              </button>
              
              <button
                onClick={() => handleGenerateStructure('react-vite')}
                className="w-full p-3 bg-[#1e1e1e] hover:bg-[#2a2d2e] border border-[#3e3e42] rounded text-left transition-colors"
              >
                <div className="font-semibold text-white">React + Vite</div>
                <div className="text-xs text-gray-500">Vite + TypeScript + Zustand</div>
              </button>
              
              <button
                onClick={() => handleGenerateStructure('express-api')}
                className="w-full p-3 bg-[#1e1e1e] hover:bg-[#2a2d2e] border border-[#3e3e42] rounded text-left transition-colors"
              >
                <div className="font-semibold text-white">Express API</div>
                <div className="text-xs text-gray-500">Express + TypeScript + Prisma</div>
              </button>
            </div>            
            <button
              onClick={() => setShowAIDialog(false)}
              className="w-full p-2 bg-gray-600 hover:bg-gray-700 rounded text-white transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Context Menu */}
      {contextMenu && (
        <>
          <div 
            className="fixed inset-0 z-40" 
            onClick={() => setContextMenu(null)}
          />
          <div
            className="fixed z-50 bg-[#252526] border border-[#3e3e42] rounded shadow-lg py-1 min-w-[220px]"
            style={{ left: contextMenu.x, top: contextMenu.y }}
            onClick={(e) => e.stopPropagation()}
            onContextMenu={(e) => e.preventDefault()}
          >
            {/* Create Actions */}
            <button
              onClick={handleNewFileInContext}
              className="w-full px-4 py-2 text-left text-sm hover:bg-[#2a2d2e] flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New File
            </button>
            <button
              onClick={handleNewFolderInContext}
              className="w-full px-4 py-2 text-left text-sm hover:bg-[#2a2d2e] flex items-center gap-2"
            >
              <FolderPlus className="w-4 h-4" />
              New Folder
            </button>
            
            <div className="h-px bg-[#3e3e42] my-1" />
            
            {/* Edit Actions - só mostra se não for background */}
            {!contextMenu.isBackground && (
              <>
                <button
                  onClick={handleRename}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-[#2a2d2e] flex items-center gap-2"
                >
                  <Edit className="w-4 h-4" />
                  Rename
                </button>
                
                {/* Live Server - só para arquivos HTML */}
                {(contextMenu.path.endsWith('.html') || contextMenu.path.endsWith('.htm')) && (
                  <button
                    onClick={handleOpenWithLiveServer}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-[#2a2d2e] flex items-center gap-2 text-green-400"
                  >
                    <Globe className="w-4 h-4" />
                    Open with Live Server
                  </button>
                )}
                
                <div className="h-px bg-[#3e3e42] my-1" />
              </>
            )}
            
            {/* Copy Actions */}
            <button
              onClick={handleCopyPath}
              className="w-full px-4 py-2 text-left text-sm hover:bg-[#2a2d2e] flex items-center gap-2"
            >
              <Copy className="w-4 h-4" />
              Copy Path
            </button>
            <button
              onClick={handleCopyRelativePath}
              className="w-full px-4 py-2 text-left text-sm hover:bg-[#2a2d2e] flex items-center gap-2"
            >
              <FileText className="w-4 h-4" />
              Copy Relative Path
            </button>
            
            <div className="h-px bg-[#3e3e42] my-1" />
            
            {/* Reveal Actions */}
            <button
              onClick={handleRevealInFileManager}
              className="w-full px-4 py-2 text-left text-sm hover:bg-[#2a2d2e] flex items-center gap-2"
            >
              <Folder className="w-4 h-4" />
              Reveal in File Manager
            </button>
            <button
              onClick={handleOpenInIntegratedTerminal}
              className="w-full px-4 py-2 text-left text-sm hover:bg-[#2a2d2e] flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              Open in Integrated Terminal
            </button>
            
            <div className="h-px bg-[#3e3e42] my-1" />
            
            {/* Delete Action */}
            <button
              onClick={() => {
                handleDeleteSelected();
                setContextMenu(null);
              }}
              className="w-full px-4 py-2 text-left text-sm hover:bg-[#2a2d2e] flex items-center gap-2 text-red-400"
            >
              <Trash2 className="w-4 h-4" />
              Delete {selectedFiles.size > 1 ? `(${selectedFiles.size})` : ''}
            </button>
          </div>
        </>
      )}

      {/* Input Dialog */}
      {inputDialog && (
        <InputDialog
          title={inputDialog.title}
          placeholder={inputDialog.placeholder}
          defaultValue={inputDialog.defaultValue}
          onConfirm={handleInputDialogConfirm}
          onCancel={() => setInputDialog(null)}
        />
      )}
    </div>
  );
}
