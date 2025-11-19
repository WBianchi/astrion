import { useState, useRef, useEffect } from 'react';
import { Send, Loader2, Bot, Code2, Check, X, Image as ImageIcon, Mic, MicOff, Volume2, VolumeX, Square, Zap } from 'lucide-react';
import { useEditorStore } from '../store/editorStore';
import { ollamaService } from '../services/ollama';
import { executeAITool } from '../services/aiTools';
import { ttsService } from '../services/tts';
import { MessageBlock } from './MessageBlock';
import { useToast } from './Toast';
import { CodeStats } from './CodeStats';
import { useMCP } from '../hooks/useMCP';

interface PendingAction {
  id: string;
  action: string;
  path: string;
  content?: string;
  status: 'pending' | 'approved' | 'rejected';
}

// Aplica DIFF incremental a um arquivo
async function applyDiffToFile(filePath: string, diffContent: string) {
  try {
    // Lê o arquivo atual
    if (!window.electronAPI) {
      return { success: false, error: 'Electron API não disponível' };
    }
    
    const fileResult = await window.electronAPI.readFile(filePath);
    if (!fileResult.success || !fileResult.content) {
      return { success: false, error: 'Não foi possível ler o arquivo' };
    }
    
    let fileContent = fileResult.content;
    
    // Parse do DIFF: extrai blocos SEARCH/REPLACE
    const diffBlocks = diffContent.split('<<<<<<< SEARCH');
    
    let linesAdded = 0;
    let linesRemoved = 0;
    let linesModified = 0;
    
    for (let i = 1; i < diffBlocks.length; i++) {
      const block = diffBlocks[i];
      const parts = block.split('=======');
      
      if (parts.length !== 2) continue;
      
      const searchPart = parts[0].trim();
      const replacePart = parts[1].split('>>>>>>> REPLACE')[0].trim();
      
      // Conta mudanças
      const searchLines = searchPart.split('\n').length;
      const replaceLines = replacePart.split('\n').length;
      
      if (searchLines === replaceLines) {
        linesModified += searchLines;
      } else if (replaceLines > searchLines) {
        linesAdded += (replaceLines - searchLines);
        linesModified += searchLines;
      } else {
        linesRemoved += (searchLines - replaceLines);
        linesModified += replaceLines;
      }
      
      // Aplica substituição
      fileContent = fileContent.replace(searchPart, replacePart);
    }
    
    // Salva arquivo modificado
    const writeResult = await window.electronAPI.writeFile(filePath, fileContent);
    
    if (writeResult.success) {
      // Atualiza CodeStats
      const { setCodeStats } = useEditorStore.getState();
      setCodeStats({ linesAdded, linesRemoved, linesModified });
      
      console.log(`✅ DIFF aplicado: +${linesAdded} -${linesRemoved} ~${linesModified}`);
      
      return { 
        success: true, 
        stats: { linesAdded, linesRemoved, linesModified }
      };
    }
    
    return writeResult;
  } catch (error) {
    console.error('❌ Erro ao aplicar DIFF:', error);
    return { success: false, error: String(error) };
  }
}

