import { useState, useEffect } from 'react';
import { mcpService, type MCPServer } from '../services/mcpService';

/**
 * Hook para gerenciar MCPs
 */
export function useMCP() {
  const [connectedServers, setConnectedServers] = useState<MCPServer[]>([]);
  const [availableTools, setAvailableTools] = useState<Map<string, any[]>>(new Map());

  // Atualiza lista de servidores conectados
  useEffect(() => {
    const interval = setInterval(() => {
      const servers = mcpService.getConnectedServers();
      setConnectedServers(servers);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  // Carrega tools disponíveis quando servidores conectam
  useEffect(() => {
    const loadTools = async () => {
      const toolsMap = new Map<string, any[]>();

      for (const server of connectedServers) {
        if (server.status === 'connected') {
          try {
            const tools = await mcpService.listTools(server.name);
            toolsMap.set(server.name, tools);
          } catch (error) {
            console.error(`Erro ao carregar tools de ${server.name}:`, error);
          }
        }
      }

      setAvailableTools(toolsMap);
    };

    if (connectedServers.length > 0) {
      loadTools();
    }
  }, [connectedServers]);

  /**
   * Chama uma tool MCP
   */
  const callTool = async (serverName: string, toolName: string, args: any) => {
    try {
      const result = await mcpService.callTool(serverName, toolName, args);
      return result;
    } catch (error) {
      console.error(`Erro ao chamar tool ${toolName}:`, error);
      throw error;
    }
  };

  /**
   * Lê um resource MCP
   */
  const readResource = async (serverName: string, uri: string) => {
    try {
      const result = await mcpService.readResource(serverName, uri);
      return result;
    } catch (error) {
      console.error(`Erro ao ler resource ${uri}:`, error);
      throw error;
    }
  };

  /**
   * Obtém todas as tools disponíveis (flat)
   */
  const getAllTools = () => {
    const allTools: Array<{ server: string; tool: any }> = [];
    
    availableTools.forEach((tools, serverName) => {
      tools.forEach(tool => {
        allTools.push({ server: serverName, tool });
      });
    });

    return allTools;
  };

  /**
   * Verifica se um servidor está conectado
   */
  const isServerConnected = (serverName: string) => {
    return mcpService.isConnected(serverName);
  };

  return {
    connectedServers,
    availableTools,
    callTool,
    readResource,
    getAllTools,
    isServerConnected,
  };
}
