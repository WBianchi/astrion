import Editor from '@monaco-editor/react';
import { useEditorStore } from '../store/editorStore';
import { X, AlertCircle, XCircle } from 'lucide-react';
import { useState, useEffect } from 'react';

export function CodeEditor() {
  const { currentFile, openFiles, updateFileContent, setCurrentFile, removeOpenFile, closeAllFiles } = useEditorStore();
  const [fileErrors, setFileErrors] = useState<Record<string, number>>({});

  const handleEditorChange = (value: string | undefined) => {
    if (currentFile && value !== undefined) {
      updateFileContent(currentFile.path, value);
    }
  };

  // Detecta a linguagem pelo arquivo
  const getLanguage = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    const languageMap: Record<string, string> = {
      'js': 'javascript',
      'jsx': 'javascript',
      'ts': 'typescript',
      'tsx': 'typescript',
      'py': 'python',
      'go': 'go',
      'rs': 'rust',
      'java': 'java',
      'cpp': 'cpp',
      'c': 'c',
      'cs': 'csharp',
      'html': 'html',
      'css': 'css',
      'scss': 'scss',
      'json': 'json',
      'md': 'markdown',
      'yaml': 'yaml',
      'yml': 'yaml',
      'xml': 'xml',
      'sql': 'sql',
      'sh': 'shell',
      'bash': 'shell',
    };
    return languageMap[ext || ''] || 'plaintext';
  };

  // Simula contagem de erros (pode ser integrado com Monaco depois)
  const countErrors = (content: string) => {
    // Detecta erros simples: console.log, debugger, TODO, FIXME
    const errorPatterns = [/console\.(log|error|warn)/g, /debugger/g, /\/\/\s*(TODO|FIXME)/gi];
    let count = 0;
    errorPatterns.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) count += matches.length;
    });
    return count;
  };

  // Atualiza contagem de erros quando arquivos mudam
  useEffect(() => {
    const errors: Record<string, number> = {};
    openFiles.forEach(file => {
      if (file.content) {
        errors[file.path] = countErrors(file.content);
      }
    });
    setFileErrors(errors);
  }, [openFiles]);

  return (
    <div className="h-full bg-[#1e1e1e] flex flex-col">
      {/* Barra de abas */}
      {openFiles.length > 0 && (
        <div className="flex items-center border-b border-[#3e3e42] bg-[#252526]">
          {/* Botão fechar todas */}
          {openFiles.length > 1 && (
            <button
              onClick={closeAllFiles}
              className="flex items-center gap-1 px-2 py-1.5 text-xs text-gray-400 hover:text-white hover:bg-red-900/30 border-r border-[#3e3e42] transition-colors"
              title="Fechar todas as abas"
            >
              <XCircle className="w-3.5 h-3.5" />
            </button>
          )}
          
          {/* Abas */}
          <div className="flex items-center gap-0.5 overflow-x-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 flex-1">
            {openFiles.map((file) => (
            <div
              key={file.path}
              onClick={() => setCurrentFile(file)}
              className={`flex items-center gap-2 px-2 py-1.5 text-xs cursor-pointer border-r border-[#3e3e42] hover:bg-[#2a2d2e] transition-colors min-w-0 flex-shrink-0 max-w-[120px] ${
                currentFile?.path === file.path ? 'bg-[#1e1e1e] text-white' : 'text-gray-400'
              }`}
            >
              <span className="truncate">{file.name}</span>
              
              {/* Contador de erros/warnings */}
              {fileErrors[file.path] > 0 && (
                <div className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-yellow-900/30 border border-yellow-500/30">
                  <AlertCircle className="w-3 h-3 text-yellow-500" />
                  <span className="text-xs text-yellow-500">{fileErrors[file.path]}</span>
                </div>
              )}
              
              {/* Botão fechar */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  removeOpenFile(file.path);
                }}
                className="hover:bg-[#3e3e42] rounded p-0.5 transition-colors"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}
          </div>
        </div>
      )}
      
      {/* Editor */}
      <div className="flex-1">
        {currentFile ? (
          <Editor
            height="100%"
            language={getLanguage(currentFile.name)}
            value={currentFile.content || ''}
            onChange={handleEditorChange}
            theme="vs-dark"
            options={{
              fontSize: 14,
              fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
              minimap: { enabled: true },
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              automaticLayout: true,
              tabSize: 2,
              insertSpaces: true,
              formatOnPaste: true,
              formatOnType: true,
            }}
          />
        ) : (
          <div className="flex items-center justify-center h-full text-gray-500">
            <p>Selecione um arquivo para editar</p>
          </div>
        )}
      </div>
    </div>
  );
}
