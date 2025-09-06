
import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Tool, DrawingState } from './types';
import Toolbar from './components/Toolbar';
import Canvas from './components/Canvas';
import ResultModal from './components/ResultModal';
import { generateImageFromCanvas } from './services/geminiService';
import { UploadIcon, SparklesIcon, XCircleIcon, ArrowUturnLeftIcon, ArrowUturnRightIcon } from './components/Icons';

const App: React.FC = () => {
    const [drawingState, setDrawingState] = useState<DrawingState>({
        tool: Tool.PEN,
        color: '#FFFFFF',
        lineWidth: 5,
    });
    const [prompt, setPrompt] = useState<string>('');
    const [isLoading, setIsLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [generatedImage, setGeneratedImage] = useState<string | null>(null);
    
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const historyRef = useRef<ImageData[]>([]);
    const historyIndexRef = useRef<number>(-1);

    const pushToHistory = useCallback(() => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (context) {
            const imageData = context.getImageData(0, 0, canvas.width, canvas.height);
            historyIndexRef.current++;
            historyRef.current.splice(historyIndexRef.current); // Clear redo history
            historyRef.current.push(imageData);
        }
    }, []);

    const restoreFromHistory = useCallback(() => {
        if (!canvasRef.current || historyRef.current.length === 0 || historyIndexRef.current < 0) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        if (context) {
            context.putImageData(historyRef.current[historyIndexRef.current], 0, 0);
        }
    }, []);

    const undo = useCallback(() => {
        if (historyIndexRef.current > 0) {
            historyIndexRef.current--;
            restoreFromHistory();
        }
    }, [restoreFromHistory]);

    const redo = useCallback(() => {
        if (historyIndexRef.current < historyRef.current.length - 1) {
            historyIndexRef.current++;
            restoreFromHistory();
        }
    }, [restoreFromHistory]);
    
    useEffect(() => {
      // Push initial empty state
      setTimeout(pushToHistory, 100);
    }, [pushToHistory]);

    const handleGenerate = async () => {
        if (!canvasRef.current || !prompt) {
            setError('Please write a prompt to describe your drawing.');
            return;
        }

        setIsLoading(true);
        setError(null);
        setGeneratedImage(null);

        try {
            const canvas = canvasRef.current;
            const imageBase64 = canvas.toDataURL('image/png');
            const result = await generateImageFromCanvas(imageBase64, prompt);
            if (result) {
                setGeneratedImage(result);
            } else {
                setError('Failed to generate image. The model did not return an image.');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An unknown error occurred.');
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleClearCanvas = () => {
        if (canvasRef.current) {
            const canvas = canvasRef.current;
            const context = canvas.getContext('2d');
            if (context) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                pushToHistory();
            }
        }
    };

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && canvasRef.current) {
            const reader = new FileReader();
            reader.onload = (event) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;
                    const ctx = canvas.getContext('2d');
                    if (!ctx) return;
                    // Scale image to fit canvas
                    const hRatio = canvas.width / img.width;
                    const vRatio = canvas.height / img.height;
                    const ratio = Math.min(hRatio, vRatio);
                    const centerShift_x = (canvas.width - img.width * ratio) / 2;
                    const centerShift_y = (canvas.height - img.height * ratio) / 2;
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                    ctx.drawImage(img, 0, 0, img.width, img.height,
                        centerShift_x, centerShift_y, img.width * ratio, img.height * ratio);
                    pushToHistory();
                };
                img.src = event.target?.result as string;
            };
            reader.readAsDataURL(file);
        }
    };
    
    const useImageOnCanvas = (imageBase64: string) => {
        if (!canvasRef.current) return;
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const img = new Image();
        img.onload = () => {
            if (context) {
                context.clearRect(0, 0, canvas.width, canvas.height);
                context.drawImage(img, 0, 0, canvas.width, canvas.height);
                pushToHistory();
            }
        };
        img.src = imageBase64;
        setGeneratedImage(null);
    };

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 font-sans">
            <header className="w-full max-w-7xl text-center mb-4">
                <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-600">
                    Draw to Image AI
                </h1>
                <p className="text-gray-400">
                    Unleash your creativity. Draw, describe, and let AI bring your vision to life.
                </p>
            </header>

            <div className="w-full max-w-7xl flex flex-col lg:flex-row gap-4">
                <aside className="lg:w-1/6 flex flex-row lg:flex-col gap-4 bg-gray-800 p-4 rounded-lg shadow-lg">
                    <Toolbar drawingState={drawingState} setDrawingState={setDrawingState} />
                    <div className="flex flex-col gap-3">
                         <button onClick={undo} className="p-2 bg-gray-700 rounded-md hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"><ArrowUturnLeftIcon /> Undo</button>
                         <button onClick={redo} className="p-2 bg-gray-700 rounded-md hover:bg-purple-600 transition-colors flex items-center justify-center gap-2"><ArrowUturnRightIcon /> Redo</button>
                    </div>
                </aside>

                <main className="flex-1 flex flex-col gap-4">
                    <div className="relative w-full aspect-video bg-gray-800 rounded-lg shadow-lg overflow-hidden">
                      <Canvas 
                        ref={canvasRef} 
                        drawingState={drawingState} 
                        onDrawEnd={pushToHistory}
                      />
                    </div>
                    <div className="bg-gray-800 p-4 rounded-lg shadow-lg flex flex-col md:flex-row items-center gap-4">
                        <input
                            type="text"
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="e.g., A photorealistic cat sitting on a windowsill, sunbathing"
                            className="flex-grow bg-gray-700 border border-gray-600 rounded-md p-3 focus:ring-2 focus:ring-purple-500 focus:outline-none transition"
                        />
                        <div className="flex items-center gap-2">
                            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" className="hidden" />
                            <button
                                onClick={() => fileInputRef.current?.click()}
                                className="bg-gray-700 hover:bg-gray-600 text-white font-semibold py-3 px-4 rounded-md transition-colors flex items-center gap-2"
                                title="Upload Base Image"
                            >
                                <UploadIcon />
                            </button>
                             <button
                                onClick={handleClearCanvas}
                                className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-4 rounded-md transition-colors flex items-center gap-2"
                                title="Clear Canvas"
                            >
                                <XCircleIcon />
                            </button>
                            <button
                                onClick={handleGenerate}
                                disabled={isLoading || !prompt}
                                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-semibold py-3 px-6 rounded-md transition-all transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:scale-100 flex items-center gap-2"
                            >
                                {isLoading ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Generating...
                                    </>
                                ) : (
                                    <>
                                        <SparklesIcon />
                                        Generate
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                     {error && (
                        <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded-md relative" role="alert">
                            <strong className="font-bold">Error: </strong>
                            <span className="block sm:inline">{error}</span>
                            <button onClick={() => setError(null)} className="absolute top-0 bottom-0 right-0 px-4 py-3">
                                <svg className="fill-current h-6 w-6 text-red-200" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z"/></svg>
                            </button>
                        </div>
                    )}
                </main>
            </div>

            {generatedImage && (
                <ResultModal
                    imageUrl={generatedImage}
                    onClose={() => setGeneratedImage(null)}
                    onDownload={() => {
                        const link = document.createElement('a');
                        link.href = generatedImage;
                        link.download = 'generated-image.png';
                        link.click();
                    }}
                    onUseOnCanvas={useImageOnCanvas}
                    onGenerateVariation={handleGenerate}
                />
            )}
        </div>
    );
};

export default App;
