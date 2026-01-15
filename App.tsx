
import React, { useState, useEffect, useRef } from 'react';
import Sidebar from './components/Sidebar';
import Editor from './components/Editor';
import ExplanationCard from './components/ExplanationCard';
import { CodeSnippet, AIExplanation } from './types';
import { explainCode, detectLanguage } from './services/geminiService';
import { toPng } from 'html-to-image';

const INITIAL_SNIPPETS: CodeSnippet[] = [
  {
    id: '1',
    title: 'Docker Auth Helper',
    code: '#!/bin/bash\necho "Authenticating with Docker Hub..."\ndocker login -u $DOCKER_USER -p $DOCKER_PASS',
    language: 'bash',
    updatedAt: Date.now()
  },
  {
    id: '2',
    title: 'React UseEffect Loop Fix',
    code: 'useEffect(() => {\n  const fetchData = async () => {\n    const data = await api.get();\n    setData(data);\n  };\n  fetchData();\n}, []); // Empty dependency array prevents loops',
    language: 'typescript',
    updatedAt: Date.now()
  }
];

const App: React.FC = () => {
  const [snippets, setSnippets] = useState<CodeSnippet[]>(() => {
    const saved = localStorage.getItem('cyber-snippets');
    return saved ? JSON.parse(saved) : INITIAL_SNIPPETS;
  });

  const [activeSnippetId, setActiveSnippetId] = useState<string | null>(snippets[0]?.id || null);
  const [activeSnippet, setActiveSnippet] = useState<CodeSnippet | null>(snippets[0] || null);
  const [aiResult, setAiResult] = useState<AIExplanation | null>(null);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [isSharing, setIsSharing] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  
  const shareRef = useRef<HTMLDivElement>(null);

  // Persistence
  useEffect(() => {
    localStorage.setItem('cyber-snippets', JSON.stringify(snippets));
  }, [snippets]);

  // Sync active snippet data when list or id changes
  useEffect(() => {
    if (activeSnippetId) {
      const found = snippets.find(s => s.id === activeSnippetId);
      if (found) setActiveSnippet(found);
    }
  }, [activeSnippetId, snippets]);

  const handleCreateNew = () => {
    const newSnippet: CodeSnippet = {
      id: Math.random().toString(36).substr(2, 9),
      title: 'New Snippet',
      code: '',
      language: 'javascript',
      updatedAt: Date.now()
    };
    setSnippets([newSnippet, ...snippets]);
    setActiveSnippetId(newSnippet.id);
    setAiResult(null);
  };

  const handleDelete = (id: string) => {
    const nextSnippets = snippets.filter(s => s.id !== id);
    setSnippets(nextSnippets);
    if (activeSnippetId === id) {
      setActiveSnippetId(nextSnippets[0]?.id || null);
    }
  };

  const handleUpdate = (updated: Partial<CodeSnippet>) => {
    if (!activeSnippetId) return;
    setSnippets(prev => prev.map(s => 
      s.id === activeSnippetId ? { ...s, ...updated, updatedAt: Date.now() } : s
    ));
  };

  const handleDetectLanguage = async (codeOverride?: string) => {
    const targetCode = codeOverride || activeSnippet?.code;
    if (!targetCode || !targetCode.trim()) return;

    setIsDetecting(true);
    try {
      const detected = await detectLanguage(targetCode);
      const supported = ['javascript', 'typescript', 'python', 'rust', 'html', 'css', 'dockerfile', 'bash'];
      if (supported.includes(detected)) {
        handleUpdate({ language: detected });
        setNotification(`Detected: ${detected}`);
      }
    } catch (err) {
      console.error("Auto-detect failed");
    } finally {
      setIsDetecting(false);
      setTimeout(() => setNotification(null), 2000);
    }
  };

  const handleSave = () => {
    setNotification('Snippet saved to local database');
    setTimeout(() => setNotification(null), 3000);
  };

  const handleShare = async () => {
    if (!shareRef.current || !activeSnippet) return;
    
    setIsSharing(true);
    setNotification('Generating export image...');
    
    try {
      const dataUrl = await toPng(shareRef.current, {
        cacheBust: true,
        quality: 1,
        pixelRatio: 2,
        filter: (node: any) => {
          if (node.tagName === 'LINK' && node.href && !node.href.includes(window.location.origin)) {
            return false;
          }
          return true;
        },
      });
      
      const link = document.createElement('a');
      link.download = `cyber-snippet-${activeSnippet.title.toLowerCase().replace(/\s+/g, '-')}.png`;
      link.href = dataUrl;
      link.click();
      
      setNotification('Snippet exported successfully! 📸');
    } catch (err) {
      console.error('Export failed:', err);
      try {
        const dataUrl = await toPng(shareRef.current, { skipFonts: true });
        const link = document.createElement('a');
        link.download = `cyber-snippet-${activeSnippet.title.toLowerCase().replace(/\s+/g, '-')}-basic.png`;
        link.href = dataUrl;
        link.click();
        setNotification('Exported with fallback fonts');
      } catch (innerErr) {
        setNotification('Failed to generate image');
      }
    } finally {
      setIsSharing(false);
      setTimeout(() => setNotification(null), 3000);
    }
  };

  const handleExplain = async () => {
    if (!activeSnippet || !activeSnippet.code.trim()) return;
    
    setIsAiLoading(true);
    setAiResult(null);
    try {
      const result = await explainCode(activeSnippet.code, activeSnippet.language);
      setAiResult(result);
    } catch (err) {
      setNotification('AI module connection failed');
      setTimeout(() => setNotification(null), 3000);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex h-screen bg-slate-950 text-slate-200 overflow-hidden">
      <Sidebar 
        snippets={snippets} 
        activeId={activeSnippetId} 
        onSelect={setActiveSnippetId} 
        onNew={handleCreateNew}
        onDelete={handleDelete}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="flex-1 flex flex-col p-4 sm:p-6 overflow-hidden relative">
        {/* Mobile Header */}
        <div className="lg:hidden flex items-center justify-between mb-4">
          <button 
            onClick={() => setIsSidebarOpen(true)}
            className="p-2 bg-slate-900 border border-slate-800 rounded-lg text-slate-400"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <div className="text-xs font-bold tracking-widest text-indigo-400">CYBER SNIP</div>
        </div>

        {/* Animated Background Glow */}
        <div className="absolute top-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-indigo-600/10 blur-[120px] rounded-full pointer-events-none"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-fuchsia-600/10 blur-[120px] rounded-full pointer-events-none"></div>

        {activeSnippet ? (
          <div className="flex flex-col h-full z-10 min-h-0">
            <div className="flex-1 min-h-0 flex flex-col">
              <Editor 
                value={activeSnippet.code}
                onChange={(code) => handleUpdate({ code })}
                title={activeSnippet.title}
                onTitleChange={(title) => handleUpdate({ title })}
                language={activeSnippet.language}
                onLanguageChange={(language) => handleUpdate({ language })}
                onDetectLanguage={() => handleDetectLanguage()}
                isDetecting={isDetecting}
              />
            </div>

            {/* Action Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between py-4 sm:py-6 gap-4">
              <div className="flex flex-wrap gap-2 sm:gap-4">
                <button
                  onClick={handleExplain}
                  disabled={isAiLoading || !activeSnippet.code.trim()}
                  className="flex-1 sm:flex-none group relative flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-900 border border-indigo-500/50 hover:border-indigo-400 text-indigo-300 rounded-xl transition-all hover:bg-indigo-500/10 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-indigo-500/20"
                >
                  <span className="text-lg sm:text-xl group-hover:rotate-12 transition-transform">✨</span>
                  <span className="font-bold tracking-tight text-xs sm:text-base">Explain</span>
                </button>
                
                <button
                  onClick={handleShare}
                  disabled={isSharing}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-900 border border-fuchsia-500/50 hover:border-fuchsia-400 text-fuchsia-300 rounded-xl transition-all hover:bg-fuchsia-500/10 active:scale-95 shadow-lg hover:shadow-fuchsia-500/20"
                >
                  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  <span className="font-semibold text-xs sm:text-base">Export</span>
                </button>

                <button
                  onClick={handleSave}
                  className="sm:hidden flex items-center justify-center p-2.5 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 rounded-xl transition-all"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                </button>

                <button
                  onClick={handleSave}
                  className="hidden sm:flex items-center gap-2 px-6 py-3 bg-slate-900 border border-slate-700 hover:border-slate-500 text-slate-300 rounded-xl transition-all active:scale-95"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                  </svg>
                  <span className="font-semibold">Save</span>
                </button>
              </div>

              <div className="text-[10px] sm:text-xs font-mono text-slate-600 text-right sm:text-left">
                Modified: {new Date(activeSnippet.updatedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto pb-8 custom-scrollbar min-h-0">
              <ExplanationCard 
                data={aiResult} 
                isLoading={isAiLoading} 
                onClose={() => setAiResult(null)}
              />
            </div>
          </div>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-slate-500 space-y-4">
            <div className="p-4 bg-slate-900 rounded-full border border-slate-800">
              <svg className="w-12 h-12 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
              </svg>
            </div>
            <p className="text-lg font-medium text-center px-4">Select a snippet to begin or create a new one</p>
          </div>
        )}

        {/* Hidden Share Template Area */}
        <div className="fixed -left-[4000px] top-0 pointer-events-none">
          <div 
            ref={shareRef}
            className="w-[1200px] p-24 flex items-center justify-center bg-gradient-to-br from-slate-950 via-indigo-950 to-slate-950"
          >
            <div className="w-full bg-[#0d1117] border border-slate-800 rounded-3xl overflow-hidden shadow-[0_40px_100px_rgba(0,0,0,0.8)] border-t-slate-700">
              <div className="flex items-center justify-between bg-[#161b22] px-8 py-6 border-b border-slate-800">
                <div className="flex items-center gap-6">
                  <div className="flex gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-[#ff5f56]"></div>
                    <div className="w-4 h-4 rounded-full bg-[#ffbd2e]"></div>
                    <div className="w-4 h-4 rounded-full bg-[#27c93f]"></div>
                  </div>
                  <span className="text-slate-400 font-mono text-lg ml-2">
                    {activeSnippet?.title || 'Untitled'} • {activeSnippet?.language}
                  </span>
                </div>
                <div className="text-indigo-400 font-bold text-sm tracking-[0.2em] uppercase">Cyber Snip</div>
              </div>
              <div className="p-12">
                <pre className="font-mono-code text-2xl leading-relaxed text-slate-300 whitespace-pre-wrap break-words">
                  {activeSnippet?.code || '// No code provided'}
                </pre>
              </div>
            </div>
          </div>
        </div>

        {/* Floating Notification */}
        {notification && (
          <div className="fixed bottom-6 right-6 sm:bottom-10 sm:right-10 bg-indigo-600 text-white px-6 py-3 rounded-full shadow-2xl shadow-indigo-500/40 animate-bounce transition-all z-[100] text-sm font-semibold">
            {notification}
          </div>
        )}
      </main>
    </div>
  );
};

export default App;
