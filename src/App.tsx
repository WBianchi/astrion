import { useState } from 'react';
import { CodeEditor } from './components/CodeEditor';
import { AIChat } from './components/AIChat';
import { Terminal } from './components/Terminal';
import { FileExplorer } from './components/FileExplorer';
import { LocalModels } from './components/LocalModels';
import { MCPServers } from './components/MCPServers';
import { ExternalAPIs } from './components/ExternalAPIs';
import { Themes } from './components/Themes';
import { AIRules } from './components/AIRules';
import { MenuBar } from './components/MenuBar';
import { useEditorStore } from './store/editorStore';
import { FolderOpen, MessageSquare, Terminal as TerminalIcon, Brain, Server, Cloud, Palette, Settings } from 'lucide-react';

function App() {
  const { 
    chatOpen, 
    terminalOpen, 
    activeSidebar,
    toggleChat, 
    toggleTerminal,
    setActiveSidebar 
  } = useEditorStore();

  const [chatWidth, setChatWidth] = useState(400); // Pixels
  const [terminalHeight, setTerminalHeight] = useState(256); // Pixels

  const handleSidebarClick = (sidebar: 'files' | 'models' | 'mcp' | 'apis' | 'themes' | 'rules') => {
    if (activeSidebar === sidebar) {
      setActiveSidebar(null);
    } else {
      setActiveSidebar(sidebar);
    }
  };

  // Resize do AIChat
  const handleChatResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startX = e.clientX;
    const startWidth = chatWidth;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = startX - moveEvent.clientX;
      const newWidth = Math.max(300, Math.min(800, startWidth + delta));
      setChatWidth(newWidth);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  // Resize do Terminal
  const handleTerminalResize = (e: React.MouseEvent) => {
    e.preventDefault();
    const startY = e.clientY;
    const startHeight = terminalHeight;

    const handleMouseMove = (moveEvent: MouseEvent) => {
      const delta = startY - moveEvent.clientY;
      const newHeight = Math.max(150, Math.min(600, startHeight + delta));
      setTerminalHeight(newHeight);
    };

    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };

    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  return (
    <div className="flex flex-col h-screen overflow-hidden" style={{ backgroundColor: 'var(--bg)', color: 'var(--text)' }}>
      {/* Menu Bar */}
      <MenuBar />
      
      {/* Main Layout */}
      <div className="flex flex-1 overflow-hidden">
      {/* Icon Bar */}
      <div className="w-12 flex flex-col items-center py-4 gap-2" style={{ backgroundColor: 'var(--bg-secondary)', borderRight: '1px solid var(--border)' }}>
        <button 
          onClick={() => handleSidebarClick('files')}
          className={`p-2 hover:bg-[#3e3e42] rounded transition-colors ${activeSidebar === 'files' ? 'bg-[#3e3e42]' : ''}`}
          title="Files"
        >
          <FolderOpen className="w-5 h-5" />
        </button>
        <button 
          onClick={() => handleSidebarClick('models')}
          className={`p-2 hover:bg-[#3e3e42] rounded transition-colors ${activeSidebar === 'models' ? 'bg-[#3e3e42]' : ''}`}
          title="Local Models"
        >
          <Brain className="w-5 h-5" />
        </button>
        <button 
          onClick={() => handleSidebarClick('themes')}
          className={`p-2 hover:bg-[#3e3e42] rounded transition-colors ${activeSidebar === 'themes' ? 'bg-[#3e3e42]' : ''}`}
          title="Themes"
        >
          <Palette className="w-5 h-5" />
        </button>
        
        <button 
          onClick={() => handleSidebarClick('mcp')}
          className={`p-2 hover:bg-[#3e3e42] rounded transition-colors ${activeSidebar === 'mcp' ? 'bg-[#3e3e42]' : ''}`}
          title="MCP Servers"
        >
          <Server className="w-5 h-5" />
        </button>
        <button 
          onClick={() => handleSidebarClick('apis')}
          className={`p-2 hover:bg-[#3e3e42] rounded transition-colors ${activeSidebar === 'apis' ? 'bg-[#3e3e42]' : ''}`}
          title="External APIs"
        >
          <Cloud className="w-5 h-5" />
        </button>
        <button 
          onClick={() => handleSidebarClick('rules')}
          className={`p-2 hover:bg-[#3e3e42] rounded transition-colors ${activeSidebar === 'rules' ? 'bg-[#3e3e42]' : ''}`}
          title="AI Rules"
        >
          <Settings className="w-5 h-5" />
        </button>
        
        <div className="flex-1" />
        
        <button 
          onClick={toggleChat}
          className={`p-2 hover:bg-[#3e3e42] rounded transition-colors ${chatOpen ? 'bg-[#3e3e42]' : ''}`}
          title="AI Chat"
        >
          <MessageSquare className="w-5 h-5" />
        </button>
        <button 
          onClick={toggleTerminal}
          className={`p-2 hover:bg-[#3e3e42] rounded transition-colors ${terminalOpen ? 'bg-[#3e3e42]' : ''}`}
          title="Terminal"
        >
          <TerminalIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Sidebar Content */}
      {activeSidebar && (
        <div className="w-64">
          {activeSidebar === 'files' && <FileExplorer />}
          {activeSidebar === 'models' && <LocalModels />}
          {activeSidebar === 'themes' && <Themes />}
          {activeSidebar === 'mcp' && <MCPServers />}
          {activeSidebar === 'apis' && <ExternalAPIs />}
          {activeSidebar === 'rules' && <AIRules />}
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Editor + Terminal Area */}
        <div className="flex-1 flex flex-col" style={{ width: chatOpen ? `calc(100% - ${chatWidth}px)` : '100%' }}>
          {/* Editor */}
          <div className="flex-1" style={{ height: terminalOpen ? `calc(100% - ${terminalHeight}px)` : '100%' }}>
            <CodeEditor />
          </div>

          {/* Terminal (só na área do editor) */}
          {terminalOpen && (
            <div className="relative" style={{ height: `${terminalHeight}px` }}>
              {/* Resize Handle */}
              <div
                onMouseDown={handleTerminalResize}
                className="absolute top-0 left-0 right-0 h-1 cursor-ns-resize hover:bg-blue-500 transition-colors z-10"
                title="Arraste para redimensionar"
              />
              <Terminal />
            </div>
          )}
        </div>

        {/* AI Chat Panel (sempre altura total) */}
        {chatOpen && (
          <div className="relative h-full" style={{ width: `${chatWidth}px` }}>
            {/* Resize Handle */}
            <div
              onMouseDown={handleChatResize}
              className="absolute top-0 left-0 bottom-0 w-1 cursor-ew-resize hover:bg-blue-500 transition-colors z-10"
              title="Arraste para redimensionar"
            />
            <AIChat />
          </div>
        )}
      </div>
      </div>
    </div>
  );
}

export default App;
