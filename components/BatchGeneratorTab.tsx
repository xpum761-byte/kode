import React from 'react';
import type { BatchSegment } from '../types';
import { PlusIcon } from './icons/PlusIcon';
import { TrashIcon } from './icons/TrashIcon';
import { UploadIcon } from './icons/UploadIcon';
import { VideoIcon } from './icons/VideoIcon';
import { DownloadIcon } from './icons/DownloadIcon';

const SegmentCard: React.FC<{ 
    segment: BatchSegment; 
    onDelete: (id: string) => void;
    onPromptChange: (id: string, prompt: string) => void;
    onImageChange: (id: string, file: File | undefined) => void;
}> = ({ segment, onDelete, onPromptChange, onImageChange }) => {

    const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        onImageChange(segment.id, file || undefined);
    };

    const cardStateClasses = {
        idle: 'border-white/10',
        generating: 'border-brand-accent ring-2 ring-brand-accent/50',
        success: 'border-green-500/50',
        error: 'border-red-500/50 ring-2 ring-red-500/50',
    };

    return (
        <div className={`bg-brand-surface border rounded-lg p-4 flex flex-col md:flex-row gap-4 items-start transition-all duration-300 ${cardStateClasses[segment.status]}`}>
            <textarea
                rows={8}
                value={segment.prompt}
                onChange={(e) => onPromptChange(segment.id, e.target.value)}
                className="w-full flex-grow bg-brand-bg border border-white/20 rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent placeholder-brand-text-muted resize-y"
                placeholder={`Segment ${segment.id.substring(0,4)} prompt...`}
            />
            <div className="flex-shrink-0 flex flex-row md:flex-col gap-4">
                <label
                    htmlFor={`segment-upload-${segment.id}`}
                    className="relative flex items-center justify-center w-40 h-24 border border-white/20 border-dashed rounded-lg cursor-pointer bg-brand-bg hover:bg-opacity-80 transition-colors text-center p-2"
                >
                    <div className="flex flex-col items-center justify-center text-xs text-brand-text-muted">
                        <UploadIcon className="w-6 h-6 mb-1"/>
                        {segment.image ? <span className="text-brand-accent font-semibold break-all">{segment.image.name}</span> : <span>Add Image</span>}
                    </div>
                    <input id={`segment-upload-${segment.id}`} type="file" className="hidden" onChange={handleFileChange} accept="image/png, image/jpeg, image/gif" />
                </label>
                <div className="relative w-40 h-24 bg-brand-bg rounded-lg border border-white/20 flex items-center justify-center p-1">
                  {segment.videoUrl ? (
                      <>
                        <video key={segment.videoUrl} controls src={segment.videoUrl} className="w-full h-full object-contain rounded-sm">
                            Your browser does not support the video tag.
                        </video>
                        <a
                            href={segment.videoUrl}
                            download={`synthv-segment-${segment.id.substring(0,4)}.mp4`}
                            className="absolute top-1 right-1 p-1 bg-brand-bg/50 backdrop-blur-sm rounded-full text-brand-text-muted hover:bg-brand-primary hover:text-white transition-all duration-200"
                            aria-label="Download segment video"
                        >
                            <DownloadIcon className="w-4 h-4" />
                        </a>
                      </>
                  ) : (
                      <div className="text-xs text-brand-text-muted text-center">
                          <VideoIcon className="mx-auto h-6 w-6 mb-1" />
                          <span>Video Preview</span>
                      </div>
                  )}
                  {segment.status === 'generating' && (
                    <div className="absolute inset-0 bg-brand-bg/80 backdrop-blur-sm flex flex-col items-center justify-center text-xs text-brand-text-muted rounded-md">
                        <div className="w-6 h-6 border-2 border-dashed rounded-full animate-spin border-brand-accent"></div>
                        <span className="mt-2">Generating...</span>
                    </div>
                  )}
                  {segment.status === 'error' && (
                    <div className="absolute inset-0 bg-red-900/50 backdrop-blur-sm flex flex-col items-center justify-center text-xs text-red-300 rounded-md">
                        <p className="font-semibold">Generation Failed</p>
                    </div>
                  )}
                </div>
            </div>
            <button
                onClick={() => onDelete(segment.id)}
                className="p-2 text-brand-text-muted hover:text-red-500 hover:bg-red-500/10 rounded-md transition-colors"
                aria-label="Delete segment"
            >
                <TrashIcon className="w-5 h-5" />
            </button>
        </div>
    );
};

interface BatchGeneratorTabProps {
  segments: BatchSegment[];
  setSegments: React.Dispatch<React.SetStateAction<BatchSegment[]>>;
}

export const BatchGeneratorTab: React.FC<BatchGeneratorTabProps> = ({ segments, setSegments }) => {
    const addSegment = () => {
        setSegments(s => [...s, { id: crypto.randomUUID(), prompt: '', image: undefined, status: 'idle' }]);
    };

    const deleteSegment = (id: string) => {
        setSegments(s => s.filter(seg => seg.id !== id));
    };
    
    const handlePromptChange = (id: string, prompt: string) => {
        setSegments(s => s.map(seg => (seg.id === id ? { ...seg, prompt } : seg)));
    };

    const handleImageChange = (id: string, file: File | undefined) => {
        setSegments(s => s.map(seg => (seg.id === id ? { ...seg, image: file } : seg)));
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="space-y-4 mb-6">
                {segments.map(segment => (
                    <SegmentCard 
                      key={segment.id} 
                      segment={segment} 
                      onDelete={deleteSegment}
                      onPromptChange={handlePromptChange}
                      onImageChange={handleImageChange}
                    />
                ))}
            </div>
            <button
                onClick={addSegment}
                className="w-full flex items-center justify-center py-4 border-2 border-white/20 border-dashed rounded-lg text-brand-text-muted hover:bg-brand-surface hover:border-brand-accent hover:text-brand-accent transition-all duration-200"
            >
                <PlusIcon className="w-6 h-6 mr-2" />
                Add Segment
            </button>
        </div>
    );
};