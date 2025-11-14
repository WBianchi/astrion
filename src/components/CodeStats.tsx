import { Plus, Minus, Edit3 } from 'lucide-react';

interface CodeStatsProps {
  added: number;
  removed: number;
  modified: number;
}

export function CodeStats({ added, removed, modified }: CodeStatsProps) {
  if (added === 0 && removed === 0 && modified === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-40 flex items-center gap-3 px-4 py-2 rounded-lg border border-[#3e3e42] bg-[#1e1e1e]/95 backdrop-blur-sm">
      {added > 0 && (
        <div className="flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-green-400" />
          <span className="text-sm font-mono text-green-400">+{added}</span>
        </div>
      )}
      
      {removed > 0 && (
        <div className="flex items-center gap-1.5">
          <Minus className="w-4 h-4 text-red-400" />
          <span className="text-sm font-mono text-red-400">-{removed}</span>
        </div>
      )}
      
      {modified > 0 && (
        <div className="flex items-center gap-1.5">
          <Edit3 className="w-4 h-4 text-yellow-400" />
          <span className="text-sm font-mono text-yellow-400">~{modified}</span>
        </div>
      )}
    </div>
  );
}
