const { app, BrowserWindow, ipcMain, dialog } = require('electron');
const path = require('path');
const fs = require('fs').promises;
const { exec, spawn } = require('child_process');
const { promisify } = require('util');

const execAsync = promisify(exec);

// Importa SDK MCP (apenas no main process)
let Client, StdioClientTransport;
try {
  const { Client: MCPClient } = require('@modelcontextprotocol/sdk/client/index.js');
  const { StdioClientTransport: MCPTransport } = require('@modelcontextprotocol/sdk/client/stdio.js');
  Client = MCPClient;
  StdioClientTransport = MCPTransport;
  console.log('✅ MCP SDK carregado no main process');
} catch (error) {
  console.warn('⚠️ MCP SDK não disponível:', error.message);
}

let mainWindow;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: 'Astrion',
    icon: path.join(__dirname, '../public/coder.png'),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.cjs')
    },
    backgroundColor: '#1e1e1e',
    titleBarStyle: 'hidden',
    frame: false
  });

  // Em desenvolvimento, carrega do Vite
  if (process.env.NODE_ENV === 'development') {
    mainWindow.loadURL('http://localhost:5173');
    // Abre DevTools em janela separada para não interferir
    mainWindow.webContents.openDevTools({ mode: 'detach' });
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html'));
  }

  // Atalho F12 para toggle DevTools
  mainWindow.webContents.on('before-input-event', (event, input) => {
    if (input.key === 'F12' && input.type === 'keyDown') {
      if (mainWindow.webContents.isDevToolsOpened()) {
        mainWindow.webContents.closeDevTools();
      } else {
        mainWindow.webContents.openDevTools({ mode: 'detach' });
      }
    }
  });
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// IPC Handlers - File Operations
ipcMain.handle('read-file', async (event, filePath) => {
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return { success: true, content };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('write-file', async (event, filePath, content) => {
  try {
    await fs.writeFile(filePath, content, 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('read-directory', async (event, dirPath) => {
  try {
    console.log('🔍 [MAIN] Reading directory:', dirPath);
    
    // Verifica se o diretório existe
    const fsSync = require('fs');
    if (!fsSync.existsSync(dirPath)) {
      console.error('❌ [MAIN] Directory does not exist:', dirPath);
      return { success: false, error: 'Directory does not exist' };
    }
    
    const files = await fs.readdir(dirPath, { withFileTypes: true });
    console.log('🔍 [MAIN] Raw files found:', files.length);
    console.log('🔍 [MAIN] Files:', files.map(f => f.name));
    
    // Não filtra arquivos ocultos - mostra tudo
    const fileList = files.map(file => {
      const fullPath = path.join(dirPath, file.name);
      console.log('🔍 [MAIN] Processing:', file.name, 'isDir:', file.isDirectory());
      return {
        name: file.name,
        isDirectory: file.isDirectory(),
        path: fullPath
      };
    });
    
    console.log('🔍 [MAIN] Returning fileList:', fileList.length, 'items');
    if (fileList.length > 0) {
      console.log('🔍 [MAIN] First 3 items:', JSON.stringify(fileList.slice(0, 3), null, 2));
    }
    
    return { success: true, files: fileList };
  } catch (error) {
    console.error('❌ [MAIN] Error reading directory:', error);
    console.error('❌ [MAIN] Error stack:', error.stack);
    return { success: false, error: error.message };
  }
});

ipcMain.handle('create-file', async (event, filePath) => {
  try {
    await fs.writeFile(filePath, '', 'utf-8');
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('create-directory', async (event, dirPath) => {
  try {
    await fs.mkdir(dirPath, { recursive: true });
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

ipcMain.handle('delete-path', async (event, targetPath) => {
  try {
    const stats = await fs.stat(targetPath);
    if (stats.isDirectory()) {
      await fs.rm(targetPath, { recursive: true, force: true });
    } else {
      await fs.unlink(targetPath);
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// IPC Handlers - Terminal Operations
ipcMain.handle('execute-command', async (event, command, cwd) => {
  try {
    // Usa shell interativo para suportar todos os comandos (pnpm, npm, git, etc.)
    const { stdout, stderr } = await execAsync(command, { 
      cwd: cwd || process.cwd(),
      maxBuffer: 1024 * 1024 * 10, // 10MB buffer
      shell: '/bin/bash', // Usa bash para suportar todos os comandos
      env: { 
        ...process.env,
        PATH: process.env.PATH + ':/usr/local/bin:/usr/bin:/bin',
        FORCE_COLOR: '1', // Mantém cores nos comandos
        TERM: 'xterm-256color'
      }
    });
    return { 
      success: true, 
      stdout: stdout.toString(), 
      stderr: stderr.toString() 
    };
  } catch (error) {
    return { 
      success: false, 
      error: error.message,
      stdout: error.stdout?.toString() || '',
      stderr: error.stderr?.toString() || ''
    };
  }
});

// IPC Handlers - System Info
ipcMain.handle('get-home-dir', () => {
  return app.getPath('home');
});

ipcMain.handle('get-app-path', () => {
  return app.getAppPath();
});

// IPC Handlers - Dialogs
ipcMain.handle('show-open-dialog', async (event, options) => {
  const result = await dialog.showOpenDialog(mainWindow, options);
  return result;
});

ipcMain.handle('show-save-dialog', async (event, options) => {
  const result = await dialog.showSaveDialog(mainWindow, options);
  return result;
});

// IPC Handlers - Window Controls
ipcMain.on('window-minimize', () => {
  if (mainWindow) mainWindow.minimize();
});

ipcMain.on('window-maximize', () => {
  if (mainWindow) {
    if (mainWindow.isMaximized()) {
      mainWindow.unmaximize();
    } else {
      mainWindow.maximize();
    }
  }
});

ipcMain.on('window-close', () => {
  if (mainWindow) mainWindow.close();
});

ipcMain.on('toggle-devtools', () => {
  if (mainWindow) {
    if (mainWindow.webContents.isDevToolsOpened()) {
      mainWindow.webContents.closeDevTools();
    } else {
      mainWindow.webContents.openDevTools({ mode: 'detach' });
    }
  }
});

// ============================================
// MCP Handlers (Model Context Protocol)
// ============================================

// Armazena servidores MCP conectados
const mcpServers = new Map();

// Conecta a um servidor MCP
ipcMain.handle('mcp-connect', async (event, serverConfig) => {
  try {
    console.log('🔌 Conectando ao MCP:', serverConfig.name);
    
    if (!Client || !StdioClientTransport) {
      throw new Error('MCP SDK não disponível');
    }
    
    // Cria transport com stdio
    const transport = new StdioClientTransport({
      command: serverConfig.command,
      args: serverConfig.args,
    });
    
    // Cria client MCP
    const client = new Client(
      {
        name: 'astrion-client',
        version: '1.0.0',
      },
      {
        capabilities: {
          roots: {
            listChanged: true,
          },
          sampling: {},
        },
      }
    );
    
    // Conecta ao servidor
    await client.connect(transport);
    
    // Lista tools disponíveis
    const toolsResponse = await client.listTools();
    console.log(`✅ MCP ${serverConfig.name} conectado! Tools:`, toolsResponse.tools?.length || 0);
    
    // Armazena servidor conectado
    mcpServers.set(serverConfig.name, {
      ...serverConfig,
      status: 'connected',
      client,
      transport,
      tools: toolsResponse.tools || []
    });
    
    return { 
      success: true,
      tools: toolsResponse.tools || []
    };
  } catch (error) {
    console.error('❌ Erro ao conectar MCP:', error);
    return { success: false, error: error.message };
  }
});

// Desconecta de um servidor MCP
ipcMain.handle('mcp-disconnect', async (event, serverName) => {
  try {
    console.log('🔌 Desconectando MCP:', serverName);
    
    const server = mcpServers.get(serverName);
    if (server && server.client) {
      await server.client.close();
    }
    
    mcpServers.delete(serverName);
    return { success: true };
  } catch (error) {
    console.error('❌ Erro ao desconectar MCP:', error);
    return { success: false, error: error.message };
  }
});

// Lista servidores conectados
ipcMain.handle('mcp-list', async () => {
  try {
    return {
      success: true,
      servers: Array.from(mcpServers.values()).map(s => ({
        name: s.name,
        command: s.command,
        args: s.args,
        status: s.status,
        tools: s.tools || []
      }))
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
});

// Chama uma tool de um servidor MCP
ipcMain.handle('mcp-call-tool', async (event, serverName, toolName, args) => {
  try {
    const server = mcpServers.get(serverName);
    if (!server || !server.client) {
      throw new Error(`Servidor ${serverName} não conectado`);
    }
    
    console.log(`🔧 Chamando tool ${toolName} no ${serverName}`);
    const response = await server.client.callTool({
      name: toolName,
      arguments: args || {}
    });
    
    return { success: true, result: response };
  } catch (error) {
    console.error(`❌ Erro ao chamar tool ${toolName}:`, error);
    return { success: false, error: error.message };
  }
});

// Lista tools de um servidor
ipcMain.handle('mcp-list-tools', async (event, serverName) => {
  try {
    const server = mcpServers.get(serverName);
    if (!server || !server.client) {
      throw new Error(`Servidor ${serverName} não conectado`);
    }
    
    const response = await server.client.listTools();
    return { success: true, tools: response.tools || [] };
  } catch (error) {
    console.error(`❌ Erro ao listar tools:`, error);
    return { success: false, error: error.message };
  }
});

// Lista resources de um servidor
ipcMain.handle('mcp-list-resources', async (event, serverName) => {
  try {
    const server = mcpServers.get(serverName);
    if (!server || !server.client) {
      throw new Error(`Servidor ${serverName} não conectado`);
    }
    
    const response = await server.client.listResources();
    return { success: true, resources: response.resources || [] };
  } catch (error) {
    console.error(`❌ Erro ao listar resources:`, error);
    return { success: false, error: error.message };
  }
});

// Lê um resource de um servidor
ipcMain.handle('mcp-read-resource', async (event, serverName, uri) => {
  try {
    const server = mcpServers.get(serverName);
    if (!server || !server.client) {
      throw new Error(`Servidor ${serverName} não conectado`);
    }
    
    const response = await server.client.readResource({ uri });
    return { success: true, content: response };
  } catch (error) {
    console.error(`❌ Erro ao ler resource:`, error);
    return { success: false, error: error.message };
  }
});
