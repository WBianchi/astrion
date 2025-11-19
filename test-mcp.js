#!/usr/bin/env node

/**
 * Script de teste manual para MCPs
 * Uso: node test-mcp.js [mcp-name]
 * 
 * Exemplos:
 *   node test-mcp.js puppeteer
 *   node test-mcp.js filesystem
 *   node test-mcp.js memory
 */

const { spawn } = require('child_process');
const readline = require('readline');

// Configurações dos MCPs
const MCP_CONFIGS = {
  puppeteer: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-puppeteer'],
    testCommands: [
      { method: 'tools/list', params: {} },
      { method: 'tools/call', params: { name: 'puppeteer_navigate', arguments: { url: 'https://example.com' } } },
      { method: 'tools/call', params: { name: 'puppeteer_screenshot', arguments: { name: 'test' } } },
    ]
  },
  filesystem: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-filesystem', process.cwd()],
    testCommands: [
      { method: 'tools/list', params: {} },
      { method: 'tools/call', params: { name: 'list_directory', arguments: { path: '.' } } },
    ]
  },
  memory: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-memory'],
    testCommands: [
      { method: 'tools/list', params: {} },
      { method: 'tools/call', params: { name: 'create_entities', arguments: { 
        entities: [{ name: 'test', entityType: 'test', observations: ['test'] }] 
      } } },
    ]
  },
  git: {
    command: 'npx',
    args: ['-y', '@modelcontextprotocol/server-git', '--repository', process.cwd()],
    testCommands: [
      { method: 'tools/list', params: {} },
      { method: 'tools/call', params: { name: 'git_status', arguments: { repo_path: '.' } } },
    ]
  },
};

// Pega o nome do MCP da linha de comando
const mcpName = process.argv[2] || 'puppeteer';
const config = MCP_CONFIGS[mcpName];

if (!config) {
  console.error(`❌ MCP "${mcpName}" não encontrado!`);
  console.log('\n📋 MCPs disponíveis:', Object.keys(MCP_CONFIGS).join(', '));
  process.exit(1);
}

console.log(`\n🧪 Testando MCP: ${mcpName}`);
console.log(`📦 Comando: ${config.command} ${config.args.join(' ')}\n`);

// Inicia o servidor MCP
const server = spawn(config.command, config.args, {
  stdio: ['pipe', 'pipe', 'inherit']
});

let messageId = 1;
const pendingRequests = new Map();

// Processa mensagens do servidor
const rl = readline.createInterface({
  input: server.stdout,
  crlfDelay: Infinity
});

rl.on('line', (line) => {
  try {
    const message = JSON.parse(line);
    console.log('📥 Recebido:', JSON.stringify(message, null, 2));
    
    if (message.id && pendingRequests.has(message.id)) {
      const resolve = pendingRequests.get(message.id);
      pendingRequests.delete(message.id);
      resolve(message);
    }
  } catch (error) {
    console.error('❌ Erro ao parsear resposta:', line);
  }
});

// Envia mensagem JSON-RPC
function sendMessage(method, params = {}) {
  return new Promise((resolve) => {
    const id = messageId++;
    const message = {
      jsonrpc: '2.0',
      id,
      method,
      params
    };
    
    console.log('\n📤 Enviando:', JSON.stringify(message, null, 2));
    server.stdin.write(JSON.stringify(message) + '\n');
    pendingRequests.set(id, resolve);
  });
}

// Aguarda servidor iniciar
setTimeout(async () => {
  try {
    // 1. Inicializa
    console.log('\n🔌 1. Inicializando conexão...');
    await sendMessage('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: {
        name: 'test-client',
        version: '1.0.0'
      }
    });

    // 2. Executa comandos de teste
    for (const cmd of config.testCommands) {
      console.log(`\n🧪 Testando: ${cmd.method}`);
      await sendMessage(cmd.method, cmd.params);
      await new Promise(resolve => setTimeout(resolve, 2000)); // Aguarda 2s
    }

    console.log('\n✅ Testes concluídos!');
    
  } catch (error) {
    console.error('\n❌ Erro nos testes:', error);
  } finally {
    console.log('\n🛑 Encerrando servidor...');
    server.kill();
    process.exit(0);
  }
}, 2000);

// Tratamento de erros
server.on('error', (error) => {
  console.error('❌ Erro ao iniciar servidor:', error);
  process.exit(1);
});

server.on('exit', (code) => {
  console.log(`\n🛑 Servidor encerrado com código: ${code}`);
  process.exit(code || 0);
});
