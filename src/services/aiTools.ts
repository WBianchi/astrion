// Tools que a IA pode usar para manipular arquivos
export interface AITool {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, any>;
    required: string[];
  };
}

export const aiTools: AITool[] = [
  {
    name: 'create_file',
    description: 'Cria um novo arquivo com conteúdo. Use quando o usuário pedir para criar um arquivo.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Caminho completo do arquivo a ser criado (ex: /workspace/index.html)'
        },
        content: {
          type: 'string',
          description: 'Conteúdo do arquivo'
        }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'edit_file',
    description: 'Edita um arquivo existente substituindo seu conteúdo. Use quando o usuário pedir para modificar um arquivo.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Caminho completo do arquivo a ser editado'
        },
        content: {
          type: 'string',
          description: 'Novo conteúdo do arquivo'
        }
      },
      required: ['path', 'content']
    }
  },
  {
    name: 'read_file',
    description: 'Lê o conteúdo de um arquivo. Use quando precisar ver o conteúdo atual de um arquivo.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Caminho completo do arquivo a ser lido'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'create_directory',
    description: 'Cria um novo diretório. Use quando o usuário pedir para criar uma pasta.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Caminho completo do diretório a ser criado'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'list_directory',
    description: 'Lista arquivos e pastas em um diretório. Use quando precisar ver o que existe em uma pasta.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Caminho do diretório a ser listado'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'delete_file',
    description: 'Deleta um arquivo ou diretório. Use com cuidado, apenas quando o usuário pedir explicitamente.',
    parameters: {
      type: 'object',
      properties: {
        path: {
          type: 'string',
          description: 'Caminho completo do arquivo ou diretório a ser deletado'
        }
      },
      required: ['path']
    }
  },
  {
    name: 'run_command',
    description: 'Executa um comando no terminal (pnpm install, npm install, pip install, docker, etc). Use para instalar dependências ou executar comandos.',
    parameters: {
      type: 'object',
      properties: {
        command: {
          type: 'string',
          description: 'Comando a ser executado (ex: "pnpm install react", "pip install flask", "docker build .")'
        },
        cwd: {
          type: 'string',
          description: 'Diretório onde executar o comando (opcional, usa workspace por padrão)'
        }
      },
      required: ['command']
    }
  },
  {
    name: 'search_web',
    description: 'Pesquisa informações na internet. Use quando precisar de informações atualizadas ou documentação.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Termo de busca (ex: "tailwind css documentation", "react hooks tutorial")'
        }
      },
      required: ['query']
    }
  }
];

// Executa um tool chamado pela IA
export async function executeAITool(
  toolName: string,
  args: Record<string, any>
): Promise<{ success: boolean; result?: any; error?: string }> {
  if (!window.electronAPI) {
    return { success: false, error: 'Electron API not available' };
  }

  try {
    switch (toolName) {
      case 'create_file':
        const createResult = await window.electronAPI.createFile(args.path);
        if (createResult.success) {
          const writeResult = await window.electronAPI.writeFile(args.path, args.content);
          return writeResult;
        }
        return createResult;

      case 'edit_file':
        return await window.electronAPI.writeFile(args.path, args.content);

      case 'read_file':
        return await window.electronAPI.readFile(args.path);

      case 'create_directory':
        return await window.electronAPI.createDirectory(args.path);

      case 'list_directory':
        return await window.electronAPI.readDirectory(args.path);

      case 'delete_file':
        return await window.electronAPI.deletePath(args.path);

      case 'run_command':
        // Executa comando no terminal
        if (window.electronAPI.executeCommand) {
          return await window.electronAPI.executeCommand(args.command, args.cwd);
        }
        return { success: false, error: 'executeCommand not available' };

      case 'search_web':
        // Busca na web usando API
        try {
          const response = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(args.query)}&format=json`);
          const data = await response.json();
          return { success: true, result: data };
        } catch (error: any) {
          return { success: false, error: error.message };
        }

      default:
        return { success: false, error: `Unknown tool: ${toolName}` };
    }
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// Formata tools para o formato do Ollama
export function formatToolsForOllama() {
  return aiTools.map(tool => ({
    name: tool.name,
    description: tool.description,
    parameters: tool.parameters
  }));
}
