export interface ElectronAPI {
  readFile: (filePath: string) => Promise<{ success: boolean; content?: string; error?: string }>;
  writeFile: (filePath: string, content: string) => Promise<{ success: boolean; error?: string }>;
  readDirectory: (dirPath: string) => Promise<{ success: boolean; files?: any[]; error?: string }>;
  createFile: (filePath: string) => Promise<{ success: boolean; error?: string }>;
  createDirectory: (dirPath: string) => Promise<{ success: boolean; error?: string }>;
  deletePath: (targetPath: string) => Promise<{ success: boolean; error?: string }>;
  executeCommand: (command: string, cwd?: string) => Promise<{ success: boolean; stdout?: string; stderr?: string; error?: string }>;
  getHomeDir: () => Promise<string>;
  getAppPath: () => Promise<string>;
  showOpenDialog: (options: any) => Promise<{ canceled: boolean; filePaths: string[] }>;
  showSaveDialog: (options: any) => Promise<{ canceled: boolean; filePath?: string }>;
  windowMinimize: () => void;
  windowMaximize: () => void;
  windowClose: () => void;
  toggleDevTools: () => void;
  mcpConnect: (serverConfig: any) => Promise<{ success: boolean; tools?: any[]; error?: string }>;
  mcpDisconnect: (serverName: string) => Promise<{ success: boolean; error?: string }>;
  mcpList: () => Promise<{ success: boolean; servers?: any[]; error?: string }>;
  mcpCallTool: (serverName: string, toolName: string, args: any) => Promise<{ success: boolean; result?: any; error?: string }>;
  mcpListTools: (serverName: string) => Promise<{ success: boolean; tools?: any[]; error?: string }>;
  mcpListResources: (serverName: string) => Promise<{ success: boolean; resources?: any[]; error?: string }>;
  mcpReadResource: (serverName: string, uri: string) => Promise<{ success: boolean; content?: any; error?: string }>;
}

declare global {
  interface Window {
    electronAPI?: ElectronAPI;
  }
}

export {};
