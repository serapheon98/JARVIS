import React, { useState } from 'react';
import { CheckSquare, Square, Trash2, Plus, Target, Search, Clock } from 'lucide-react';
import { TaskItem, PriorityLevel } from '../types/jarvis';
import { soundFX } from '../utils/audioSynthesizer';

interface TasksDirectivesPanelProps {
  tasks: TaskItem[];
  onAddTask: (title: string, priority: PriorityLevel, category: string, deadline?: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  assistantName: string;
}

export const TasksDirectivesPanel: React.FC<TasksDirectivesPanelProps> = ({
  tasks,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  assistantName,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState<PriorityLevel>('high');
  const [newCategory, setNewCategory] = useState('Engineering');
  const [newDeadline, setNewDeadline] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'completed'>('pending');
  const [searchQuery, setSearchQuery] = useState('');

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    onAddTask(newTitle.trim(), newPriority, newCategory, newDeadline.trim() || undefined);
    setNewTitle('');
    setNewDeadline('');
    soundFX.blip();
  };

  const handleToggle = (id: string) => {
    onToggleTask(id);
    soundFX.confirm();
  };

  const filteredTasks = tasks.filter(t => {
    const matchesQuery = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.category.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all'
        ? true
        : statusFilter === 'pending'
        ? !t.completed
        : t.completed;
    return matchesQuery && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>OPERATIONAL QUEUE</span>
            <span aria-hidden="true">·</span>
            <span className="text-cyan-400">MISSION DISPATCH</span>
          </div>
          <h2 className="text-xl font-bold text-slate-100 tracking-tight mt-0.5">
            Objectives & Directives
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Manage your high-leverage deliverables. {assistantName} also adds tasks automatically when requested in conversation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="text-xs font-mono text-cyan-400 bg-cyan-950/40 border border-cyan-500/30 px-3 py-1.5 rounded-lg flex items-center gap-2">
            <Target className="w-4 h-4 text-cyan-400" />
            <span>{tasks.filter(t => !t.completed).length} Pending Deliverables</span>
          </div>
        </div>
      </div>

      {/* Add Task Input Bar */}
      <form onSubmit={handleAdd} className="hud-glass p-4 rounded-xl border border-slate-800 space-y-3">
        <div className="text-xs font-mono text-slate-300 font-semibold uppercase flex items-center gap-1.5">
          <Plus className="w-4 h-4 text-cyan-400" />
          <span>Deploy New Objective</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-2">
          <input
            type="text"
            value={newTitle}
            onChange={e => setNewTitle(e.target.value)}
            placeholder="Objective title (e.g., Finalize system architecture blueprint)"
            className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3.5 py-2 text-xs text-slate-100 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400 font-sans"
          />

          <div className="flex flex-wrap items-center gap-2">
            <select
              value={newPriority}
              onChange={e => setNewPriority(e.target.value as any)}
              className="bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-cyan-400 font-mono"
            >
              <option value="critical">Critical</option>
              <option value="high">High Priority</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>

            <input
              type="text"
              value={newCategory}
              onChange={e => setNewCategory(e.target.value)}
              placeholder="Category (e.g. Engineering)"
              className="w-32 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-cyan-400 font-sans"
            />

            <input
              type="text"
              value={newDeadline}
              onChange={e => setNewDeadline(e.target.value)}
              placeholder="Due (e.g. Today 5pm)"
              className="w-28 bg-slate-900 border border-slate-700 text-slate-200 text-xs rounded-lg px-2.5 py-2 focus:outline-none focus:border-cyan-400 font-sans"
            />

            <button
              type="submit"
              disabled={!newTitle.trim()}
              className="flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-400 disabled:opacity-40 text-slate-950 font-medium text-xs transition-colors cursor-pointer shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Deploy</span>
            </button>
          </div>
        </div>
      </form>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search objectives..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-cyan-400"
          />
        </div>

        {/* Filter controls */}
        <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-lg self-stretch sm:self-auto">
          <button
            onClick={() => setStatusFilter('pending')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'pending'
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Pending ({tasks.filter(t => !t.completed).length})
          </button>
          <button
            onClick={() => setStatusFilter('completed')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'completed'
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Completed ({tasks.filter(t => t.completed).length})
          </button>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              statusFilter === 'all'
                ? 'bg-cyan-500 text-slate-950 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            All
          </button>
        </div>
      </div>

      {/* Task Rows */}
      <div className="space-y-2">
        {filteredTasks.length === 0 ? (
          <div className="p-8 text-center border border-slate-800/80 rounded-xl text-slate-500 font-mono text-xs">
            {searchQuery
              ? 'No matching objectives found.'
              : statusFilter === 'pending'
              ? 'All current objectives completed. The board is clear, Sir.'
              : 'No completed directives in archive.'}
          </div>
        ) : (
          filteredTasks.map(task => (
            <div
              key={task.id}
              className={`hud-glass p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 group ${
                task.completed
                  ? 'border-slate-800/50 opacity-60 bg-slate-950/40'
                  : task.priority === 'critical'
                  ? 'border-rose-500/30 hover:border-rose-500/50'
                  : task.priority === 'high'
                  ? 'border-amber-500/30 hover:border-amber-500/50'
                  : 'border-slate-800 hover:border-cyan-500/30'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <button
                  onClick={() => handleToggle(task.id)}
                  className="text-slate-400 hover:text-cyan-400 transition-colors cursor-pointer shrink-0"
                  aria-label={task.completed ? 'Mark incomplete' : 'Mark completed'}
                >
                  {task.completed ? (
                    <CheckSquare className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <Square className="w-5 h-5" />
                  )}
                </button>

                <div className="min-w-0 flex-1">
                  <div className={`text-sm font-medium ${task.completed ? 'line-through text-slate-500' : 'text-slate-100'}`}>
                    {task.title}
                  </div>

                  {/* Clean unboxed metadata with typographic separators */}
                  <div className="flex items-center gap-2 text-xs text-slate-400 font-mono mt-0.5">
                    <span
                      className={
                        task.priority === 'critical'
                          ? 'text-rose-400 font-semibold uppercase'
                          : task.priority === 'high'
                          ? 'text-amber-400 font-semibold uppercase'
                          : 'text-slate-400 uppercase'
                      }
                    >
                      {task.priority}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span>{task.category}</span>
                    {task.deadline && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="flex items-center gap-1 text-cyan-400">
                          <Clock className="w-3 h-3" />
                          <span>{task.deadline}</span>
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <button
                onClick={() => onDeleteTask(task.id)}
                className="p-1.5 rounded text-slate-500 hover:text-rose-400 hover:bg-slate-800 transition-colors opacity-80 group-hover:opacity-100 cursor-pointer shrink-0"
                title="Remove objective"
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
