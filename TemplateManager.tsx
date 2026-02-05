
import React, { useState, useEffect } from 'react';
import { Template } from '../types';
import { Save, Plus, Trash2, FileText, X } from 'lucide-react';

interface TemplateManagerProps {
  onSelectTemplate: (content: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const STORAGE_KEY = 'apex9_templates';

export const TemplateManager: React.FC<TemplateManagerProps> = ({ onSelectTemplate, isOpen, onClose }) => {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isCreating, setIsCreating] = useState(false);
  const [newName, setNewName] = useState('');
  const [newContent, setNewContent] = useState('');

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setTemplates(JSON.parse(stored));
    } else {
        // Default template from instructions
        setTemplates([{
            id: 'default-1',
            name: 'Shift Handover',
            content: '## Shift Handover Report\n**Operator:** [Name]\n**Status:** [Green/Yellow/Red]\n**Incidents:**\n- [ ] Safety Violations\n- [ ] Equipment Stoppage'
        }]);
    }
  }, []);

  const saveTemplates = (newTemplates: Template[]) => {
    setTemplates(newTemplates);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newTemplates));
  };

  const handleCreate = () => {
    if (!newName || !newContent) return;
    const newTemplate: Template = {
      id: Date.now().toString(),
      name: newName,
      content: newContent
    };
    saveTemplates([...templates, newTemplate]);
    setIsCreating(false);
    setNewName('');
    setNewContent('');
  };

  const handleDelete = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    saveTemplates(templates.filter(t => t.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-full max-w-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl flex flex-col max-h-[85vh]">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Operation Templates
          </h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          {isCreating ? (
            <div className="space-y-4 bg-slate-50 dark:bg-slate-800/50 p-6 rounded-lg border border-slate-200 dark:border-slate-700">
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Template Name</label>
                <input 
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="w-full bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md p-2 text-slate-900 dark:text-white focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="e.g. Daily Inspection"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-1">Content (Markdown supported)</label>
                <textarea 
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full h-40 bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md p-2 text-slate-900 dark:text-white font-mono text-sm focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="# Header..."
                />
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button 
                  onClick={() => setIsCreating(false)}
                  className="px-4 py-2 text-slate-500 dark:text-slate-300 hover:text-slate-800 dark:hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreate}
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-md flex items-center gap-2 transition-colors shadow-lg shadow-emerald-900/20"
                >
                  <Save className="w-4 h-4" /> Save Template
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <button 
                onClick={() => setIsCreating(true)}
                className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl hover:border-emerald-500/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-all group"
              >
                <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-3 group-hover:bg-emerald-500/20 transition-colors">
                  <Plus className="w-6 h-6 text-emerald-500" />
                </div>
                <span className="text-slate-500 dark:text-slate-400 group-hover:text-emerald-600 dark:group-hover:text-emerald-400 font-medium">Create New Template</span>
              </button>

              {templates.map(tpl => (
                <div 
                  key={tpl.id}
                  onClick={() => {
                    onSelectTemplate(tpl.content);
                    onClose();
                  }}
                  className="relative p-5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-900/10 cursor-pointer transition-all group"
                >
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button 
                      onClick={(e) => handleDelete(tpl.id, e)}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                  <h3 className="font-bold text-slate-800 dark:text-slate-200 mb-2 truncate pr-8">{tpl.name}</h3>
                  <p className="text-xs text-slate-500 font-mono line-clamp-3 bg-slate-50 dark:bg-slate-950/50 p-2 rounded border border-slate-100 dark:border-transparent">
                    {tpl.content}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
