import { useState } from 'react';
import { Server, Circle, Plus, Trash2 } from 'lucide-react';

interface MCPServer {
  name: string;
  url: string;
  status: 'connected' | 'disconnected' | 'error';
}

export function MCPServers() {
  const [servers, setServers] = useState<MCPServer[]>([
    { name: 'Filesystem', url: 'mcp://filesystem', status: 'connected' },
    { name: 'Memory', url: 'mcp://memory', status: 'connected' },
    { name: 'Puppeteer', url: 'mcp://puppeteer', status: 'disconnected' },
  ]);

  const handleAddServer = () => {
    const name = prompt('Server name:');
    const url = prompt('Server URL:');
    if (name && url) {
      setServers([...servers, { name, url, status: 'disconnected' }]);
    }
  };

  const handleRemoveServer = (index: number) => {
    setServers(servers.filter((_, i) => i !== index));
  };

  const toggleServerStatus = (index: number) => {
    const newServers = [...servers];
    newServers[index].status = 
      newServers[index].status === 'connected' ? 'disconnected' : 'connected';
    setServers(newServers);
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
    <div className="flex flex-col h-full bg-[#252526] border-r border-[#3e3e42]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3e3e42]">
        <span className="text-xs font-semibold text-gray-400 uppercase">MCP Servers</span>
        <button
          onClick={handleAddServer}
          className="p-1 hover:bg-[#3e3e42] rounded transition-colors"
          title="Add Server"
        >
          <Plus className="w-4 h-4 text-gray-400" />
        </button>
      </div>

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
                  <div className="text-xs text-gray-500 truncate">{server.url}</div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => toggleServerStatus(index)}
                    className="p-1 hover:bg-[#3e3e42] rounded"
                    title={server.status === 'connected' ? 'Disconnect' : 'Connect'}
                  >
                    <Circle className={`w-3 h-3 ${getStatusColor(server.status)}`} />
                  </button>
                  <button
                    onClick={() => handleRemoveServer(index)}
                    className="p-1 hover:bg-[#3e3e42] rounded"
                    title="Remove"
                  >
                    <Trash2 className="w-3 h-3 text-red-400" />
                  </button>
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
  );
}
