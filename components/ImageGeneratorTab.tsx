import React, { useState } from 'react';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { ImageIcon } from './icons/ImageIcon';
import { DownloadIcon } from './icons/DownloadIcon';

const SettingsOption: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-brand-text-muted mb-2">{label}</label>
    {children}
  </div>
);

interface ImageGeneratorTabProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  images: string[];
  aspectRatio: string;
  setAspectRatio: (ratio: string) => void;
}

export const ImageGeneratorTab: React.FC<ImageGeneratorTabProps> = ({ prompt, setPrompt, images, aspectRatio, setAspectRatio }) => {
  const [settingsOpen, setSettingsOpen] = useState(true);

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
      {/* Left Column: Controls */}
      <div className="flex flex-col space-y-8">
        <div className="flex-grow">
          <label htmlFor="image-prompt" className="sr-only">Image Prompt</label>
          <textarea
            id="image-prompt"
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-brand-surface border border-white/20 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent placeholder-brand-text-muted resize-none"
            placeholder="Describe the image you want to create..."
          />
        </div>

        <div className="bg-brand-surface rounded-lg border border-white/10">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="w-full flex justify-between items-center p-4"
            aria-expanded={settingsOpen}
          >
            <h3 className="font-semibold">Generation Settings</h3>
            <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${settingsOpen ? 'rotate-180' : ''}`} />
          </button>
          {settingsOpen && (
            <div className="p-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              <SettingsOption label="Aspect Ratio">
                <select 
                  className="w-full bg-brand-bg border border-white/20 rounded-md px-3 py-2 focus:ring-brand-accent focus:border-brand-accent"
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                >
                  <option value="1:1">1:1 (Square)</option>
                  <option value="16:9">16:9 (Widescreen)</option>
                  <option value="9:16">9:16 (Vertical)</option>
                  <option value="4:3">4:3 (Standard)</option>
                  <option value="3:4">3:4 (Portrait)</option>
                </select>
              </SettingsOption>
               <SettingsOption label="Style">
                <select className="w-full bg-brand-bg border border-white/20 rounded-md px-3 py-2 focus:ring-brand-accent focus:border-brand-accent">
                  <option>Photorealistic</option>
                  <option>Digital Art</option>
                  <option>Anime</option>
                  <option>Watercolor</option>
                </select>
              </SettingsOption>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Preview */}
      <div className="flex flex-col">
        <h3 className="font-semibold mb-4 text-lg">Preview</h3>
        <div className="relative flex-grow bg-brand-surface rounded-lg border border-white/10 flex items-center justify-center p-4 aspect-square">
          {images.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 w-full h-full">
                {images.map((imgSrc, index) => (
                    <div key={index} className="relative group">
                        <img
                            src={imgSrc}
                            alt={`Generated image ${index + 1}`}
                            className="w-full h-full object-contain rounded"
                        />
                         <a
                            href={imgSrc}
                            download={`synthv-generated-image-${index + 1}.jpeg`}
                            className="absolute top-3 right-3 p-2 bg-brand-bg/50 backdrop-blur-sm rounded-full text-brand-text-muted hover:bg-brand-primary hover:text-white transition-all duration-200 opacity-0 group-hover:opacity-100"
                            aria-label="Download image"
                        >
                            <DownloadIcon className="w-5 h-5" />
                        </a>
                    </div>
                ))}
            </div>
          ) : (
            <div className="text-center text-brand-text-muted">
              <ImageIcon className="mx-auto h-12 w-12" />
              <p className="mt-2 text-sm">Your generated image will appear here.</p>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes fade-in {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
            animation: fade-in 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};