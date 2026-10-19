import React, { useState } from 'react';
import { BookmarkPlus, Trash2, Plus, BrainCircuit, Search, Filter } from 'lucide-react';
import { MemoryDirective } from '../types/jarvis';

interface MemoryMatrixPanelProps {
  memories: MemoryDirective[];
  onAddMemory: (fact: string, category: MemoryDirective['category']) => void;
  onDeleteMemory: (id: string) => void;
  assistantName: string;
}

export const MemoryMatrixPanel: React.FC<MemoryMatrixPanelProps> = ({
  memories,
  onAddMemory,
  onDeleteMemory,
  assistantName,
}) => {
  const [newFact, setNewFact] = useState('');
  const [newCategory, setNewCategory] = useState<MemoryDirective['category']>('preference');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFilter, setSelectedFilter] = useState<string>('all');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFact.trim()) return;
    onAddMemory(newFact.trim(), newCategory);
    setNewFact('');
  };

  const filteredMemories = memories.filter(m => {
    const matchesSearch = m.fact.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedFilter === 'all' || m.category === selectedFilter;
    return matchesSearch && matchesCategory;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>NEURAL RETENTION</span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-400">PERSONALIZATION ENGINE</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-0.5">
            Personal Directives & Memory Matrix
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {assistantName} injects these persistent directives into every reasoning cycle to tailor responses to you.
          </p>
        </div>

        <div className="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2 self-start sm:self-auto">
          <BrainCircuit className="w-4 h-4 text-cyan-400" />
          <span>{memories.length} Active Directives Stored</span>
        </div>
      </div>

      {/* Add Directive Box */}
      <form onSubmit={handleAdd} className="hud-glass p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="text-xs font-mono text-slate-300 font-semibold uppercase flex items-center gap-1.5">
          <BookmarkPlus className="w-4 h-4 text-cyan-400" />
          <span>Teach {assistantName} a New Fact or Directive</span>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            value={newFact}
            onChange={e => setNewFact(e.target.value)}
            placeholder="e.g. I prefer concise technical answers without pleasantries, or I am building an autonomous drone project"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
          />

          <select
            value={newCategory}
            onChange={e => setNewCategory(e.target.value as any)}
            className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-400 font-mono"
          >
            <option value="preference">Preference</option>
            <option value="directive">Directive</option>
            <option value="routine">Daily Routine</option>
            <option value="work">Work & Project</option>
            <option value="biography">Biography</option>
          </select>

          <button
            type="submit"
            disabled={!newFact.trim()}
            className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-medium text-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Store in Memory</span>
          </button>
        </div>
      </form>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search memory directives..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Interactive segmented controls for category filter */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-lg self-stretch sm:self-auto overflow-x-auto">
          {['all', 'preference', 'directive', 'routine', 'work'].map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedFilter(cat)}
              className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap cursor-pointer ${
                selectedFilter === cat
                  ? 'bg-cyan-500 text-slate-950 font-semibold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {cat.charAt(0).toUpperCase() + cat.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Memory List */}
      <div className="space-y-2.5">
        {filteredMemories.length === 0 ? (
          <div className="p-8 text-center border border-slate-800/80 rounded-xl text-slate-500 font-mono text-xs">
            {searchQuery
              ? 'No matching directives found in memory buffer.'
              : 'No memories recorded yet. Add personal preferences or tell JARVIS to remember something!'}
          </div>
        ) : (
          filteredMemories.map(item => (
            <div
              key={item.id}
              className="hud-glass p-3.5 rounded-xl border border-slate-800/80 hover:border-cyan-500/30 transition-all flex items-start justify-between gap-4 group"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                  <span className="text-cyan-400 uppercase font-semibold">{item.category}</span>
                  <span aria-hidden="true">·</span>
                  <span>{new Date(item.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-sm text-slate-200 leading-relaxed font-sans">
                  {item.fact}
                </p>
              </div>

              <button
                onClick={() => onDeleteMemory(item.id)}
                className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors opacity-80 group-hover:opacity-100 cursor-pointer"
                title="Erase from memory"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
