import { useState, useEffect } from 'react';
import { Plus, Trash2, FileText } from 'lucide-react';

interface Rule {
  id: string;
  title: string;
  content: string;
  enabled: boolean;
}

export function AIRules() {
  const [rules, setRules] = useState<Rule[]>([]);
  const [editingRule, setEditingRule] = useState<Rule | null>(null);
  const [newRuleTitle, setNewRuleTitle] = useState('');
  const [newRuleContent, setNewRuleContent] = useState('');

  // Carrega regras do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('ai-rules');
    if (saved) {
      setRules(JSON.parse(saved));
    } else {
      // Regras padrão
      const defaultRules: Rule[] = [
        {
          id: '1',
          title: 'Sempre usar TypeScript',
          content: 'Sempre crie arquivos .ts ou .tsx, nunca .js. Use tipagem forte.',
          enabled: true
        },
        {
          id: '2',
          title: 'Comentários em Português',
          content: 'Todos os comentários devem ser em português brasileiro.',
          enabled: true
        },
        {
          id: '3',
          title: 'TailwindCSS para estilização',
          content: 'Use TailwindCSS para estilização. Não crie arquivos CSS separados a menos que solicitado.',
          enabled: true
        }
      ];
      setRules(defaultRules);
      localStorage.setItem('ai-rules', JSON.stringify(defaultRules));
    }
  }, []);

  // Salva regras no localStorage
  const saveRules = (updatedRules: Rule[]) => {
    setRules(updatedRules);
    localStorage.setItem('ai-rules', JSON.stringify(updatedRules));
  };

  const addRule = () => {
    if (!newRuleTitle.trim() || !newRuleContent.trim()) return;

    const newRule: Rule = {
      id: Date.now().toString(),
      title: newRuleTitle,
      content: newRuleContent,
      enabled: true
    };

    saveRules([...rules, newRule]);
    setNewRuleTitle('');
    setNewRuleContent('');
  };

  const deleteRule = (id: string) => {
    saveRules(rules.filter(r => r.id !== id));
  };

  const toggleRule = (id: string) => {
    saveRules(rules.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r));
  };

  const updateRule = (id: string, updates: Partial<Rule>) => {
    saveRules(rules.map(r => r.id === id ? { ...r, ...updates } : r));
    setEditingRule(null);
  };

  // Exporta regras ativas como texto para o system prompt
  const getActiveRulesText = () => {
    const activeRules = rules.filter(r => r.enabled);
    if (activeRules.length === 0) return '';
    
    return '\n\nREGRAS DO PROJETO:\n' + activeRules.map(r => `- ${r.title}: ${r.content}`).join('\n');
  };

  // Salva no localStorage para o AIChat usar
  useEffect(() => {
    localStorage.setItem('ai-rules-text', getActiveRulesText());
  }, [rules]);

  return (
    <div className="flex flex-col h-full bg-[#1e1e1e] border-r border-[#3e3e42]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#3e3e42]">
        <span className="text-xs font-semibold text-gray-400 uppercase">AI Rules</span>
        <FileText className="w-4 h-4 text-gray-400" />
      </div>

      {/* Rules List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {rules.map((rule) => (
          <div
            key={rule.id}
            className={`p-3 rounded border ${
              rule.enabled ? 'border-blue-500 bg-[#252526]' : 'border-[#3e3e42] bg-[#1e1e1e] opacity-50'
            }`}
          >
            {editingRule?.id === rule.id ? (
              <div className="space-y-2">
                <input
                  type="text"
                  value={editingRule.title}
                  onChange={(e) => setEditingRule({ ...editingRule, title: e.target.value })}
                  className="w-full px-2 py-1 bg-[#3e3e42] text-white text-sm rounded"
                />
                <textarea
                  value={editingRule.content}
                  onChange={(e) => setEditingRule({ ...editingRule, content: e.target.value })}
                  className="w-full px-2 py-1 bg-[#3e3e42] text-white text-xs rounded resize-none"
                  rows={3}
                />
                <div className="flex gap-2">
                  <button
                    onClick={() => updateRule(rule.id, { title: editingRule.title, content: editingRule.content })}
                    className="flex-1 px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600"
                  >
                    Salvar
                  </button>
                  <button
                    onClick={() => setEditingRule(null)}
                    className="flex-1 px-2 py-1 bg-gray-600 text-white text-xs rounded hover:bg-gray-700"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between mb-1">
                  <h3 className="text-sm font-semibold text-white">{rule.title}</h3>
                  <div className="flex gap-1">
                    <button
                      onClick={() => toggleRule(rule.id)}
                      className={`px-2 py-0.5 text-xs rounded ${
                        rule.enabled ? 'bg-green-600 text-white' : 'bg-gray-600 text-gray-300'
                      }`}
                    >
                      {rule.enabled ? 'ON' : 'OFF'}
                    </button>
                    <button
                      onClick={() => setEditingRule(rule)}
                      className="p-1 hover:bg-[#3e3e42] rounded"
                    >
                      <FileText className="w-3 h-3 text-gray-400" />
                    </button>
                    <button
                      onClick={() => deleteRule(rule.id)}
                      className="p-1 hover:bg-[#3e3e42] rounded"
                    >
                      <Trash2 className="w-3 h-3 text-red-400" />
                    </button>
                  </div>
                </div>
                <p className="text-xs text-gray-400">{rule.content}</p>
              </>
            )}
          </div>
        ))}
      </div>

      {/* Add New Rule */}
      <div className="p-3 border-t border-[#3e3e42] space-y-2">
        <input
          type="text"
          placeholder="Título da regra..."
          value={newRuleTitle}
          onChange={(e) => setNewRuleTitle(e.target.value)}
          className="w-full px-2 py-1 bg-[#252526] text-white text-sm rounded border border-[#3e3e42]"
        />
        <textarea
          placeholder="Descrição da regra..."
          value={newRuleContent}
          onChange={(e) => setNewRuleContent(e.target.value)}
          className="w-full px-2 py-1 bg-[#252526] text-white text-xs rounded border border-[#3e3e42] resize-none"
          rows={2}
        />
        <button
          onClick={addRule}
          className="w-full px-3 py-2 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 flex items-center justify-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Adicionar Regra
        </button>
      </div>

      {/* Info */}
      <div className="px-3 py-2 border-t border-[#3e3e42] text-xs text-gray-500">
        💡 {rules.filter(r => r.enabled).length} regras ativas
      </div>
    </div>
  );
}
