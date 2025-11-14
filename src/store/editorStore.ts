import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Message } from '../services/ollama';

export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  content?: string;
}

interface EditorStore {
  // Files
  currentFile: FileItem | null;
  openFiles: FileItem[];
  fileTree: FileItem[];
  workspacePath: string | null;
  
  // Chat
  messages: Message[];
  isAIThinking: boolean;
  currentModel: string;
  
  // UI
  sidebarOpen: boolean;
  chatOpen: boolean;
  terminalOpen: boolean;
  terminalOutput: string;
  activeSidebar: 'files' | 'models' | 'mcp' | 'apis' | 'themes' | 'rules' | null;
  
  // Code Stats (para mostrar diff visual)
  codeStats: {
    linesAdded: number;
    linesRemoved: number;
    linesModified: number;
  } | null;
  
  // Actions - Files
  setCurrentFile: (file: FileItem | null) => void;
  addOpenFile: (file: FileItem) => void;
  removeOpenFile: (path: string) => void;
  closeAllFiles: () => void;
  updateFileContent: (path: string, content: string) => void;
  setFileTree: (tree: FileItem[]) => void;
  setWorkspacePath: (path: string | null) => void;
  refreshFileTree: () => void;
  
  // Actions - Chat
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setIsAIThinking: (thinking: boolean) => void;
  setCurrentModel: (model: string) => void;
  
  // Actions - UI
  toggleSidebar: () => void;
  toggleChat: () => void;
  toggleTerminal: () => void;
  appendTerminalOutput: (output: string) => void;
  clearTerminalOutput: () => void;
  setActiveSidebar: (sidebar: 'files' | 'models' | 'mcp' | 'apis' | 'themes' | 'rules' | null) => void;
  setCodeStats: (stats: { linesAdded: number; linesRemoved: number; linesModified: number } | null) => void;
}

export const useEditorStore = create<EditorStore>()(
  persist(
    (set) => ({
  // Initial state - Files
  currentFile: null,
  openFiles: [],
  fileTree: [],
  workspacePath: null,
  
  // Initial state - Chat
  messages: [],
  isAIThinking: false,
  currentModel: 'glm4:9b',
  
  // Initial state - UI
  sidebarOpen: true,
  chatOpen: true,
  terminalOpen: false,
  terminalOutput: '',
  activeSidebar: 'files',
  codeStats: null,
  
  // Actions - Files
  setCurrentFile: (file) => set({ currentFile: file }),
  
  addOpenFile: (file) => set((state) => {
    if (state.openFiles.find(f => f.path === file.path)) {
      return state;
    }
    return { openFiles: [...state.openFiles, file] };
  }),
  
  removeOpenFile: (path) => set((state) => ({
    openFiles: state.openFiles.filter(f => f.path !== path),
    currentFile: state.currentFile?.path === path ? null : state.currentFile
  })),
  
  closeAllFiles: () => set({
    openFiles: [],
    currentFile: null
  }),
  
  updateFileContent: (path, content) => set((state) => ({
    openFiles: state.openFiles.map(f => 
      f.path === path ? { ...f, content } : f
    ),
    currentFile: state.currentFile?.path === path 
      ? { ...state.currentFile, content } 
      : state.currentFile
  })),
  
  setFileTree: (tree) => set({ fileTree: tree }),
  
  setWorkspacePath: (path) => set({ workspacePath: path }),
  
  refreshFileTree: () => {
    // Dispara evento customizado para o FileExplorer recarregar
    window.dispatchEvent(new CustomEvent('refresh-file-tree'));
  },
  
  // Actions - Chat
  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message]
  })),
  
  clearMessages: () => set({ messages: [] }),
  
  setIsAIThinking: (thinking) => set({ isAIThinking: thinking }),
  
  setCurrentModel: (model) => set({ currentModel: model }),
  
  // Actions - UI
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  
  toggleChat: () => set((state) => ({ chatOpen: !state.chatOpen })),
  
  toggleTerminal: () => set((state) => ({ terminalOpen: !state.terminalOpen })),
  
  appendTerminalOutput: (output) => set((state) => ({
    terminalOutput: state.terminalOutput + output
  })),
  
  clearTerminalOutput: () => set({ terminalOutput: '' }),
  
  setActiveSidebar: (sidebar) => set({ activeSidebar: sidebar }),
  
  setCodeStats: (stats) => set({ codeStats: stats }),
    }),
    {
      name: 'vyzer-editor-storage',
      partialize: (state) => ({
        messages: state.messages,
        workspacePath: state.workspacePath,
        currentModel: state.currentModel,
        openFiles: state.openFiles,
      }),
    }
  )
);
