import { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';

// Converte códigos ANSI para cores HTML
const ansiToHtml = (text: string): string => {
  const ansiColors: { [key: string]: string } = {
    '30': '#000000', '31': '#cd3131', '32': '#0dbc79', '33': '#e5e510',
    '34': '#2472c8', '35': '#bc3fbc', '36': '#11a8cd', '37': '#e5e5e5',
    '90': '#666666', '91': '#f14c4c', '92': '#23d18b', '93': '#f5f543',
    '94': '#3b8eea', '95': '#d670d6', '96': '#29b8db', '97': '#ffffff',
  };
  
  return text
    .replace(/\x1b\[([0-9;]+)m/g, (_match, codes) => {
      const codeList = codes.split(';');
      if (codeList.includes('0')) return '</span>'; // Reset
      const colorCode = codeList.find((c: string) => ansiColors[c]);
      return colorCode ? `<span style="color: ${ansiColors[colorCode]}">` : '';
    })
    .replace(/\x1b\[0m/g, '</span>'); // Reset explícito
};

interface TerminalTab {
  id: string;
  name: string;
  output: string;
}

export function Terminal() {
  const [command, setCommand] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [terminals, setTerminals] = useState<TerminalTab[]>([
    { id: '1', name: 'Terminal 1', output: '' }
  ]);
  const [activeTerminalId, setActiveTerminalId] = useState('1');
  const outputRef = useRef<HTMLDivElement>(null);
  
  const { toggleTerminal, workspacePath } = useEditorStore();
  
  // Listener para executar comandos externos (do AIChat)
  useEffect(() => {
    const handleExternalCommand = (event: CustomEvent) => {
      const cmd = event.detail.command;
      if (cmd) {
        setCommand(cmd);
        // Executa o comando automaticamente
        setTimeout(() => {
          executeCommand(cmd);
        }, 100);
      }
    };

    window.addEventListener('execute-terminal-command' as any, handleExternalCommand);
    return () => window.removeEventListener('execute-terminal-command' as any, handleExternalCommand);
  }, [activeTerminalId, workspacePath]);
  
  const activeTerminal = terminals.find(t => t.id === activeTerminalId) || terminals[0];

  const scrollToBottom = () => {
    if (outputRef.current) {
      outputRef.current.scrollTop = outputRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [activeTerminal.output]);

  const appendOutput = (text: string) => {
    setTerminals(prev => prev.map(t => 
      t.id === activeTerminalId 
        ? { ...t, output: t.output + text }
        : t
    ));
  };

  const addNewTerminal = () => {
    const newId = String(terminals.length + 1);
    setTerminals([...terminals, {
      id: newId,
      name: `Terminal ${newId}`,
      output: ''
    }]);
    setActiveTerminalId(newId);
  };

  const closeTerminal = (id: string) => {
    if (terminals.length === 1) {
      toggleTerminal();
      return;
    }
    
    const newTerminals = terminals.filter(t => t.id !== id);
    setTerminals(newTerminals);
    
    if (activeTerminalId === id) {
      setActiveTerminalId(newTerminals[0].id);
    }
  };

  // Função para executar comando (usada internamente e externamente)
  const executeCommand = async (cmd: string) => {
    if (!cmd.trim() || isRunning) return;

    setIsRunning(true);
    const cwd = workspacePath || undefined;
    appendOutput(`$ ${cmd}\n`);

    try {
      // Se estiver no Electron, usa a API
      if (window.electronAPI) {
        const result = await window.electronAPI.executeCommand(cmd, cwd);
        if (result.success) {
          if (result.stdout) appendOutput(result.stdout);
          if (result.stderr) appendOutput(`❌ ${result.stderr}\n`);
        } else {
          appendOutput(`❌ Error: ${result.error}\n`);
        }
      } else {
        // Fallback para browser (simulação)
        appendOutput('Terminal commands only work in Electron mode.\n');
      }
    } catch (error) {
      appendOutput(`❌ Error: ${error}\n`);
    } finally {
      setIsRunning(false);
      setCommand('');
    }
  };

  const handleRunCommand = async () => {
    await executeCommand(command);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleRunCommand();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-t border-[#3e3e42]">
      {/* Tabs Header */}
      <div className="flex items-center bg-[#252526] border-b border-[#3e3e42]">
        <div className="flex flex-1 overflow-x-auto">
          {terminals.map(terminal => (
            <div
              key={terminal.id}
              className={`flex items-center gap-2 px-3 py-2 border-r border-[#3e3e42] cursor-pointer ${
                terminal.id === activeTerminalId ? 'bg-[#1e1e1e]' : 'hover:bg-[#2a2d2e]'
              }`}
              onClick={() => setActiveTerminalId(terminal.id)}
            >
              <span className="text-sm text-white">{terminal.name}</span>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  closeTerminal(terminal.id);
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addNewTerminal}
          className="px-3 py-2 text-gray-400 hover:text-white transition-colors"
          title="New Terminal"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Output */}
      <div
        ref={outputRef}
        className="flex-1 overflow-y-auto p-4 bg-[#1e1e1e] scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-transparent hover:scrollbar-thumb-gray-500"
        style={{ 
          fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
          fontSize: '13px',
          lineHeight: '1.5',
          scrollbarWidth: 'thin',
          scrollbarColor: '#4a4a4a transparent'
        }}
      >
        {activeTerminal.output ? (
          <div 
            className="whitespace-pre-wrap text-gray-300"
            dangerouslySetInnerHTML={{ __html: ansiToHtml(activeTerminal.output) }}
          />
        ) : (
          <pre className="whitespace-pre-wrap text-gray-500">
            Welcome to Astrion Terminal
            <br />
            Type any command (ls, cd, pnpm, npm, git, etc.)
            <br />
            <br />
          </pre>
        )}
      </div>

      {/* Input */}
      <div className="flex flex-col p-3 bg-[#1e1e1e] border-t border-[#3e3e42]">
        {workspacePath && (
          <div 
            className="text-xs text-blue-400 mb-2"
            style={{ fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace" }}
          >
            📁 {workspacePath.split('/').pop()}
          </div>
        )}
        <div className="flex items-center gap-2">
          <span 
            className="text-green-400 font-semibold"
            style={{ fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace" }}
          >
            ❯
          </span>
          <input
            type="text"
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type a command (ls, pnpm install, git status, etc.)"
            className="flex-1 bg-transparent text-white focus:outline-none placeholder-gray-600"
            style={{ 
              fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace",
              fontSize: '13px'
            }}
            disabled={isRunning}
            autoFocus
          />
          {isRunning && (
            <span className="text-yellow-400 text-xs animate-pulse">Running...</span>
          )}
        </div>
      </div>
    </div>
  );
}
