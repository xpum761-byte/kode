import React, { useState, useEffect } from 'react';
import { CloseIcon } from './icons/CloseIcon';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSave: (apiKey: string) => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, apiKey, onSave }) => {
  const [localApiKey, setLocalApiKey] = useState(apiKey);

  useEffect(() => {
    // When the modal is opened, sync the local state with the prop from App
    if (isOpen) {
      setLocalApiKey(apiKey);
    }
  }, [isOpen, apiKey]);

  if (!isOpen) return null;

  const handleSaveClick = () => {
    onSave(localApiKey);
    onClose();
  };

  return (
    <div 
      className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 transition-opacity duration-300"
      onClick={onClose}
    >
      <div 
        className="bg-brand-surface rounded-lg shadow-2xl shadow-black/50 border border-white/10 w-full max-w-md m-4 transform transition-all duration-300 scale-95 opacity-0 animate-fade-in-scale"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="text-lg font-bold">Global Settings</h2>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/10 text-brand-text-muted hover:text-white">
            <CloseIcon className="w-6 h-6" />
          </button>
        </div>
        <div className="p-6 space-y-6">
          <div>
            <label htmlFor="api-key" className="block text-sm font-medium text-brand-text-muted mb-2">
              Gemini API Key
            </label>
            <input
              type="password"
              id="api-key"
              value={localApiKey}
              onChange={(e) => setLocalApiKey(e.target.value)}
              className="w-full bg-brand-bg border border-white/20 rounded-md px-3 py-2 focus:ring-brand-accent focus:border-brand-accent placeholder-brand-text-muted"
              placeholder="Enter your Gemini API key"
              aria-describedby="api-key-description"
            />
             <p id="api-key-description" className="mt-2 text-xs text-brand-text-muted">
              Your API key is stored securely in your browser's local storage.
            </p>
          </div>
          <div>
            <h3 className="text-md font-semibold mb-3">Video History</h3>
            <div className="h-48 bg-brand-bg rounded-md flex items-center justify-center border border-dashed border-white/20">
              <p className="text-brand-text-muted text-sm">No videos generated yet.</p>
            </div>
          </div>
        </div>
         <div className="flex justify-end p-4 bg-brand-surface/50 border-t border-white/10 rounded-b-lg">
            <button 
                onClick={handleSaveClick}
                className="px-4 py-2 bg-brand-primary text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors"
            >
                Save & Close
            </button>
        </div>
      </div>
      <style>{`
        @keyframes fade-in-scale {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in-scale {
          animation: fade-in-scale 0.3s ease-out forwards;
        }
      `}</style>
    </div>
  );
};