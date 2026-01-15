
import React from 'react';
import { AIExplanation } from '../types';

interface ExplanationCardProps {
  data: AIExplanation | null;
  isLoading: boolean;
  onClose: () => void;
}

const ExplanationCard: React.FC<ExplanationCardProps> = ({ data, isLoading, onClose }) => {
  if (!isLoading && !data) return null;

  return (
    <div className="mt-6 relative">
      <div className="absolute -top-4 -left-4 w-24 h-24 bg-indigo-500/20 rounded-full blur-3xl"></div>
      <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-fuchsia-500/20 rounded-full blur-3xl"></div>
      
      <div className="relative backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden min-h-[150px]">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold flex items-center gap-2 text-indigo-300">
            <span className="animate-pulse">✨</span> AI Core Explanation
          </h3>
          <button 
            onClick={onClose}
            className="text-slate-500 hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-8 space-y-4">
            <div className="flex gap-2">
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce"></div>
            </div>
            <p className="text-slate-400 text-sm font-medium">Decompiling logic circuits...</p>
          </div>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-500">
            {data?.complexity && (
              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                Complexity: {data.complexity}
              </div>
            )}
            
            <div className="text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {data?.explanation}
            </div>

            {data?.suggestions && data.suggestions.length > 0 && (
              <div className="pt-4 border-t border-white/5">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Optimization Paths</p>
                <ul className="space-y-2">
                  {data.suggestions.map((s, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-400">
                      <span className="text-fuchsia-500 mt-1">•</span>
                      {s}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ExplanationCard;
