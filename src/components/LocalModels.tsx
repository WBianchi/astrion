import { useState, useEffect } from 'react';
import { Brain, Check, RefreshCw } from 'lucide-react';
import { ollamaService } from '../services/ollama';
import { useEditorStore } from '../store/editorStore';

interface OllamaModel {
  name: string;
  size: number;
  modified_at: string;
}

export function LocalModels() {
  const [models, setModels] = useState<OllamaModel[]>([]);
  const [loading, setLoading] = useState(false);
  const { currentModel, setCurrentModel } = useEditorStore();

  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    setLoading(true);
    try {
      const modelList = await ollamaService.listModels();
      setModels(modelList);
    } catch (error) {
      console.error('Error loading models:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectModel = (modelName: string) => {
    setCurrentModel(modelName);
    ollamaService.setModel(modelName);
  };

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
  };

  return (
    <div className="flex flex-col h-full bg-[#252526] border-r border-[#3e3e42]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3e3e42]">
        <span className="text-xs font-semibold text-gray-400 uppercase">Local Models</span>
        <button
          onClick={loadModels}
          disabled={loading}
          className="p-1 hover:bg-[#3e3e42] rounded transition-colors disabled:opacity-50"
          title="Refresh models"
        >
          <RefreshCw className={`w-4 h-4 text-gray-400 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Models List */}
      <div className="flex-1 overflow-y-auto">
        {loading && models.length === 0 ? (
          <div className="p-4 text-sm text-gray-500 text-center">
            Loading models...
          </div>
        ) : models.length === 0 ? (
          <div className="p-4 text-sm text-gray-500 text-center">
            No models found. Install models with: ollama pull model-name
          </div>
        ) : (
          <div className="py-1">
            {models.map((model, index) => (
              <div
                key={index}
                onClick={() => handleSelectModel(model.name)}
                className={`flex items-center gap-2 px-3 py-2 hover:bg-[#2a2d2e] cursor-pointer group ${
                  currentModel === model.name ? 'bg-[#37373d]' : ''
                }`}
              >
                <Brain className="w-4 h-4 text-purple-400 flex-shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-300 truncate">{model.name}</span>
                    {currentModel === model.name && (
                      <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatSize(model.size)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="px-3 py-2 border-t border-[#3e3e42] text-xs text-gray-500">
        Current: <span className="text-purple-400">{currentModel}</span>
      </div>
    </div>
  );
}