// Processa ações do coder agent
async function processCoderActions(response: string): Promise<boolean> {
  // Regex que captura ACTION, PATH, e CONTENT ou DIFF
  const actionRegex = /<ACTION>(.*?)<\/ACTION>\s*<PATH>(.*?)<\/PATH>(?:\s*(?:<CONTENT>([\s\S]*?)<\/CONTENT>|<DIFF>([\s\S]*?)<\/DIFF>))?/g;
  const matches = [...response.matchAll(actionRegex)];
  
  console.log(`🔍 Encontradas ${matches.length} ações para processar`);
  
  if (matches.length === 0) {
    console.log('⚠️ Nenhuma ação encontrada na resposta');
    console.log('📝 Resposta completa:', response);
    return false;
  }
  
  let hasReadFile = false;

  for (let i = 0; i < matches.length; i++) {
    const match = matches[i];
    const [, action, path, content, diff] = match;
    
    console.log(`🤖 [${i + 1}/${matches.length}] Executando ação:`, { 
      action: action.trim(), 
      path: path.trim(), 
      hasContent: !!content,
      hasDiff: !!diff,
      contentLength: content?.length || 0,
      diffLength: diff?.length || 0
    });

    try {
      let result;
      switch (action.trim()) {
        case 'read_file':
          // Lê o arquivo e retorna o conteúdo
          if (window.electronAPI) {
            const fileContent = await window.electronAPI.readFile(path.trim());
            if (fileContent.success && fileContent.content) {
              console.log(`📖 Arquivo lido: ${path.trim()} (${fileContent.content.length} chars)`);
              // Adiciona o conteúdo do arquivo ao contexto da conversa
              const { addMessage } = useEditorStore.getState();
              addMessage({
                role: 'system',
                content: `Conteúdo de ${path.trim()}:\n\`\`\`\n${fileContent.content}\n\`\`\``
              });
              hasReadFile = true;
            } else {
              console.error('❌ Erro ao ler arquivo:', fileContent.error);
            }
          }
          break;
          
        case 'create_file':
          // Cria arquivo vazio primeiro
          await executeAITool('create_file', { path: path.trim(), content: '' });
          
          // Abre o arquivo no editor
          const { setCurrentFile, addOpenFile, refreshFileTree } = useEditorStore.getState();
          const filePath = path.trim();
          const fileName = filePath.split('/').pop() || '';
          
          const fileItem = {
            name: fileName,
            path: filePath,
            isDirectory: false
          };
          
          setCurrentFile(fileItem);
          addOpenFile(fileItem);
          
          // Atualiza o FileExplorer automaticamente
          if (refreshFileTree) {
            refreshFileTree();
          }
          
          // Escreve o conteúdo (live coding DESABILITADO por padrão para evitar 429)
          if (content?.trim()) {
            const ENABLE_LIVE_CODING = false; // Mude para true se quiser live coding
            const lines = content.trim().split('\n');
            const MAX_LINES_FOR_LIVE_CODING = 20; // Limite reduzido
            
            // Live coding só para arquivos MUITO pequenos (se habilitado)
            if (ENABLE_LIVE_CODING && lines.length <= MAX_LINES_FOR_LIVE_CODING) {
              console.log(`✨ Live coding ativado (${lines.length} linhas)`);
              let currentContent = '';
              
              for (let i = 0; i < lines.length; i++) {
                currentContent += (i > 0 ? '\n' : '') + lines[i];
                
                // Atualiza o arquivo com delay para efeito de digitação
                await executeAITool('edit_file', { path: filePath, content: currentContent });
                
                // Delay de 150ms entre linhas (reduz carga no Ollama)
                await new Promise(resolve => setTimeout(resolve, 150));
              }
            } else {
              // Cria arquivo completo de uma vez (padrão)
              console.log(`⚡ Criando arquivo completo (${lines.length} linhas)`);
              await executeAITool('edit_file', { path: filePath, content: content.trim() });
            }
            
            result = { success: true };
          } else {
            result = await executeAITool('create_file', { path: filePath, content: '' });
          }
          break;
        case 'create_directory':
          result = await executeAITool('create_directory', { path: path.trim() });
          
          // Atualiza o FileExplorer automaticamente
          const { refreshFileTree: refreshAfterDir } = useEditorStore.getState();
          if (refreshAfterDir) {
            refreshAfterDir();
          }
          break;
        case 'list_directory':
          result = await executeAITool('list_directory', { path: path.trim() });
          break;
        case 'delete_file':
          result = await executeAITool('delete_file', { path: path.trim() });
          break;
        case 'run_command':
          result = await executeAITool('run_command', { command: content?.trim() || '', cwd: path.trim() });
          break;
        case 'search_web':
          result = await executeAITool('search_web', { query: content?.trim() || path.trim() });
          break;
          
        case 'edit_file':
          // Edição com DIFF (incremental) ou CONTENT (completo)
          if (diff) {
            // Modo DIFF: aplica mudanças incrementais
            console.log('📝 Aplicando DIFF incremental...');
            result = await applyDiffToFile(path.trim(), diff.trim());
          } else if (content) {
            // Modo CONTENT: reescreve arquivo completo
            console.log('📝 Reescrevendo arquivo completo...');
            result = await executeAITool('edit_file', { path: path.trim(), content: content.trim() });
          }
          break;
          
        case 'edit_file_full':
          // Sempre reescreve o arquivo completo
          result = await executeAITool('edit_file', { path: path.trim(), content: content?.trim() || '' });
          break;
      }

      if (result?.success) {
        console.log('✅ Ação executada com sucesso:', action);
        
        // Adiciona feedback visual na mensagem
        const currentMessages = useEditorStore.getState().messages;
        const lastMessage = currentMessages[currentMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          let feedback = '';
          switch (action.trim()) {
            case 'create_file':
              feedback = `\n\n✅ Arquivo criado: ${path.trim()}`;
              break;
            case 'create_directory':
              feedback = `\n\n✅ Pasta criada: ${path.trim()}`;
              break;
            case 'run_command':
              feedback = `\n\n✅ Comando executado: ${content?.trim()}`;
              if (result.result?.stdout) feedback += `\n\nOutput:\n${result.result.stdout}`;
              break;
            case 'edit_file':
              feedback = `\n\n✅ Arquivo editado: ${path.trim()}`;
              break;
          }
          lastMessage.content += feedback;
          useEditorStore.setState({ messages: [...currentMessages] });
        }
        
        // Recarrega file tree se necessário
        if (window.electronAPI && ['create_file', 'create_directory', 'delete_file'].includes(action.trim())) {
          const workspacePath = useEditorStore.getState().workspacePath;
          if (workspacePath) {
            const dirResult = await window.electronAPI.readDirectory(workspacePath);
            if (dirResult.success) {
              useEditorStore.getState().setFileTree(dirResult.files || []);
            }
          }
        }
      } else {
        console.error('❌ Erro ao executar ação:', result?.error);
        
        // Adiciona erro na mensagem
        const currentMessages = useEditorStore.getState().messages;
        const lastMessage = currentMessages[currentMessages.length - 1];
        if (lastMessage && lastMessage.role === 'assistant') {
          lastMessage.content += `\n\n❌ Erro: ${result?.error}`;
          useEditorStore.setState({ messages: [...currentMessages] });
        }
      }
    } catch (error) {
      console.error('❌ Erro ao processar ação:', error);
    }
  }
  
  return hasReadFile;
}

