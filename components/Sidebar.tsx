
import React, { useState } from 'react';
import { CodeSnippet } from '../types';

interface SidebarProps {
  snippets: CodeSnippet[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (id: string) => void;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ snippets, activeId, onSelect, onNew, onDelete, isOpen, onClose }) => {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  const toggleMenu = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setOpenMenuId(openMenuId === id ? null : id);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      <div className={`
        fixed inset-y-0 left-0 z-50 w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full transition-transform duration-300 transform
        ${isOpen ? 'translate-x-0' : '-translate-x-full'}
        lg:relative lg:translate-x-0
      `}>
        <div className="p-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-fuchsia-400">
            CYBER SNIP
          </h1>
          <button onClick={onClose} className="lg:hidden text-slate-400 hover:text-white">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 pb-4">
          <button
            onClick={() => { onNew(); onClose(); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-all duration-200 shadow-lg shadow-indigo-600/20 active:scale-95 font-semibold"
          >
            <span className="text-xl">+</span> New Snippet
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest px-2 mb-2">Saved Snippets</p>
          {snippets.length === 0 ? (
            <p className="text-sm text-slate-600 italic px-2">No snippets yet.</p>
          ) : (
            snippets.map((s) => (
              <div
                key={s.id}
                className={`group relative flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                  activeId === s.id 
                    ? 'bg-slate-800 border border-slate-700 shadow-md shadow-black/20' 
                    : 'hover:bg-slate-800/50 border border-transparent'
                }`}
                onClick={() => { onSelect(s.id); onClose(); }}
              >
                <div className="flex flex-col min-w-0 flex-1">
                  <span className={`text-sm font-medium truncate ${activeId === s.id ? 'text-indigo-400' : 'text-slate-300'}`}>
                    {s.title || 'Untitled Snippet'}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono uppercase tracking-tighter">
                    {s.language}
                  </span>
                </div>

                <div className="relative">
                  <button
                    onClick={(e) => toggleMenu(e, s.id)}
                    className="p-1.5 hover:bg-slate-700 text-slate-500 hover:text-slate-300 rounded transition-all ml-2"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>

                  {openMenuId === s.id && (
                    <div className="absolute right-0 mt-2 w-32 bg-slate-800 border border-slate-700 rounded-lg shadow-xl z-50 animate-in fade-in zoom-in duration-100">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(s.id);
                          setOpenMenuId(null);
                        }}
                        className="w-full text-left px-4 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-2"
                      >
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </>
  );
};

export default Sidebar;
