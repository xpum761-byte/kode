import React, { useState, useCallback, useEffect } from 'react';
import { GoogleGenAI } from "@google/genai";
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { SettingsModal } from './components/SettingsModal';
import { VideoGeneratorTab } from './components/VideoGeneratorTab';
import { BatchGeneratorTab } from './components/BatchGeneratorTab';
import { ImageGeneratorTab } from './components/ImageGeneratorTab';
import { PromptGeneratorTab } from './components/PromptGeneratorTab';
import { Tab } from './types';
import type { GenerationState, BatchSegment } from './types';

// Helper to convert File to Base64
const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            if (typeof reader.result === 'string') {
                resolve(reader.result.split(',')[1]);
            } else {
                reject(new Error('Failed to read file as base64 string.'));
            }
        };
        reader.onerror = error => reject(error);
    });
};


const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<Tab>(Tab.VIDEO_GENERATOR);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('gemini-api-key') || '');

  const [generationState, setGenerationState] = useState<GenerationState>({
    isGenerating: false,
    progress: 0,
    message: '',
    status: 'idle',
  });
  
  // State for single video generator
  const [singlePrompt, setSinglePrompt] = useState('');
  const [singleImage, setSingleImage] = useState<File | undefined>();
  const [singleVideoResult, setSingleVideoResult] = useState<string | null>(null);

  // State for batch video generator
  const [segments, setSegments] = useState<BatchSegment[]>([
    { id: crypto.randomUUID(), prompt: '', image: undefined, status: 'idle' },
  ]);

  // State for image generator
  const [imagePrompt, setImagePrompt] = useState('');
  const [imageResults, setImageResults] = useState<string[]>([]);
  const [imageAspectRatio, setImageAspectRatio] = useState('1:1');
  
  const handleApiKeySave = (newKey: string) => {
    setApiKey(newKey);
    localStorage.setItem('gemini-api-key', newKey);
  };

  useEffect(() => {
    // On initial load, check if the key is missing and prompt the user.
    const key = localStorage.getItem('gemini-api-key') || process.env.API_KEY;
    if (!key) {
      setIsSettingsOpen(true);
    }
  }, []);

  const handleSendScriptToBatch = (script: string) => {
    // Split the script by one or more newlines to create segments
    const scriptSegments = script.split(/\n\s*\n/).filter(s => s.trim().length > 0);
    
    if (scriptSegments.length > 0) {
      const newSegments: BatchSegment[] = scriptSegments.map(prompt => ({
        id: crypto.randomUUID(),
        prompt: prompt.trim(),
        image: undefined,
        status: 'idle',
      }));
      setSegments(newSegments);
    } else {
      // Handle case with no valid segments, maybe just create one empty one
       setSegments([{ id: crypto.randomUUID(), prompt: script.trim(), image: undefined, status: 'idle' }]);
    }
    
    setActiveTab(Tab.BATCH_GENERATOR);
  };
  
  const handleGenerate = useCallback(async () => {
    const effectiveApiKey = apiKey || process.env.API_KEY;
    if (!effectiveApiKey) {
      setGenerationState({
        isGenerating: false,
        progress: 100,
        message: 'API Key is not set. Please add it in the settings.',
        status: 'error',
      });
      setIsSettingsOpen(true);
      return;
    }

    // Clean up old object URLs to prevent memory leaks
    if (singleVideoResult) URL.revokeObjectURL(singleVideoResult);
    segments.forEach(seg => {
      if (seg.videoUrl) URL.revokeObjectURL(seg.videoUrl);
    });

    // Reset previous results based on active tab
    if (activeTab === Tab.VIDEO_GENERATOR) {
      setSingleVideoResult(null);
    } else if (activeTab === Tab.BATCH_GENERATOR) {
      setSegments(s => s.map(seg => ({ ...seg, videoUrl: undefined, status: 'idle' })));
    } else if (activeTab === Tab.IMAGE_GENERATOR) {
      setImageResults([]);
    }


    setGenerationState({
      isGenerating: true,
      progress: 0,
      message: 'Initializing...',
      status: 'generating',
    });

    try {
      const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
      
      if (activeTab === Tab.IMAGE_GENERATOR) {
        setGenerationState(prevState => ({ ...prevState, progress: 10, message: 'Generating images...' }));
        const response = await ai.models.generateImages({
          model: 'imagen-4.0-generate-001',
          prompt: imagePrompt,
          config: {
            numberOfImages: 1,
            outputMimeType: 'image/jpeg',
            aspectRatio: imageAspectRatio,
          },
        });
        setGenerationState(prevState => ({ ...prevState, progress: 90, message: 'Finalizing images...' }));
        const imageUrls = response.generatedImages.map(img => `data:image/jpeg;base64,${img.image.imageBytes}`);
        setImageResults(imageUrls);

      } else { // Handle video generation
        const generateVideo = async (prompt: string, imageFile?: File) => {
          if (!prompt.trim()) {
              throw new Error("Prompt cannot be empty.");
          }
          
          const image = imageFile ? {
              imageBytes: await fileToBase64(imageFile),
              mimeType: imageFile.type,
          } : undefined;
  
          let operation = await ai.models.generateVideos({
              model: 'veo-2.0-generate-001',
              prompt,
              image,
              config: { numberOfVideos: 1 }
          });
  
          setGenerationState(prevState => ({ ...prevState, progress: 10, message: `Processing: ${prompt.substring(0, 30)}...` }));
  
          let pollCount = 0;
          const maxPolls = 30; // ~5 minutes timeout if polling every 10s
  
          while (!operation.done && pollCount < maxPolls) {
              await new Promise(resolve => setTimeout(resolve, 10000));
              operation = await ai.operations.getVideosOperation({ operation });
              pollCount++;
              const progress = 10 + (pollCount / maxPolls) * 80;
              setGenerationState(prevState => ({ ...prevState, progress, message: `Polling for results... (${pollCount})` }));
          }
  
          if (!operation.done) {
              throw new Error("Video generation timed out.");
          }
          
          const downloadLink = operation.response?.generatedVideos?.[0]?.video?.uri;
          if (!downloadLink) {
              throw new Error("No video URI found in the generation response.");
          }
          
          setGenerationState(prevState => ({ ...prevState, progress: 95, message: 'Downloading video...' }));
          
          const videoResponse = await fetch(`${downloadLink}&key=${effectiveApiKey}`);
          if (!videoResponse.ok) {
              throw new Error(`Failed to download generated video: ${videoResponse.statusText}`);
          }
          const videoBlob = await videoResponse.blob();
          return URL.createObjectURL(videoBlob);
        };
  
        if (activeTab === Tab.VIDEO_GENERATOR) {
          const videoUrl = await generateVideo(singlePrompt, singleImage);
          setSingleVideoResult(videoUrl);
        } else if (activeTab === Tab.BATCH_GENERATOR) {
            const segmentsToGenerate = segments.filter(s => s.prompt.trim());
            if (segmentsToGenerate.length === 0) {
                throw new Error("No prompts provided for batch generation.");
            }

            let hasErrors = false;
            for (const segment of segmentsToGenerate) {
                try {
                    setSegments(prev => prev.map(s => s.id === segment.id ? {...s, status: 'generating'} : s));
                    const videoUrl = await generateVideo(segment.prompt, segment.image);
                    setSegments(prev => prev.map(s => s.id === segment.id ? {...s, videoUrl, status: 'success'} : s));
                } catch (error) {
                    console.error(`Failed to generate video for segment ${segment.id}:`, error);
                    hasErrors = true;
                    setSegments(prev => prev.map(s => s.id === segment.id ? {...s, status: 'error'} : s));
                }
            }
            
            // Set final global state after all segments are processed
            setGenerationState({
                isGenerating: false,
                progress: 100,
                message: hasErrors ? 'Batch generation completed with errors.' : 'Batch generation successful!',
                status: hasErrors ? 'error' : 'success',
            });
            // Early return to prevent overwriting the specific batch status
            return; 
        }
      }

      setGenerationState({
        isGenerating: false,
        progress: 100,
        message: 'Generation successful!',
        status: 'success',
      });

    } catch (e) {
      console.error("Generation failed:", e);
      setGenerationState({
        isGenerating: false,
        progress: 100,
        message: e instanceof Error ? e.message : 'An unknown error occurred.',
        status: 'error',
      });
    }
  }, [activeTab, singlePrompt, singleImage, segments, imagePrompt, imageAspectRatio, apiKey]);
  
  const mainButtonText = activeTab === Tab.IMAGE_GENERATOR ? 'Generate Image' : 'Generate Video';

  const renderActiveTab = () => {
    switch (activeTab) {
      case Tab.VIDEO_GENERATOR:
        return <VideoGeneratorTab 
          prompt={singlePrompt}
          setPrompt={setSinglePrompt}
          image={singleImage}
          setImage={setSingleImage}
          videoUrl={singleVideoResult} 
        />;
      case Tab.BATCH_GENERATOR:
        return <BatchGeneratorTab segments={segments} setSegments={setSegments} />;
      case Tab.IMAGE_GENERATOR:
        return <ImageGeneratorTab 
            prompt={imagePrompt} 
            setPrompt={setImagePrompt} 
            images={imageResults} 
            aspectRatio={imageAspectRatio}
            setAspectRatio={setImageAspectRatio}
        />;
      case Tab.PROMPT_GENERATOR:
        return <PromptGeneratorTab onSendToBatch={handleSendScriptToBatch} apiKey={apiKey} />;
      default:
        return <VideoGeneratorTab 
          prompt={singlePrompt}
          setPrompt={setSinglePrompt}
          image={singleImage}
          setImage={setSingleImage}
          videoUrl={singleVideoResult} 
        />;
    }
  };

  const tabs: { id: Tab; label: string }[] = [
    { id: Tab.VIDEO_GENERATOR, label: 'Video Generator' },
    { id: Tab.BATCH_GENERATOR, label: 'Batch Video Generator' },
    { id: Tab.IMAGE_GENERATOR, label: 'Image Generator' },
    { id: Tab.PROMPT_GENERATOR, label: 'Creative Assistant' },
  ];

  return (
    <div className="flex flex-col h-screen font-sans">
      <Header onSettingsClick={() => setIsSettingsOpen(true)} />
      <main className="flex-grow flex flex-col container mx-auto px-4 py-8 overflow-y-auto">
        <div className="border-b border-white/10 mb-6">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? 'border-brand-primary text-brand-primary'
                    : 'border-transparent text-brand-text-muted hover:text-brand-text hover:border-gray-300'
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-brand-accent rounded-t-md`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
        <div className="flex-grow">{renderActiveTab()}</div>
      </main>
      <Footer onGenerateClick={handleGenerate} generationState={generationState} buttonText={mainButtonText} />
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
        apiKey={apiKey}
        onSave={handleApiKeySave}
      />
    </div>
  );
};

export default App;