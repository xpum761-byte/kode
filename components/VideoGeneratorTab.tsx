
import React, { useState } from 'react';
import { ChevronDownIcon } from './icons/ChevronDownIcon';
import { UploadIcon } from './icons/UploadIcon';
import { VideoIcon } from './icons/VideoIcon';
import { DownloadIcon } from './icons/DownloadIcon';

const SettingsOption: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div>
    <label className="block text-sm font-medium text-brand-text-muted mb-2">{label}</label>
    {children}
  </div>
);

interface VideoGeneratorTabProps {
  prompt: string;
  setPrompt: (prompt: string) => void;
  image: File | undefined;
  setImage: (file: File | undefined) => void;
  videoUrl: string | null;
}

export const VideoGeneratorTab: React.FC<VideoGeneratorTabProps> = ({ prompt, setPrompt, image, setImage, videoUrl }) => {
  const [settingsOpen, setSettingsOpen] = useState(true);
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setImage(file || undefined);
  };

  return (
    <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8 h-full">
      {/* Left Column: Controls */}
      <div className="flex flex-col space-y-8">
        <div className="flex-grow">
          <label htmlFor="prompt" className="sr-only">Prompt</label>
          <textarea
            id="prompt"
            rows={5}
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-brand-surface border border-white/20 rounded-lg px-4 py-3 text-lg focus:ring-2 focus:ring-brand-accent focus:border-brand-accent placeholder-brand-text-muted resize-none"
            placeholder="Describe your video scene..."
          />
        </div>

        <div className="bg-brand-surface rounded-lg border border-white/10">
          <button
            onClick={() => setSettingsOpen(!settingsOpen)}
            className="w-full flex justify-between items-center p-4"
          >
            <h3 className="font-semibold">Generation Settings</h3>
            <ChevronDownIcon className={`w-5 h-5 transition-transform duration-300 ${settingsOpen ? 'rotate-180' : ''}`} />
          </button>
          {settingsOpen && (
            <div className="p-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-4 animate-fade-in">
              <SettingsOption label="Resolution">
                <select className="w-full bg-brand-bg border border-white/20 rounded-md px-3 py-2 focus:ring-brand-accent focus:border-brand-accent">
                  <option>1080p (Full HD)</option>
                  <option>720p (HD)</option>
                  <option>4K</option>
                </select>
              </SettingsOption>
              <SettingsOption label="Aspect Ratio">
                <select className="w-full bg-brand-bg border border-white/20 rounded-md px-3 py-2 focus:ring-brand-accent focus:border-brand-accent">
                  <option>16:9</option>
                  <option>9:16</option>
                  <option>1:1</option>
                  <option>4:3</option>
                </select>
              </SettingsOption>
              <SettingsOption label="Visual Style">
                <select className="w-full bg-brand-bg border border-white/20 rounded-md px-3 py-2 focus:ring-brand-accent focus:border-brand-accent">
                  <option>Cinematic</option>
                  <option>Anime</option>
                  <option>Photorealistic</option>
                  <option>Claymation</option>
                </select>
              </SettingsOption>
              <SettingsOption label="Camera">
                <select className="w-full bg-brand-bg border border-white/20 rounded-md px-3 py-2 focus:ring-brand-accent focus:border-brand-accent">
                  <option>Static</option>
                  <option>Walking</option>
                  <option>Drone</option>
                  <option>Pan</option>
                  <option>Zoom</option>
                  <option>Crane</option>
                  <option>Handheld</option>
                </select>
              </SettingsOption>
            </div>
          )}
        </div>

        <div>
          <h3 className="font-semibold mb-2">Character & References</h3>
          <label
            htmlFor="character-upload"
            className="relative flex flex-col items-center justify-center w-full h-32 border-2 border-white/20 border-dashed rounded-lg cursor-pointer bg-brand-surface hover:bg-brand-bg/50 transition-colors"
          >
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <UploadIcon className="w-8 h-8 mb-3 text-brand-text-muted"/>
              <p className="mb-2 text-sm text-brand-text-muted">
                {image ? (
                  <span className="font-semibold text-brand-accent">{image.name}</span>
                ) : (
                  <>
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </>
                )}
              </p>
              <p className="text-xs text-brand-text-muted">PNG, JPG, or GIF (MAX. 5MB)</p>
            </div>
            <input id="character-upload" type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/gif" />
          </label>
        </div>
      </div>

      {/* Right Column: Preview */}
      <div className="flex flex-col">
        <h3 className="font-semibold mb-4 text-lg">Preview</h3>
        <div className="relative flex-grow bg-brand-surface rounded-lg border border-white/10 flex items-center justify-center p-4 aspect-video">
          {videoUrl ? (
            <>
              <video
                key={videoUrl}
                controls
                src={videoUrl}
                className="w-full h-full object-contain rounded"
              >
                Your browser does not support the video tag.
              </video>
              <a
                href={videoUrl}
                download="synthv-generated-video.mp4"
                className="absolute top-3 right-3 p-2 bg-brand-bg/50 backdrop-blur-sm rounded-full text-brand-text-muted hover:bg-brand-primary hover:text-white transition-all duration-200"
                aria-label="Download video"
              >
                <DownloadIcon className="w-5 h-5" />
              </a>
            </>
          ) : (
            <div className="text-center text-brand-text-muted">
              <VideoIcon className="mx-auto h-12 w-12" />
              <p className="mt-2 text-sm">Your generated video will appear here.</p>
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
