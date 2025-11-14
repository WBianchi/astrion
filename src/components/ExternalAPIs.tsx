import { useState } from 'react';
import { Cloud, Circle, Plus, Trash2, Key } from 'lucide-react';

interface ExternalAPI {
  name: string;
  provider: string;
  hasApiKey: boolean;
  status: 'active' | 'inactive' | 'error';
}

export function ExternalAPIs() {
  const [apis, setApis] = useState<ExternalAPI[]>([
    { name: 'OpenAI GPT-4', provider: 'OpenAI', hasApiKey: false, status: 'inactive' },
    { name: 'Claude 3.5 Sonnet', provider: 'Anthropic', hasApiKey: false, status: 'inactive' },
    { name: 'Gemini Pro', provider: 'Google', hasApiKey: false, status: 'inactive' },
  ]);

  const handleAddAPI = () => {
    const name = prompt('API name:');
    const provider = prompt('Provider:');
    if (name && provider) {
      setApis([...apis, { name, provider, hasApiKey: false, status: 'inactive' }]);
    }
  };

  const handleRemoveAPI = (index: number) => {
    setApis(apis.filter((_, i) => i !== index));
  };

  const handleSetApiKey = (index: number) => {
    const apiKey = prompt('Enter API Key:');
    if (apiKey) {
      const newApis = [...apis];
      newApis[index].hasApiKey = true;
      newApis[index].status = 'active';
      setApis(newApis);
      // Aqui você salvaria a API key de forma segura
      alert('API Key saved! (In production, this would be encrypted)');
    }
  };

  const toggleAPIStatus = (index: number) => {
    const newApis = [...apis];
    if (!newApis[index].hasApiKey) {
      alert('Please set API key first');
      return;
    }
    newApis[index].status = 
      newApis[index].status === 'active' ? 'inactive' : 'active';
    setApis(newApis);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'text-green-400';
      case 'inactive': return 'text-gray-400';
      case 'error': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#252526] border-r border-[#3e3e42]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3e3e42]">
        <span className="text-xs font-semibold text-gray-400 uppercase">External APIs</span>
        <button
          onClick={handleAddAPI}
          className="p-1 hover:bg-[#3e3e42] rounded transition-colors"
          title="Add API"
        >
          <Plus className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      {/* APIs List */}
      <div className="flex-1 overflow-y-auto">
        {apis.length === 0 ? (
          <div className="p-4 text-sm text-gray-500 text-center">
            No external APIs configured
          </div>
        ) : (
          <div className="py-1">
            {apis.map((api, index) => (
              <div
                key={index}
                className="flex items-center gap-2 px-3 py-2 hover:bg-[#2a2d2e] group"
              >
                <Cloud className="w-4 h-4 text-orange-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300 truncate">{api.name}</span>
                    <Circle 
                      className={`w-2 h-2 ${getStatusColor(api.status)} fill-current flex-shrink-0`}
                    />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <span>{api.provider}</span>
                    {api.hasApiKey && (
                      <span className="flex items-center gap-1 text-green-400">
                        <Key className="w-3 h-3" />
                        Key set
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => handleSetApiKey(index)}
                    className="p-1 hover:bg-[#3e3e42] rounded"
                    title="Set API Key"
                  >
                    <Key className="w-3 h-3 text-yellow-400" />
                  </button>
                  <button
                    onClick={() => toggleAPIStatus(index)}
                    className="p-1 hover:bg-[#3e3e42] rounded"
                    title={api.status === 'active' ? 'Deactivate' : 'Activate'}
                  >
                    <Circle className={`w-3 h-3 ${getStatusColor(api.status)}`} />
                  </button>
                  <button
                    onClick={() => handleRemoveAPI(index)}
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
        {apis.filter(a => a.status === 'active').length} / {apis.length} active
      </div>
    </div>
  );
}
