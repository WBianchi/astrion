// MCPs funcionam via IPC com o main process do Electron
const isElectron = typeof window !== 'undefined' && (window as any).electronAPI;

export interface MCPServer {
  name: string;
  command: string;
  args: string[];
  status: 'connected' | 'disconnected' | 'error';
  client?: any;
  transport?: any;
}

export class MCPService {
  private servers: Map<string, MCPServer> = new Map();
  private readonly STORAGE_KEY = 'astrion-mcp-servers';

  constructor() {
    // Carrega servidores salvos do localStorage
    this.loadFromStorage();
  }

  private loadFromStorage() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const servers = JSON.parse(saved) as MCPServer[];
        servers.forEach(server => {
          // Marca como disconnected ao carregar
          server.status = 'disconnected';
          this.servers.set(server.name, server);
        });
        console.log(`📦 Carregados ${servers.length} MCPs do storage`);
      }
    } catch (error) {
      console.error('❌ Erro ao carregar MCPs do storage:', error);
    }
  }

  private saveToStorage() {
    try {
      const servers = Array.from(this.servers.values()).map(s => ({
        name: s.name,
        command: s.command,
        args: s.args,
        status: s.status
      }));
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(servers));
    } catch (error) {
      console.error('❌ Erro ao salvar MCPs no storage:', error);
    }
  }

  /**
   * Conecta a um servidor MCP
   */
  async connectServer(server: MCPServer): Promise<void> {
    try {
      if (!isElectron) {
        throw new Error('MCPs só funcionam no Electron. Use: pnpm electron:dev');
      }
      
      console.log(`🔌 Conectando ao MCP: ${server.name}`);

      // Conecta via IPC (main process)
      const result = await (window as any).electronAPI.mcpConnect(server);
      
      if (!result.success) {
        throw new Error(result.error || 'Falha ao conectar');
      }

      // Atualiza o servidor
      server.status = 'connected';
      this.servers.set(server.name, server);
      this.saveToStorage();

      console.log(`✅ MCP ${server.name} conectado!`);
    } catch (error) {
      console.error(`❌ Erro ao conectar MCP ${server.name}:`, error);
      server.status = 'error';
      throw error;
    }
  }

  /**
   * Desconecta de um servidor MCP
   */
  async disconnectServer(serverName: string): Promise<void> {
    const server = this.servers.get(serverName);
    if (!server) return;

    try {
      // Desconecta via IPC
      await (window as any).electronAPI.mcpDisconnect(serverName);
      
      server.status = 'disconnected';
      this.servers.delete(serverName);
      this.saveToStorage();
      console.log(`🔌 MCP ${serverName} desconectado`);
    } catch (error) {
      console.error(`❌ Erro ao desconectar MCP ${serverName}:`, error);
    }
  }

  /**
   * Lista as tools disponíveis de um servidor
   */
  async listTools(serverName: string): Promise<any[]> {
    const server = this.servers.get(serverName);
    if (!server?.client) {
      throw new Error(`Servidor ${serverName} não conectado`);
    }

    try {
      const response = await server.client.listTools();
      return response.tools || [];
    } catch (error) {
      console.error(`❌ Erro ao listar tools do ${serverName}:`, error);
      return [];
    }
  }

  /**
   * Lista os resources disponíveis de um servidor
   */
  async listResources(serverName: string): Promise<any[]> {
    const server = this.servers.get(serverName);
    if (!server?.client) {
      throw new Error(`Servidor ${serverName} não conectado`);
    }

    try {
      const response = await server.client.listResources();
      return response.resources || [];
    } catch (error) {
      console.error(`❌ Erro ao listar resources do ${serverName}:`, error);
      return [];
    }
  }

  /**
   * Chama uma tool de um servidor MCP
   */
  async callTool(serverName: string, toolName: string, args: any): Promise<any> {
    const server = this.servers.get(serverName);
    if (!server?.client) {
      throw new Error(`Servidor ${serverName} não conectado`);
    }

    try {
      console.log(`🔧 Chamando tool ${toolName} no ${serverName}`);
      const response = await server.client.callTool({
        name: toolName,
        arguments: args,
      });
      return response;
    } catch (error) {
      console.error(`❌ Erro ao chamar tool ${toolName}:`, error);
      throw error;
    }
  }

  /**
   * Lê um resource de um servidor MCP
   */
  async readResource(serverName: string, uri: string): Promise<any> {
    const server = this.servers.get(serverName);
    if (!server?.client) {
      throw new Error(`Servidor ${serverName} não conectado`);
    }

    try {
      const response = await server.client.readResource({ uri });
      return response;
    } catch (error) {
      console.error(`❌ Erro ao ler resource ${uri}:`, error);
      throw error;
    }
  }

  /**
   * Obtém todos os servidores conectados
   */
  getConnectedServers(): MCPServer[] {
    return Array.from(this.servers.values());
  }

  /**
   * Verifica se um servidor está conectado
   */
  isConnected(serverName: string): boolean {
    const server = this.servers.get(serverName);
    return server?.status === 'connected';
  }
}

// Singleton
export const mcpService = new MCPService();
