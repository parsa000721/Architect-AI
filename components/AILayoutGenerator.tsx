import React, { useState } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { CanvasElement } from '../types';
import { toolboxItems } from './PlanDesigner';
import { SparklesIcon } from './icons/IconComponents';

interface AILayoutGeneratorProps {
    onGenerate: (elements: CanvasElement[]) => void;
    onClose: () => void;
}

export const AILayoutGenerator: React.FC<AILayoutGeneratorProps> = ({ onGenerate, onClose }) => {
    const [prompt, setPrompt] = useState('Create a simple and modern one-bedroom apartment layout with an open kitchen.');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleGenerate = async () => {
        if (!prompt) {
            setError('कृपया एक प्रॉम्प्ट दर्ज करें।');
            return;
        }
        setIsLoading(true);
        setError(null);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

            const elementSchema = {
                type: Type.OBJECT,
                properties: {
                    id: { type: Type.STRING, description: "A unique identifier, e.g., 'el_12345'" },
                    type: { type: Type.STRING, description: `The type of the element. Must be one of: ${toolboxItems.join(', ')}` },
                    x: { type: Type.NUMBER, description: "The x-coordinate of the top-left corner." },
                    y: { type: Type.NUMBER, description: "The y-coordinate of the top-left corner." },
                    width: { type: Type.NUMBER },
                    height: { type: Type.NUMBER },
                    rotation: { type: Type.NUMBER, description: "Rotation in degrees, from 0 to 360." }
                },
                required: ['id', 'type', 'x', 'y', 'width', 'height', 'rotation']
            };
            
            const planSchema = {
                type: Type.ARRAY,
                items: elementSchema
            };

            const fullPrompt = `
                You are an expert architectural assistant. Your task is to generate a floor plan based on the user's request.
                The available canvas space is approximately from x=0, y=0 to x=1000, y=800. Design the layout to fit well within this area.
                Ensure all elements have valid properties and unique IDs.
                Here is the user's request: "${prompt}"
            `;
            
            const response = await ai.models.generateContent({
                model: 'gemini-2.5-flash',
                contents: fullPrompt,
                config: {
                    responseMimeType: "application/json",
                    responseSchema: planSchema
                }
            });

            const generatedText = response.text;
            const generatedElements = JSON.parse(generatedText) as CanvasElement[];
            
            if (!Array.isArray(generatedElements)) {
                throw new Error("AI did not return a valid array of elements.");
            }
            
            onGenerate(generatedElements);

        } catch (e) {
            console.error("AI Generation Error:", e);
            setError('लेआउट जेनरेट करने में विफल। कृपया पुनः प्रयास करें।');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/60 z-40 flex items-center justify-center p-4 animate-fade-in-fast" onClick={onClose}>
            <div className="bg-white dark:bg-secondary-800 rounded-xl shadow-2xl w-full max-w-2xl transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="p-6 border-b border-secondary-200 dark:border-secondary-700">
                    <h3 className="text-2xl font-bold text-secondary-900 dark:text-white flex items-center gap-3">
                        <SparklesIcon className="w-7 h-7 text-primary-500" />
                        AI लेआउट जेनरेटर
                    </h3>
                     <p className="text-secondary-500 mt-2">अपने फ्लोर प्लान के लिए एक विचार का वर्णन करें, और AI इसे आपके लिए बनाएगा।</p>
                </div>
                <div className="p-6 space-y-4">
                    <label htmlFor="ai-prompt" className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                        प्रॉम्प्ट
                    </label>
                    <textarea
                        id="ai-prompt"
                        rows={4}
                        value={prompt}
                        onChange={e => setPrompt(e.target.value)}
                        className="w-full p-3 bg-secondary-50 dark:bg-secondary-900/50 border border-secondary-300 dark:border-secondary-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:outline-none transition"
                        placeholder="जैसे, 'एक आरामदायक स्टूडियो अपार्टमेंट जिसमें सोने का क्षेत्र और एक छोटी रसोई हो'..."
                    />
                    {error && <p className="text-sm text-red-500">{error}</p>}
                </div>
                <div className="px-6 py-4 bg-secondary-50 dark:bg-secondary-800/50 flex justify-end items-center gap-4 rounded-b-xl">
                     <button
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-semibold text-secondary-700 dark:text-secondary-300 bg-transparent hover:bg-secondary-200 dark:hover:bg-secondary-700 rounded-lg transition-colors"
                        disabled={isLoading}
                    >
                        रद्द करें
                    </button>
                    <button
                        onClick={handleGenerate}
                        className="px-6 py-2 text-sm font-semibold text-white bg-primary-600 rounded-lg shadow-md hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-800 disabled:bg-primary-400 disabled:cursor-not-allowed flex items-center gap-2"
                        disabled={isLoading}
                    >
                        {isLoading ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                जेनरेट हो रहा है...
                            </>
                        ) : (
                            'जेनरेट करें'
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};
