const { contextBridge, ipcRenderer } = require('electron');

// Expõe APIs seguras para o renderer process
contextBridge.exposeInMainWorld('electronAPI', {
  // File operations
  readFile: (filePath) => ipcRenderer.invoke('read-file', filePath),
  writeFile: (filePath, content) => ipcRenderer.invoke('write-file', filePath, content),
  readDirectory: (dirPath) => ipcRenderer.invoke('read-directory', dirPath),
  createFile: (filePath) => ipcRenderer.invoke('create-file', filePath),
  createDirectory: (dirPath) => ipcRenderer.invoke('create-directory', dirPath),
  deletePath: (targetPath) => ipcRenderer.invoke('delete-path', targetPath),
  
  // Terminal operations
  executeCommand: (command, cwd) => ipcRenderer.invoke('execute-command', command, cwd),
  
  // System info
  getHomeDir: () => ipcRenderer.invoke('get-home-dir'),
  getAppPath: () => ipcRenderer.invoke('get-app-path'),
  
  // Dialogs
  showOpenDialog: (options) => ipcRenderer.invoke('show-open-dialog', options),
  showSaveDialog: (options) => ipcRenderer.invoke('show-save-dialog', options),
  
  // Window controls
  windowMinimize: () => ipcRenderer.send('window-minimize'),
  windowMaximize: () => ipcRenderer.send('window-maximize'),
  windowClose: () => ipcRenderer.send('window-close'),
  toggleDevTools: () => ipcRenderer.send('toggle-devtools'),
  
  // MCP operations
  mcpConnect: (serverConfig) => ipcRenderer.invoke('mcp-connect', serverConfig),
  mcpDisconnect: (serverName) => ipcRenderer.invoke('mcp-disconnect', serverName),
  mcpList: () => ipcRenderer.invoke('mcp-list'),
  mcpCallTool: (serverName, toolName, args) => ipcRenderer.invoke('mcp-call-tool', serverName, toolName, args),
  mcpListTools: (serverName) => ipcRenderer.invoke('mcp-list-tools', serverName),
  mcpListResources: (serverName) => ipcRenderer.invoke('mcp-list-resources', serverName),
  mcpReadResource: (serverName, uri) => ipcRenderer.invoke('mcp-read-resource', serverName, uri),
});
