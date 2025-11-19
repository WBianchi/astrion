import { useState, useEffect } from 'react';
import { Server, Circle, RefreshCw, Zap, AlertCircle } from 'lucide-react';
import { mcpService, type MCPServer } from '../services/mcpService';
import { mcpToolsService } from '../services/mcpToolsService';
import { DEFAULT_MCP_SERVERS, ADVANCED_MCP_SERVERS, MCP_DESCRIPTIONS } from '../config/mcpServers';
import { useToast } from './Toast';

export function MCPServers() {
  const [servers, setServers] = useState<MCPServer[]>(
    DEFAULT_MCP_SERVERS.map(s => ({ ...s }))
  );
  const [advancedServers, setAdvancedServers] = useState<MCPServer[]>(
    ADVANCED_MCP_SERVERS.map(s => ({ ...s }))
  );
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);
  const { showToast, ToastContainer } = useToast();
  
  // Detecta se está no Electron
  const isElectron = typeof window !== 'undefined' && (window as any).electronAPI;

  // Carrega MCPs salvos e reconecta automaticamente
  useEffect(() => {
    const savedServers = mcpService.getConnectedServers();
    if (savedServers.length > 0) {
      console.log(`📦 Encontrados ${savedServers.length} MCPs salvos`);
      setServers(savedServers);
      
      // Reconecta automaticamente os que estavam conectados
      savedServers.forEach((server, index) => {
        if (server.status === 'connected') {
          console.log(`🔄 Reconectando ${server.name}...`);
          handleConnect(index);
        }
      });
    }
  }, []);

  // Conecta a um servidor MCP
  const handleConnect = async (index: number) => {
    const server = servers[index];
    setLoading(server.name);
    
    try {
      await mcpService.connectServer(server);
      const newServers = [...servers];
      newServers[index].status = 'connected';
      setServers(newServers);
      
      // Carrega tools do servidor
      await mcpToolsService.updateServerTools(server.name);
      const tools = mcpToolsService.getServerTools(server.name);
      showToast(`✅ ${server.name} conectado! ${tools.length} tools disponíveis`, 'success');
    } catch (error) {
      const newServers = [...servers];
      newServers[index].status = 'error';
      setServers(newServers);
      showToast(`❌ Erro ao conectar ${server.name}`, 'error');
      console.error(error);
    } finally {
      setLoading(null);
    }
  };

  // Desconecta de um servidor MCP
  const handleDisconnect = async (index: number) => {
    const server = servers[index];
    setLoading(server.name);
    
    try {
      await mcpService.disconnectServer(server.name);
      const newServers = [...servers];
      newServers[index].status = 'disconnected';
      setServers(newServers);
      showToast(`🔌 ${server.name} desconectado`, 'info');
    } catch (error) {
      showToast(`❌ Erro ao desconectar ${server.name}`, 'error');
      console.error(error);
    } finally {
      setLoading(null);
    }
  };


  // Toggle conexão
  const toggleServerStatus = async (index: number) => {
    const server = servers[index];
    if (server.status === 'connected') {
      await handleDisconnect(index);
    } else {
      await handleConnect(index);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400';
      case 'disconnected': return 'text-gray-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <>
      <ToastContainer />
      <div className="flex flex-col h-full bg-[#252526] border-r border-[#3e3e42]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3e3e42]">
        <span className="text-xs font-semibold text-gray-400 uppercase">MCP Servers</span>
        <span className="text-xs text-gray-500">Click to connect</span>
      </div>

      {/* Aviso se não estiver no Electron */}
      {!isElectron && (
        <div className="mx-3 my-2 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded-md">
          <div className="flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-500 flex-shrink-0 mt-0.5" />
            <div className="text-xs text-yellow-200">
              <p className="font-semibold mb-1">MCPs só funcionam no Electron</p>
              <p className="text-yellow-300/80">Execute: <code className="bg-black/30 px-1 rounded">pnpm electron:dev</code></p>
            </div>
          </div>
        </div>
      )}
      
      {/* Servers List */}
      <div className="flex-1 overflow-y-auto">
        {servers.length === 0 ? (
          <div className="p-4 text-sm text-gray-500 text-center">
            No MCP servers configured
          </div>
        ) : (
          <div className="py-1">
            {servers.map((server, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 hover:bg-[#2a2d2e] group"
              >
                <Server className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300 truncate">{server.name}</span>
                    <Circle 
                      className={`w-2 h-2 ${getStatusColor(server.status)} fill-current flex-shrink-0`}
                    />
                  </div>
                  <div className="text-xs text-gray-500 truncate">
                    {MCP_DESCRIPTIONS[server.name] || server.command}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {loading === server.name ? (
                    <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
                  ) : (
                    <button
                      onClick={() => toggleServerStatus(index)}
                      className="p-1 hover:bg-[#3e3e42] rounded"
                      title={server.status === 'connected' ? 'Disconnect' : 'Connect'}
                      disabled={loading !== null}
                    >
                      {server.status === 'connected' ? (
                        <Zap className="w-3 h-3 text-green-400" />
                      ) : server.status === 'error' ? (
                        <AlertCircle className="w-3 h-3 text-red-400" />
                      ) : (
                        <Circle className="w-3 h-3 text-gray-400" />
                      )}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-[#3e3e42] text-xs text-gray-500">
        {servers.filter(s => s.status === 'connected').length} / {servers.length} connected
      </div>
    </div>
    </>
  );
}
