import { useState } from 'react';
import { Copy, Check, Play } from 'lucide-react';

interface MessageBlockProps {
  content: string;
  isUser: boolean;
  onExecuteCommand?: (command: string) => void;
}

export function MessageBlock({ content, isUser, onExecuteCommand }: MessageBlockProps) {
  const [copiedBlocks, setCopiedBlocks] = useState<Set<number>>(new Set());

  // Detecta blocos de código
  const parseContent = () => {
    const parts: Array<{ type: 'text' | 'code'; content: string; language?: string; index: number }> = [];
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g;
    let lastIndex = 0;
    let match;
    let blockIndex = 0;

    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Adiciona texto antes do bloco de código
      if (match.index > lastIndex) {
        parts.push({
          type: 'text',
          content: content.substring(lastIndex, match.index),
          index: blockIndex++
        });
      }

      // Adiciona bloco de código
      parts.push({
        type: 'code',
        content: match[2].trim(),
        language: match[1] || 'bash',
        index: blockIndex++
      });

      lastIndex = match.index + match[0].length;
    }

    // Adiciona texto restante
    if (lastIndex < content.length) {
      parts.push({
        type: 'text',
        content: content.substring(lastIndex),
        index: blockIndex
      });
    }

    return parts.length > 0 ? parts : [{ type: 'text' as const, content, index: 0 }];
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedBlocks(prev => new Set(prev).add(index));
    setTimeout(() => {
      setCopiedBlocks(prev => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }, 2000);
  };

  const handleExecute = (command: string) => {
    if (onExecuteCommand) {
      onExecuteCommand(command);
    }
  };

  const isExecutableCommand = (language: string) => {
    return ['bash', 'sh', 'shell', 'zsh', 'fish'].includes(language.toLowerCase());
  };

  const parts = parseContent();

  return (
    <div
      className={`max-w-[80%] rounded-lg p-3 ${
        isUser
          ? 'bg-blue-600 text-white'
          : 'bg-[#2d2d30] text-gray-200'
      }`}
    >
      {parts.map((part, idx) => {
        if (part.type === 'text') {
          return (
            <pre key={idx} className="whitespace-pre-wrap text-sm font-sans">
              {part.content}
            </pre>
          );
        }

        // Bloco de código
        const isCopied = copiedBlocks.has(part.index);
        const canExecute = part.language && isExecutableCommand(part.language);

        return (
          <div key={idx} className="my-2 rounded-lg overflow-hidden border border-[#3e3e42]">
            {/* Header do bloco de código */}
            <div className="flex items-center justify-between bg-[#1e1e1e] px-3 py-2 border-b border-[#3e3e42]">
              <span className="text-xs text-gray-400 font-mono">{part.language}</span>
              <div className="flex gap-2">
                {/* Botão Copiar */}
                <button
                  onClick={() => handleCopy(part.content, part.index)}
                  className="flex items-center gap-1 px-2 py-1 text-xs bg-[#2d2d30] hover:bg-[#3e3e42] rounded transition-colors"
                  title="Copiar código"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-3 h-3 text-green-400" />
                      <span className="text-green-400">Copiado!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-3 h-3" />
                      <span>Copiar</span>
                    </>
                  )}
                </button>

                {/* Botão Executar (só para comandos shell) */}
                {canExecute && onExecuteCommand && (
                  <button
                    onClick={() => handleExecute(part.content)}
                    className="flex items-center gap-1 px-2 py-1 text-xs bg-blue-600 hover:bg-blue-700 rounded transition-colors"
                    title="Executar no terminal"
                  >
                    <Play className="w-3 h-3" />
                    <span>Executar</span>
                  </button>
                )}
              </div>
            </div>

            {/* Conteúdo do código */}
            <pre
              className="p-3 text-sm font-mono overflow-x-auto bg-[#1e1e1e] text-gray-300"
              style={{ fontFamily: "'Cascadia Code', 'Fira Code', 'JetBrains Mono', 'Consolas', monospace" }}
            >
              {part.content}
            </pre>
          </div>
        );
      })}
    </div>
  );
}
