import { CodeEditor } from './components/CodeEditor';
import { AIChat } from './components/AIChat';
import { useEditorStore } from './store/editorStore';
import { PanelLeft, MessageSquare, Terminal as TerminalIcon } from 'lucide-react';

function App() {
  const { chatOpen, toggleChat } = useEditorStore();

  return (
    <div className="flex h-screen bg-[#1e1e1e] text-white overflow-hidden">
      {/* Sidebar - File Explorer (implementar depois) */}
      <div className="w-12 bg-[#252526] border-r border-[#3e3e42] flex flex-col items-center py-4 gap-4">
        <button className="p-2 hover:bg-[#3e3e42] rounded transition-colors">
          <PanelLeft className="w-5 h-5" />
        </button>
        <button 
          onClick={toggleChat}
          className={`p-2 hover:bg-[#3e3e42] rounded transition-colors ${chatOpen ? 'bg-[#3e3e42]' : ''}`}
        >
          <MessageSquare className="w-5 h-5" />
        </button>
        <button className="p-2 hover:bg-[#3e3e42] rounded transition-colors">
          <TerminalIcon className="w-5 h-5" />
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* Editor */}
        <div className={`${chatOpen ? 'w-2/3' : 'w-full'} transition-all duration-300`}>
          <CodeEditor />
        </div>

        {/* AI Chat Panel */}
        {chatOpen && (
          <div className="w-1/3 min-w-[400px]">
            <AIChat />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
