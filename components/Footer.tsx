import React from 'react';
import type { GenerationState } from '../types';

interface FooterProps {
  onGenerateClick: () => void;
  generationState: GenerationState;
  buttonText: string;
}

export const Footer: React.FC<FooterProps> = ({ onGenerateClick, generationState, buttonText }) => {
  const { isGenerating, progress, message, status } = generationState;

  const getProgressStyles = () => {
    if (status === 'success' && !isGenerating) return 'bg-green-500';
    if (status === 'error' && !isGenerating) return 'bg-red-500';
    if (isGenerating) return 'bg-gradient-to-r from-brand-secondary to-brand-primary';
    return 'bg-brand-bg';
  }

  const showProgress = isGenerating || status === 'success' || status === 'error';

  return (
    <footer className="bg-brand-surface border-t border-white/10 sticky bottom-0 z-10 p-4">
      <div className="container mx-auto flex items-center justify-center space-x-6">
        {showProgress ? (
          <div className="flex-grow flex items-center space-x-4 text-sm">
            <div className="w-full bg-brand-bg rounded-full h-2.5">
              <div
                className={`${getProgressStyles()} h-2.5 rounded-full transition-all duration-500`}
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-brand-text-muted w-full text-left">{message}</span>
          </div>
        ) : <div className="flex-grow"></div>}
        <button
          onClick={onGenerateClick}
          disabled={isGenerating}
          className="relative inline-flex items-center justify-center px-10 py-3 text-lg font-bold text-white transition-all duration-200 bg-brand-primary rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-brand-bg focus:ring-brand-accent group disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none shadow-lg shadow-brand-primary/30 hover:shadow-glow"
        >
          <span className="absolute -inset-full top-0 left-0 w-full h-full transform-gpu transition-all duration-500 block-diag-anim group-hover:left-full group-disabled:hidden"></span>
          <span className="relative">{isGenerating ? 'Generating...' : buttonText}</span>
        </button>
      </div>
      <style>{`
        .block-diag-anim {
          background: linear-gradient(to bottom right, rgba(255,255,255,0) 0%, rgba(255,255,255,0) 45%, rgba(255,255,255,0.3) 50%, rgba(255,255,255,0) 55%, rgba(255,255,255,0) 100%);
        }
      `}</style>
    </footer>
  );
};