export function AIChat() {
  const [input, setInput] = useState('');
  const [selectedModel, setSelectedModel] = useState('kimi-k2-thinking:cloud');
  const [modelType, setModelType] = useState<'chat' | 'coder' | 'image'>('coder'); // Coder como padrão
  const [modelSource, setModelSource] = useState<'local' | 'api'>('local');
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [pendingActions, setPendingActions] = useState<PendingAction[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [isTTSEnabled, setIsTTSEnabled] = useState(true);
  const [recognition, setRecognition] = useState<any>(null);
  const [abortController, setAbortController] = useState<AbortController | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Code stats do store (para mostrar diff visual)
  const codeStats = useEditorStore((state) => state.codeStats);
  
  const { showToast, ToastContainer } = useToast();
  
  // MCPs
  const { connectedServers, callTool, getAllTools, isServerConnected } = useMCP();
  
  const { 
    messages, 
    isAIThinking, 
    workspacePath,
    openFiles,
    addMessage, 
    clearMessages, 
    setIsAIThinking,
    setCurrentModel
  } = useEditorStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Fecha modais ao clicar fora
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      
      // Fecha seletor de modelo se clicar fora
      if (showModelSelector && !target.closest('.model-selector-dropdown') && !target.closest('.model-selector-button')) {
        setShowModelSelector(false);
      }
      
      // Fecha histórico se clicar fora
      if (showHistory && !target.closest('.history-dropdown') && !target.closest('.history-button')) {
        setShowHistory(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showModelSelector, showHistory]);

  // Inicializa reconhecimento de voz
  useEffect(() => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition || (window as any).SpeechRecognition;
      const recognitionInstance = new SpeechRecognition();
      recognitionInstance.continuous = true;
      recognitionInstance.interimResults = true;
      recognitionInstance.lang = 'pt-BR';

      recognitionInstance.onresult = (event: any) => {
        let transcript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setInput(transcript);
      };

      recognitionInstance.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        setIsRecording(false);
      };

      recognitionInstance.onend = () => {
        setIsRecording(false);
      };

      setRecognition(recognitionInstance);
    }
  }, []);

  const toggleRecording = () => {
    if (!recognition) {
      showToast('Reconhecimento de voz não suportado neste navegador', 'error');
      return;
    }

    if (isRecording) {
      recognition.stop();
      setIsRecording(false);
    } else {
      recognition.start();
      setIsRecording(true);
    }
  };

  // Executa comando no terminal
  const handleExecuteCommand = async (command: string) => {
    console.log('🚀 Executando comando:', command);
    
    // Abre o terminal se não estiver aberto
    const { terminalOpen, toggleTerminal } = useEditorStore.getState();
    if (!terminalOpen) {
      console.log('📂 Abrindo terminal...');
      toggleTerminal();
      showToast('Terminal aberto', 'info');
    }

    // Aguarda um pouco para o terminal abrir e dispara evento
    setTimeout(() => {
      console.log('📤 Disparando evento execute-terminal-command');
      const event = new CustomEvent('execute-terminal-command', {
        detail: { command }
      });
      window.dispatchEvent(event);
      showToast(`Executando: ${command.substring(0, 50)}${command.length > 50 ? '...' : ''}`, 'success');
    }, terminalOpen ? 50 : 300); // Mais tempo se precisar abrir o terminal
  };

  const handleStop = () => {
    if (abortController) {
      abortController.abort();
      setAbortController(null);
      setIsAIThinking(false);
      showToast('🛑 IA pausada', 'info');
      
      // Adiciona mensagem de parada
      const currentMessages = useEditorStore.getState().messages;
      const lastMessage = currentMessages[currentMessages.length - 1];
      if (lastMessage && lastMessage.role === 'assistant') {
        lastMessage.content += '\n\n⚠️ *Geração interrompida pelo usuário*';
        useEditorStore.setState({ messages: [...currentMessages] });
      }
    }
  };

  const toggleTTS = () => {
    const newState = !isTTSEnabled;
    setIsTTSEnabled(newState);
    showToast(newState ? '🔊 TTS ativado' : '🔇 TTS desativado', 'info');
  };

  const handleSend = async () => {
    if (!input.trim() || isAIThinking) return;

    // Adiciona contexto do workspace à mensagem
    let contextualInput = input;
    if (workspacePath && messages.length === 0) {
      // Primeira mensagem: adiciona contexto do workspace
      contextualInput = `📁 Workspace: ${workspacePath}\n📂 Arquivos abertos: ${openFiles.map(f => f.name).join(', ') || 'nenhum'}\n\n${input}`;
    }

    const userMessage = { role: 'user' as const, content: contextualInput };
    addMessage(userMessage);
    setInput('');
    setIsAIThinking(true);
    
    // Cria novo AbortController
    const controller = new AbortController();
    setAbortController(controller);

    try {
      if (modelSource === 'api') {
        // TODO: Implementar chamada para APIs externas
        addMessage({ 
          role: 'assistant', 
          content: '⚠️ API externa ainda não implementada. Use modelos locais (Ollama) por enquanto.' 
        });
        setIsAIThinking(false);
        return;
      }

      let aiResponse = '';
      addMessage({ role: 'assistant', content: '' });

      // Define o modelo antes de fazer a chamada
      ollamaService.setModel(selectedModel);

      // Carrega regras do localStorage
      const aiRulesText = localStorage.getItem('ai-rules-text') || '';

      // Adiciona mensagem de sistema com contexto permanente
      let systemContent = `Você é um assistente de código trabalhando no workspace: ${workspacePath || 'não definido'}. Sempre considere este contexto ao responder.${aiRulesText}`;
      
      // Se estiver no modo coder, adiciona instruções sobre tools
      if (modelType === 'coder') {
        systemContent += `\n\nVocê é um CODER AGENT que pode executar ações automaticamente!

**FERRAMENTAS DISPONÍVEIS:**

1. **LER ARQUIVO** (use SEMPRE antes de editar):
<ACTION>read_file</ACTION>
<PATH>${workspacePath || '/workspace'}/caminho/arquivo.ext</PATH>

2. **CRIAR ARQUIVO**:
<ACTION>create_file</ACTION>
<PATH>${workspacePath || '/workspace'}/nome-do-arquivo.ext</PATH>
<CONTENT>
conteúdo do arquivo aqui
</CONTENT>

3. **EDITAR ARQUIVO (MODO DIFF - PREFERIDO)**:
Use DIFF para editar apenas as partes necessárias (mais eficiente):
<ACTION>edit_file</ACTION>
<PATH>${workspacePath || '/workspace'}/arquivo.ext</PATH>
<DIFF>
<<<<<<< SEARCH
código antigo exato que será substituído
=======
código novo que vai substituir
>>>>>>> REPLACE
</DIFF>

Exemplo de múltiplas edições no mesmo arquivo:
<ACTION>edit_file</ACTION>
<PATH>${workspacePath || '/workspace'}/Footer.tsx</PATH>
<DIFF>
<<<<<<< SEARCH
import React from 'react';
import styled from 'styled-components';
=======
import { Send, MessageCircle } from 'lucide-react';
>>>>>>> REPLACE

<<<<<<< SEARCH
const Footer: React.FC = () => {
=======
export default function Footer() {
>>>>>>> REPLACE
</DIFF>

4. **EDITAR ARQUIVO (MODO COMPLETO)**:
Use apenas se precisar reescrever o arquivo inteiro:
<ACTION>edit_file_full</ACTION>
<PATH>${workspacePath || '/workspace'}/arquivo.ext</PATH>
<CONTENT>
conteúdo completo do arquivo
</CONTENT>

4. **CRIAR PASTA**:
<ACTION>create_directory</ACTION>
<PATH>${workspacePath || '/workspace'}/nome-da-pasta</PATH>

5. **EXECUTAR COMANDO**:
<ACTION>run_command</ACTION>
<PATH>${workspacePath || '/workspace'}</PATH>
<CONTENT>
pnpm install tailwindcss
</CONTENT>

6. **BUSCAR NA WEB**:
<ACTION>search_web</ACTION>
<PATH>query de busca</PATH>

IMPORTANTE:
- Use SEMPRE o caminho completo começando com ${workspacePath || '/workspace'}
- Coloque o conteúdo COMPLETO do arquivo entre <CONTENT> e </CONTENT>
- **CADA AÇÃO DEVE TER SUAS PRÓPRIAS TAGS**: Não misture ações!
- **ORDEM CORRETA**: <ACTION> → <PATH> → <CONTENT> (se necessário)
- **CRIE MÚLTIPLOS ARQUIVOS DE UMA VEZ**: Se o usuário pedir "HTML, CSS e JS", crie os 3 arquivos na MESMA resposta!
- **EXEMPLO DE MÚLTIPLOS ARQUIVOS**:
  
  <ACTION>create_directory</ACTION>
  <PATH>${workspacePath || '/workspace'}/erp</PATH>
  
  <ACTION>create_file</ACTION>
  <PATH>${workspacePath || '/workspace'}/erp/index.html</PATH>
  <CONTENT>
  <!DOCTYPE html>
  <html>...</html>
  </CONTENT>
  
  <ACTION>create_file</ACTION>
  <PATH>${workspacePath || '/workspace'}/erp/style.css</PATH>
  <CONTENT>
  body { margin: 0; }
  </CONTENT>
  
  <ACTION>create_file</ACTION>
  <PATH>${workspacePath || '/workspace'}/erp/script.js</PATH>
  <CONTENT>
  console.log('Hello');
  </CONTENT>

- **NUNCA coloque múltiplas ações dentro de um único bloco <ACTION>**
- Após executar as ações, confirme o que foi feito
- NÃO apenas descreva, EXECUTE usando as tags!
- NÃO crie apenas 1 arquivo e espere, crie TODOS de uma vez!`;
      }
      
      const systemMessage = {
        role: 'system' as const,
        content: systemContent
      };

      // Limita contexto para evitar sobrecarga (últimas 10 mensagens)
      const MAX_CONTEXT_MESSAGES = 10;
      const recentMessages = messages.slice(-MAX_CONTEXT_MESSAGES);
      
      console.log(`📊 Contexto: ${recentMessages.length} mensagens (de ${messages.length} totais)`);

      // Usa o modelo selecionado com throttling
      let lastUpdateTime = 0;
      const UPDATE_INTERVAL = 100; // Atualiza no máximo a cada 100ms
      
      await ollamaService.chat(
        [systemMessage, ...recentMessages, userMessage],
        (chunk) => {
          aiResponse += chunk;
          
          // Throttling: só atualiza UI a cada 100ms
          const now = Date.now();
          if (now - lastUpdateTime >= UPDATE_INTERVAL) {
            lastUpdateTime = now;
            
            // Atualiza a última mensagem com o chunk
            const currentMessages = useEditorStore.getState().messages;
            const lastMessage = currentMessages[currentMessages.length - 1];
            if (lastMessage.role === 'assistant') {
              lastMessage.content = aiResponse;
              useEditorStore.setState({ messages: [...currentMessages] });
            }
          }
        }
      );
      
      // Atualização final para garantir que todo o conteúdo foi exibido
      const currentMessages = useEditorStore.getState().messages;
      const lastMessage = currentMessages[currentMessages.length - 1];
      if (lastMessage.role === 'assistant') {
        lastMessage.content = aiResponse;
        useEditorStore.setState({ messages: [...currentMessages] });
      }

      // Se estiver no modo coder, processa ações
      if (modelType === 'coder') {
        const hasReadFile = await processCoderActions(aiResponse);
        
        // Se leu arquivo, faz a IA continuar analisando
        if (hasReadFile) {
          console.log('📚 Arquivo lido! IA vai continuar analisando...');
          
          // Adiciona prompt para IA continuar
          const { addMessage } = useEditorStore.getState();
          addMessage({
            role: 'user',
            content: 'Agora que você leu o arquivo, por favor analise e corrija os erros encontrados.'
          });
          
          // Chama IA novamente para analisar
          setTimeout(() => {
            handleSend();
          }, 500);
        }
      }
      
      // TTS: Fala a resposta no modo chat (não no coder)
      if (modelType === 'chat' && isTTSEnabled && aiResponse.trim()) {
        // Remove tags de ação e markdown para falar apenas o texto
        const cleanText = aiResponse
          .replace(/<ACTION>[\s\S]*?<\/ACTION>/g, '')
          .replace(/<PATH>[\s\S]*?<\/PATH>/g, '')
          .replace(/<CONTENT>[\s\S]*?<\/CONTENT>/g, '')
          .replace(/```[\s\S]*?```/g, '') // Remove blocos de código
          .replace(/`[^`]+`/g, '') // Remove código inline
          .replace(/[#*_~]/g, '') // Remove markdown
          .trim();
        
        if (cleanText.length > 0 && cleanText.length < 5000) {
          // Limita a 5000 caracteres para não gastar muito
          ttsService.speak(cleanText);
        }
      }
    } catch (error: any) {
      console.error('Error sending message:', error);
      
      let errorMessage = 'Desculpe, ocorreu um erro ao processar sua mensagem.';
      
      if (error.message?.includes('Failed to fetch')) {
        errorMessage = '❌ Não foi possível conectar ao Ollama.\n\nVerifique se o Ollama está rodando:\n• Terminal: ollama serve\n• Ou: systemctl start ollama';
      } else if (error.message?.includes('404')) {
        errorMessage = `❌ Modelo "${selectedModel}" não encontrado.\n\nModelos disponíveis:\n• ollama list\n\nBaixar modelo:\n• ollama pull ${selectedModel}`;
      } else if (error.message) {
        errorMessage = `❌ Erro: ${error.message}`;
      }
      
      addMessage({ 
        role: 'assistant', 
        content: errorMessage
      });
    } finally {
      setIsAIThinking(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-l border-[#3e3e42]">
      {/* Code Stats - Mostra diff visual quando arquivo está sendo editado */}
      {codeStats && (
        <CodeStats 
          added={codeStats.linesAdded} 
          removed={codeStats.linesRemoved} 
          modified={codeStats.linesModified} 
        />
      )}
      
      {/* Header com Histórico e Seletor de Modelo */}
      <div className="flex items-center justify-between p-3 border-b border-[#3e3e42]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="history-button px-2 py-1 text-xs bg-[#2d2d30] text-gray-300 rounded-md border border-[#3e3e42] hover:bg-[#3e3e42] transition-colors"
          >
            📋 Histórico
          </button>
          <span className="text-xs text-gray-500">•</span>
          <span className="text-xs text-gray-300">Chat Atual</span>
          {messages.length > 20 && (
            <>
              <span className="text-xs text-gray-500">•</span>
              <button
                onClick={() => {
                  if (confirm(`Limpar ${messages.length} mensagens? Isso pode melhorar a performance.`)) {
                    clearMessages();
                  }
                }}
                className="px-2 py-1 text-xs bg-red-900/20 text-red-400 rounded-md border border-red-500/30 hover:bg-red-900/40 transition-colors"
                title="Limpar histórico para melhorar performance"
              >
                🗑️ Limpar ({messages.length})
              </button>
            </>
          )}
        </div>
        <button
          onClick={() => setShowModelSelector(!showModelSelector)}
          className="model-selector-button px-2 py-1 text-xs bg-[#2d2d30] text-blue-400 rounded-md border border-blue-500/30 hover:bg-[#3e3e42] transition-colors font-mono"
        >
          {selectedModel.split(':')[0]}
        </button>
      </div>

      {/* Model Selector Dropdown */}
      {showModelSelector && (
          <div className="model-selector-dropdown absolute top-14 right-3 z-50 bg-[#252526] border border-[#3e3e42] rounded-lg shadow-lg p-2 w-64">
          <div className="space-y-1 max-h-96 overflow-y-auto custom-scrollbar">
            {modelType !== 'image' ? (
              <>
                <div className="text-xs text-gray-400 px-2 py-1 font-semibold">🧠 Thinking Models</div>
                <button
                  onClick={() => {
                    setSelectedModel('kimi-k2-thinking:cloud');
                    setCurrentModel('kimi-k2-thinking:cloud');
                    setShowModelSelector(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-[#2d2d30] ${
                    selectedModel === 'kimi-k2-thinking:cloud' ? 'bg-blue-600 text-white' : 'text-gray-300'
                  }`}
                >
                  Kimi K2 Thinking Cloud
                </button>
                <button
                  onClick={() => {
                    setSelectedModel('glm-4.6:cloud');
                    setCurrentModel('glm-4.6:cloud');
                    setShowModelSelector(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-[#2d2d30] ${
                    selectedModel === 'glm-4.6:cloud' ? 'bg-blue-600 text-white' : 'text-gray-300'
                  }`}
                >
                  GLM-4.6 Cloud (Multimodal)
                </button>
                <button
                  onClick={() => {
                    setSelectedModel('deepseek-r1:latest');
                    setCurrentModel('deepseek-r1:latest');
                    setShowModelSelector(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-[#2d2d30] ${
                    selectedModel === 'deepseek-r1:latest' ? 'bg-blue-600 text-white' : 'text-gray-300'
                  }`}
                >
                  DeepSeek R1 (5.2GB)
                </button>
                
                <div className="text-xs text-gray-400 px-2 py-1 font-semibold mt-2">💻 Code Models</div>
                <button
                  onClick={() => {
                    setSelectedModel('qwen2.5-coder:1.5b-base');
                    setCurrentModel('qwen2.5-coder:1.5b-base');
                    setShowModelSelector(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-[#2d2d30] ${
                    selectedModel === 'qwen2.5-coder:1.5b-base' ? 'bg-blue-600 text-white' : 'text-gray-300'
                  }`}
                >
                  Qwen 2.5 Coder 1.5B
                </button>
                <button
                  onClick={() => {
                    setSelectedModel('deepseek-coder:latest');
                    setCurrentModel('deepseek-coder:latest');
                    setShowModelSelector(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-[#2d2d30] ${
                    selectedModel === 'deepseek-coder:latest' ? 'bg-blue-600 text-white' : 'text-gray-300'
                  }`}
                >
                  DeepSeek Coder (776MB)
                </button>
              </>
            ) : (
              <>
                <div className="text-xs text-gray-400 px-2 py-1 font-semibold">🎨 Modelos Locais</div>
                <button
                  onClick={() => {
                    setSelectedModel('stable-diffusion');
                    setCurrentModel('stable-diffusion');
                    setShowModelSelector(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-[#2d2d30] ${
                    selectedModel === 'stable-diffusion' ? 'bg-blue-600 text-white' : 'text-gray-300'
                  }`}
                >
                  Stable Diffusion (Local)
                </button>
                <button
                  onClick={() => {
                    setSelectedModel('flux');
                    setCurrentModel('flux');
                    setShowModelSelector(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-[#2d2d30] ${
                    selectedModel === 'flux' ? 'bg-blue-600 text-white' : 'text-gray-300'
                  }`}
                >
                  Flux (Local)
                </button>
                
                <div className="text-xs text-gray-400 px-2 py-1 font-semibold mt-2">☁️ APIs Online</div>
                <button
                  onClick={() => {
                    setSelectedModel('dall-e-3');
                    setCurrentModel('dall-e-3');
                    setShowModelSelector(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-[#2d2d30] ${
                    selectedModel === 'dall-e-3' ? 'bg-blue-600 text-white' : 'text-gray-300'
                  }`}
                >
                  DALL-E 3 (OpenAI)
                </button>
                <button
                  onClick={() => {
                    setSelectedModel('midjourney');
                    setCurrentModel('midjourney');
                    setShowModelSelector(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-[#2d2d30] ${
                    selectedModel === 'midjourney' ? 'bg-blue-600 text-white' : 'text-gray-300'
                  }`}
                >
                  Midjourney (API)
                </button>
                <button
                  onClick={() => {
                    setSelectedModel('leonardo-ai');
                    setCurrentModel('leonardo-ai');
                    setShowModelSelector(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-[#2d2d30] ${
                    selectedModel === 'leonardo-ai' ? 'bg-blue-600 text-white' : 'text-gray-300'
                  }`}
                >
                  Leonardo AI (API)
                </button>
                <button
                  onClick={() => {
                    setSelectedModel('grok-image');
                    setCurrentModel('grok-image');
                    setShowModelSelector(false);
                  }}
                  className={`w-full text-left px-2 py-1.5 text-xs rounded hover:bg-[#2d2d30] ${
                    selectedModel === 'grok-image' ? 'bg-blue-600 text-white' : 'text-gray-300'
                  }`}
                >
                  Grok Image (xAI)
                </button>
              </>
            )}
          </div>
        </div>
      )}

      {/* History Sidebar */}
      {showHistory && (
        <div className="history-dropdown absolute top-14 left-3 z-50 bg-[#252526] border border-[#3e3e42] rounded-lg shadow-lg p-3 w-64">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-semibold text-white">Histórico de Chats</h3>
            <button
              onClick={() => setShowHistory(false)}
              className="text-gray-400 hover:text-white"
            >
              ✕
            </button>
          </div>
          <div className="space-y-1 max-h-96 overflow-y-auto">
            <button
              onClick={() => {
                clearMessages();
                setShowHistory(false);
              }}
              className="w-full text-left px-2 py-2 text-xs rounded hover:bg-[#2d2d30] text-gray-300 border border-dashed border-gray-600"
            >
              + Novo Chat
            </button>
            <div className="text-xs text-gray-500 px-2 py-1 mt-2">
              Nenhum histórico salvo ainda
            </div>
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p className="text-sm">Olá! Como posso ajudar você hoje?</p>
            <p className="text-xs mt-2">Posso criar arquivos, editar código, executar comandos e muito mais.</p>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <MessageBlock
              content={message.content}
              isUser={message.role === 'user'}
              onExecuteCommand={message.role === 'assistant' ? handleExecuteCommand : undefined}
            />
          </div>
        ))}

        {isAIThinking && (
          <div className="flex justify-start">
            <div className="bg-[#2d2d30] text-gray-200 rounded-lg p-3">
              <Loader2 className="w-4 h-4 animate-spin" />
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Pending Actions Panel - igual Windsurf */}
      {pendingActions.length > 0 && (
        <div className="border-t border-[#3e3e42] p-3 bg-[#252526]">
          <div className="text-xs font-semibold text-gray-400 mb-2">Ações Pendentes</div>
          <div className="space-y-2">
            {pendingActions.map((action) => (
              <div key={action.id} className="bg-[#2d2d30] rounded-lg p-3 border border-[#3e3e42]">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="text-xs font-semibold text-white mb-1">
                      {action.action === 'create_file' && '📄 Criar Arquivo'}
                      {action.action === 'create_directory' && '📁 Criar Pasta'}
                      {action.action === 'edit_file' && '✏️ Editar Arquivo'}
                      {action.action === 'run_command' && '⚡ Executar Comando'}
                    </div>
                    <div className="text-xs text-gray-400 font-mono">{action.path}</div>
                    {action.content && (
                      <div className="mt-2 text-xs text-gray-300 bg-[#1e1e1e] p-2 rounded max-h-20 overflow-y-auto">
                        <pre className="whitespace-pre-wrap">{action.content.substring(0, 200)}...</pre>
                      </div>
                    )}
                  </div>
                  <div className="flex gap-1 ml-2">
                    <button
                      onClick={() => {
                        // Aprovar ação
                        setPendingActions(prev => prev.map(a => 
                          a.id === action.id ? { ...a, status: 'approved' } : a
                        ));
                      }}
                      className="p-1.5 bg-green-600 hover:bg-green-700 rounded text-white transition-colors"
                      title="Aceitar"
                    >
                      <Check className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => {
                        // Rejeitar ação
                        setPendingActions(prev => prev.filter(a => a.id !== action.id));
                      }}
                      className="p-1.5 bg-red-600 hover:bg-red-700 rounded text-white transition-colors"
                      title="Rejeitar"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                <div className="text-xs text-gray-500">
                  💡 Revise antes de aceitar
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Input - Minimalista igual Windsurf */}
      <div className="p-3 border-t border-[#3e3e42]">
        {/* Mode Selector - Compacto com borda roxa */}
        <div className="flex items-center gap-2 mb-2">
          <button
            onClick={() => setModelType('chat')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors border ${
              modelType === 'chat'
                ? 'bg-purple-600 text-white border-purple-500'
                : 'text-gray-400 hover:bg-[#2d2d30] border-[#3e3e42]'
            }`}
          >
            <Bot className="w-3 h-3" />
            Chat
          </button>
          <button
            onClick={() => setModelType('coder')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors border ${
              modelType === 'coder'
                ? 'bg-purple-600 text-white border-purple-500'
                : 'text-gray-400 hover:bg-[#2d2d30] border-[#3e3e42]'
            }`}
          >
            <Code2 className="w-3 h-3" />
            Coder
          </button>
          <button
            onClick={() => setModelType('image')}
            className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors border ${
              modelType === 'image'
                ? 'bg-purple-600 text-white border-purple-500'
                : 'text-gray-400 hover:bg-[#2d2d30] border-[#3e3e42]'
            }`}
          >
            <ImageIcon className="w-3 h-3" />
            Image
          </button>
          <div className="flex-1" />
          <span className="text-xs text-gray-500">{selectedModel.split(':')[0]}</span>
        </div>

        {/* Input Area */}
        <div className="relative">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={isRecording ? "🎤 Ouvindo..." : "Ask anything..."}
            className="w-full bg-[#2d2d30] text-white rounded-lg pl-3 pr-20 py-2.5 text-sm resize-none focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder-gray-500"
            rows={1}
            disabled={isAIThinking}
            style={{ minHeight: '38px', maxHeight: '120px' }}
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex gap-1">
            {/* Indicador MCPs */}
            {connectedServers.length > 0 && (
              <div 
                className="flex items-center gap-1 px-2 py-1 rounded-md bg-cyan-900/20 border border-cyan-500/30"
                title={`${connectedServers.length} MCP(s) conectado(s): ${connectedServers.map(s => s.name).join(', ')}`}
              >
                <Zap className="w-3 h-3 text-cyan-400" />
                <span className="text-xs text-cyan-400">{connectedServers.length}</span>
              </div>
            )}
            
            {/* Botão TTS */}
            {isTTSEnabled !== undefined && (
              <button
                onClick={toggleTTS}
                disabled={isAIThinking}
                className={`p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                  isTTSEnabled 
                    ? 'bg-green-600/20 hover:bg-green-600/30 text-green-400' 
                    : 'hover:bg-[#3e3e42] text-gray-400'
                }`}
                title={isTTSEnabled ? "TTS Ativado (clique para desativar)" : "TTS Desativado (clique para ativar)"}
              >
                {isTTSEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            )}
            
            {/* Botão de gravação de voz */}
            <button
              onClick={toggleRecording}
              disabled={isAIThinking}
              className={`p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed ${
                isRecording 
                  ? 'bg-red-600 hover:bg-red-700 text-white' 
                  : 'hover:bg-[#3e3e42] text-gray-400'
              }`}
              title={isRecording ? "Parar gravação" : "Gravar áudio"}
            >
              {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>
            
            {/* Botão de STOP (quando IA está pensando) */}
            {isAIThinking && (
              <button
                onClick={handleStop}
                className="p-1.5 rounded-md transition-colors hover:bg-red-900/30 border border-red-500/50"
                title="Parar geração (Ctrl+C)"
              >
                <Square className="w-4 h-4 text-red-500 fill-red-500" />
              </button>
            )}
            
            {/* Botão de enviar */}
            {!isAIThinking && (
              <button
                onClick={handleSend}
                disabled={!input.trim()}
                className="p-1.5 rounded-md transition-colors disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[#3e3e42]"
              >
                <Send className="w-4 h-4 text-blue-500" />
              </button>
            )}
          </div>
        </div>
      </div>
      
      {/* Toast Notifications */}
      <ToastContainer />
    </div>
  );
}
