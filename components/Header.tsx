
import React from 'react';
import { GearIcon } from './icons/GearIcon';

interface HeaderProps {
  onSettingsClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onSettingsClick }) => {
  return (
    <header className="bg-brand-surface/50 backdrop-blur-sm border-b border-white/10 sticky top-0 z-10">
      <div className="container mx-auto px-4 py-3 flex justify-between items-center">
        <h1 className="text-2xl font-display font-bold text-white tracking-wider">
          Synth<span className="text-brand-primary">V</span>
        </h1>
        <button
          onClick={onSettingsClick}
          className="p-2 rounded-full text-brand-text-muted hover:bg-brand-surface hover:text-white transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-accent"
          aria-label="Open settings"
        >
          <GearIcon className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};
