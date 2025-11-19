/**
 * Serviço para gerenciar e executar tools dos MCPs
 */

export interface MCPTool {
  name: string;
  description: string;
  inputSchema: any;
  serverName: string;
}

export interface ToolCall {
  toolName: string;
  serverName: string;
  args: any;
}

export interface ToolResult {
  success: boolean;
  result?: any;
  error?: string;
}

class MCPToolsService {
  private availableTools: Map<string, MCPTool[]> = new Map();

  /**
   * Atualiza lista de tools disponíveis de um servidor
   */
  async updateServerTools(serverName: string): Promise<void> {
    if (!window.electronAPI) {
      console.warn('⚠️ Electron API não disponível');
      return;
    }

    try {
      const response = await window.electronAPI.mcpListTools(serverName);
      
      if (response.success && response.tools) {
        const tools = response.tools.map((tool: any) => ({
          name: tool.name,
          description: tool.description || '',
          inputSchema: tool.inputSchema || {},
          serverName
        }));
        
        this.availableTools.set(serverName, tools);
        console.log(`🔧 ${serverName}: ${tools.length} tools disponíveis`);
      }
    } catch (error) {
      console.error(`❌ Erro ao listar tools de ${serverName}:`, error);
    }
  }

  /**
   * Retorna todas as tools disponíveis de todos os servidores
   */
  getAllTools(): MCPTool[] {
    const allTools: MCPTool[] = [];
    
    for (const tools of this.availableTools.values()) {
      allTools.push(...tools);
    }
    
    return allTools;
  }

  /**
   * Retorna tools de um servidor específico
   */
  getServerTools(serverName: string): MCPTool[] {
    return this.availableTools.get(serverName) || [];
  }

  /**
   * Busca uma tool pelo nome
   */
  findTool(toolName: string): MCPTool | undefined {
    for (const tools of this.availableTools.values()) {
      const tool = tools.find(t => t.name === toolName);
      if (tool) return tool;
    }
    return undefined;
  }

  /**
   * Executa uma tool
   */
  async executeTool(toolCall: ToolCall): Promise<ToolResult> {
    if (!window.electronAPI) {
      return {
        success: false,
        error: 'Electron API não disponível'
      };
    }

    try {
      console.log(`🔧 Executando ${toolCall.toolName} no ${toolCall.serverName}`);
      
      const response = await window.electronAPI.mcpCallTool(
        toolCall.serverName,
        toolCall.toolName,
        toolCall.args
      );

      if (response.success) {
        console.log(`✅ ${toolCall.toolName} executado com sucesso`);
        return {
          success: true,
          result: response.result
        };
      } else {
        console.error(`❌ Erro ao executar ${toolCall.toolName}:`, response.error);
        return {
          success: false,
          error: response.error
        };
      }
    } catch (error: any) {
      console.error(`❌ Erro ao executar tool:`, error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Gera descrição das tools para o system prompt
   */
  generateToolsPrompt(): string {
    const allTools = this.getAllTools();
    
    if (allTools.length === 0) {
      return '';
    }

    let prompt = '\n\n## 🔧 FERRAMENTAS DISPONÍVEIS (MCPs)\n\n';
    prompt += 'Você tem acesso às seguintes ferramentas através dos MCPs:\n\n';

    // Agrupa por servidor
    const byServer = new Map<string, MCPTool[]>();
    allTools.forEach(tool => {
      if (!byServer.has(tool.serverName)) {
        byServer.set(tool.serverName, []);
      }
      byServer.get(tool.serverName)!.push(tool);
    });

    // Gera descrição por servidor
    for (const [serverName, tools] of byServer.entries()) {
      prompt += `### ${serverName} (${tools.length} tools)\n\n`;
      
      tools.forEach(tool => {
        prompt += `- **${tool.name}**: ${tool.description}\n`;
        
        // Adiciona schema de input se disponível
        if (tool.inputSchema?.properties) {
          const params = Object.keys(tool.inputSchema.properties).join(', ');
          prompt += `  - Parâmetros: ${params}\n`;
        }
      });
      
      prompt += '\n';
    }

    prompt += '### 📝 COMO USAR AS FERRAMENTAS\n\n';
    prompt += 'Para usar uma ferramenta, use o formato:\n';
    prompt += '```xml\n';
    prompt += '<tool_call>\n';
    prompt += '  <server>NomeDoServidor</server>\n';
    prompt += '  <tool>nome_da_tool</tool>\n';
    prompt += '  <args>{"param1": "valor1", "param2": "valor2"}</args>\n';
    prompt += '</tool_call>\n';
    prompt += '```\n\n';
    prompt += '**IMPORTANTE:**\n';
    prompt += '- Use as ferramentas quando apropriado para a tarefa\n';
    prompt += '- Explique o que está fazendo antes de usar a ferramenta\n';
    prompt += '- Aguarde o resultado antes de continuar\n';
    prompt += '- Interprete e apresente os resultados de forma clara\n\n';

    return prompt;
  }

  /**
   * Parseia tool calls do texto da IA
   */
  parseToolCalls(text: string): ToolCall[] {
    const toolCalls: ToolCall[] = [];
    const regex = /<tool_call>\s*<server>(.*?)<\/server>\s*<tool>(.*?)<\/tool>\s*<args>(.*?)<\/args>\s*<\/tool_call>/gs;
    
    let match;
    while ((match = regex.exec(text)) !== null) {
      try {
        const serverName = match[1].trim();
        const toolName = match[2].trim();
        const argsStr = match[3].trim();
        
        let args = {};
        if (argsStr) {
          args = JSON.parse(argsStr);
        }
        
        toolCalls.push({
          serverName,
          toolName,
          args
        });
      } catch (error) {
        console.error('❌ Erro ao parsear tool call:', error);
      }
    }
    
    return toolCalls;
  }

  /**
   * Remove tool calls do texto
   */
  removeToolCalls(text: string): string {
    return text.replace(/<tool_call>[\s\S]*?<\/tool_call>/g, '').trim();
  }

  /**
   * Limpa todas as tools
   */
  clear(): void {
    this.availableTools.clear();
  }
}

export const mcpToolsService = new MCPToolsService();
