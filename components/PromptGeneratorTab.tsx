import React, { useState, useCallback, useEffect } from 'react';
import { SparklesIcon } from './icons/SparklesIcon';
import { CopyIcon } from './icons/CopyIcon';
import { SendIcon } from './icons/SendIcon';
import { GoogleGenAI } from "@google/genai";
import type { PromptGeneratorTabProps } from '../types';

export const PromptGeneratorTab: React.FC<PromptGeneratorTabProps> = ({ onSendToBatch, apiKey }) => {
    const [prompt, setPrompt] = useState('Write a short opening scene for a sci-fi movie set on a desert planet.');
    const [generatedResult, setGeneratedResult] = useState<string>('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [isCopied, setIsCopied] = useState(false);

    const handleCopy = () => {
        if (generatedResult) {
            navigator.clipboard.writeText(generatedResult);
            setIsCopied(true);
        }
    };

    const handleSendToBatch = () => {
        if (generatedResult) {
            onSendToBatch(generatedResult);
        }
    }

    // Reset the "Copied!" state after a short delay
    useEffect(() => {
        if (isCopied) {
            const timer = setTimeout(() => setIsCopied(false), 2000);
            return () => clearTimeout(timer);
        }
    }, [isCopied]);

    const generateCreativeText = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        setGeneratedResult('');

        try {
            const effectiveApiKey = apiKey || process.env.API_KEY;
            if (!effectiveApiKey) {
                throw new Error("API Key is not set. Please add it in the settings.");
            }
             if (!prompt.trim()) {
                throw new Error("Prompt cannot be empty.");
            }
            const ai = new GoogleGenAI({ apiKey: effectiveApiKey });
            
            const response = await ai.models.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt,
            });

            setGeneratedResult(response.text);

        } catch (e) {
            console.error(e);
            setError(e instanceof Error ? e.message : "An unknown error occurred.");
        } finally {
            setIsLoading(false);
        }
    }, [prompt, apiKey]);
    
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div className="bg-brand-surface rounded-lg border border-white/10 p-6">
                 <h2 className="text-lg font-semibold text-brand-text mb-4">Creative Assistant</h2>
                 <p className="text-sm text-brand-text-muted mb-4">
                    Ask for anything creative. Generate a movie script, write a compelling narrative, brainstorm plot twists, or create character dialogues.
                 </p>
                <textarea
                    rows={6}
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    className="w-full bg-brand-bg border border-white/20 rounded-md px-3 py-2 focus:ring-2 focus:ring-brand-accent focus:border-brand-accent placeholder-brand-text-muted resize-y"
                    placeholder="e.g., 'Write a dialogue between a robot and a flower' or 'Generate three ideas for a fantasy video game'..."
                />
            </div>
            
            <div className="text-center">
                 <button 
                    onClick={generateCreativeText}
                    disabled={isLoading || !prompt.trim()}
                    className="inline-flex items-center px-6 py-2 bg-brand-secondary text-white font-semibold rounded-md hover:bg-opacity-90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <SparklesIcon className="w-5 h-5 mr-2"/>
                    {isLoading ? 'Generating...' : 'Generate'}
                </button>
            </div>

            <div className="space-y-4">
                {error && <div className="text-center text-red-400 p-4 bg-red-500/10 rounded-md">{error}</div>}
                {isLoading && (
                    <div className="text-center p-4">
                        <div className="w-8 h-8 border-4 border-dashed rounded-full animate-spin border-brand-accent mx-auto"></div>
                        <p className="mt-2 text-brand-text-muted">The AI is thinking...</p>
                    </div>
                )}
                {generatedResult && (
                    <div className="bg-brand-surface rounded-lg border border-white/10 animate-fade-in">
                        <div className="p-6">
                            <h3 className="font-semibold text-brand-text mb-4">Generated Result</h3>
                            <pre className="text-brand-text-muted whitespace-pre-wrap font-sans text-sm leading-relaxed bg-brand-bg p-4 rounded-md">{generatedResult}</pre>
                        </div>
                        <div className="border-t border-white/10 px-6 py-3 flex items-center justify-end space-x-4">
                            <button 
                                onClick={handleCopy}
                                className={`flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
                                    isCopied 
                                    ? 'bg-green-500/20 text-green-400'
                                    : 'bg-white/10 hover:bg-white/20 text-brand-text-muted'
                                }`}
                            >
                                <CopyIcon className="w-4 h-4 mr-2" />
                                {isCopied ? 'Copied!' : 'Copy'}
                            </button>
                            <button
                                onClick={handleSendToBatch}
                                className="flex items-center px-4 py-2 text-sm font-medium rounded-md bg-brand-accent/20 text-brand-accent hover:bg-brand-accent/30 transition-colors"
                            >
                                <SendIcon className="w-4 h-4 mr-2" />
                                Send to Batch
                            </button>
                        </div>
                    </div>
                )}
            </div>
            <style>{`
            @keyframes fade-in {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            .animate-fade-in {
                animation: fade-in 0.5s ease-out forwards;
            }
            `}</style>
        </div>
    );
};