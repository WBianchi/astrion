import type { MCPServer } from '../services/mcpService';

/**
 * Configuração dos servidores MCP disponíveis
 */
export const DEFAULT_MCP_SERVERS: Omit<MCPServer, 'client' | 'transport'>[] = [
  {
    name: 'Filesystem',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', '/tmp'],
    status: 'disconnected',
  },
  {
    name: 'Memory',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-memory'],
    status: 'disconnected',
  },
  {
    name: 'Sequential Thinking',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sequential-thinking'],
    status: 'disconnected',
  },
  {
    name: 'Git',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-git'],
    status: 'disconnected',
  },
  {
    name: 'Puppeteer',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-puppeteer'],
    status: 'disconnected',
  },
  {
    name: 'GitHub',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-github'],
    status: 'disconnected',
  },
];

/**
 * MCPs Avançados (requerem configuração adicional)
 */
export const ADVANCED_MCP_SERVERS: Omit<MCPServer, 'client' | 'transport'>[] = [
  {
    name: 'PostgreSQL',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-postgres'],
    status: 'disconnected',
  },
  {
    name: 'SQLite',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-sqlite'],
    status: 'disconnected',
  },
  {
    name: 'Brave Search',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-brave-search'],
    status: 'disconnected',
  },
  {
    name: 'Google Maps',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-google-maps'],
    status: 'disconnected',
  },
  {
    name: 'Slack',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-slack'],
    status: 'disconnected',
  },
  {
    name: 'AWS KB Retrieval',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-aws-kb-retrieval'],
    status: 'disconnected',
  },
  {
    name: 'Fetch',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-fetch'],
    status: 'disconnected',
  },
  {
    name: 'EverArt',
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-everart'],
    status: 'disconnected',
  },
];

/**
 * Descrições dos MCPs
 */
export const MCP_DESCRIPTIONS: Record<string, string> = {
  'Filesystem': 'Operações avançadas de arquivo e diretório',
  'Memory': 'Contexto persistente entre sessões',
  'Sequential Thinking': 'Raciocínio passo a passo estruturado',
  'Git': 'Operações Git (commit, push, pull, diff)',
  'Puppeteer': 'Automação de navegador web',
  'GitHub': 'Integração com GitHub (issues, PRs, repos)',
  'PostgreSQL': 'Queries e operações em PostgreSQL',
  'SQLite': 'Queries e operações em SQLite',
  'Brave Search': 'Busca na web via Brave Search API',
  'Google Maps': 'Geocoding e busca de lugares',
  'Slack': 'Integração com Slack (mensagens, canais)',
  'AWS KB Retrieval': 'Busca em Knowledge Base da AWS',
  'Fetch': 'Requisições HTTP e web scraping',
  'EverArt': 'Geração de imagens com IA',
};

/**
 * Ícones dos MCPs (usando Lucide React)
 */
export const MCP_ICONS: Record<string, string> = {
  'Filesystem': 'FolderOpen',
  'Memory': 'Brain',
  'Sequential Thinking': 'GitBranch',
  'Git': 'GitCommit',
  'Puppeteer': 'Chrome',
  'GitHub': 'Github',
  'PostgreSQL': 'Database',
  'SQLite': 'Database',
  'Brave Search': 'Search',
  'Google Maps': 'Map',
};
