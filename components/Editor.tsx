
import React from 'react';

interface EditorProps {
  value: string;
  onChange: (value: string) => void;
  title: string;
  onTitleChange: (title: string) => void;
  language: string;
  onLanguageChange: (lang: string) => void;
  onDetectLanguage: () => void;
  isDetecting: boolean;
}

const Editor: React.FC<EditorProps> = ({ 
  value, 
  onChange, 
  title, 
  onTitleChange, 
  language, 
  onLanguageChange,
  onDetectLanguage,
  isDetecting
}) => {
  return (
    <div className="flex flex-col flex-1 h-full bg-[#0d1117] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
      {/* Editor Header / Tab Bar */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between bg-[#161b22] px-4 py-2 border-b border-slate-800 gap-2 sm:gap-0">
        <div className="flex items-center gap-3 w-full sm:w-auto overflow-hidden">
          <input
            value={title}
            onChange={(e) => onTitleChange(e.target.value)}
            placeholder="Snippet Title..."
            className="bg-transparent border-none focus:outline-none text-slate-200 font-semibold text-sm flex-1 sm:w-48 truncate"
          />
          <div className="hidden sm:block h-4 w-[1px] bg-slate-700"></div>
          
          <div className="flex items-center gap-2">
            <select 
              value={language}
              onChange={(e) => onLanguageChange(e.target.value)}
              className="bg-transparent text-slate-400 text-xs font-mono focus:outline-none cursor-pointer hover:text-indigo-400 transition-colors"
            >
              <option value="javascript">JavaScript</option>
              <option value="typescript">TypeScript</option>
              <option value="python">Python</option>
              <option value="rust">Rust</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="dockerfile">Dockerfile</option>
              <option value="bash">Bash</option>
            </select>
            
            <button
              onClick={onDetectLanguage}
              disabled={isDetecting || !value.trim()}
              title="Auto-detect language"
              className={`p-1 rounded hover:bg-slate-700 transition-all ${isDetecting ? 'animate-spin text-indigo-400' : 'text-slate-500 hover:text-indigo-300'}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </button>
          </div>
        </div>
        <div className="hidden sm:flex gap-1.5">
          <div className="w-3 h-3 rounded-full bg-red-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-yellow-500/50"></div>
          <div className="w-3 h-3 rounded-full bg-green-500/50"></div>
        </div>
      </div>

      {/* Code Area */}
      <div className="relative flex-1 group min-h-0">
        <div className="absolute top-0 left-0 bottom-0 w-8 sm:w-12 bg-[#161b22] border-r border-slate-800 flex flex-col items-center py-4 text-slate-600 font-mono text-[10px] sm:text-xs select-none">
          {Array.from({ length: 50 }).map((_, i) => (
            <div key={i} className="leading-6">{i + 1}</div>
          ))}
        </div>
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          spellCheck={false}
          className="w-full h-full pl-10 sm:pl-16 pr-4 py-4 bg-transparent resize-none focus:outline-none font-mono-code text-xs sm:text-sm leading-6 text-slate-300 placeholder:text-slate-700 overflow-y-auto"
          placeholder="// Paste or write your code here..."
        />
      </div>
    </div>
  );
};

export default Editor;
