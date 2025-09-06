
import React from 'react';
import { DownloadIcon, PaintBrushIcon, ArrowPathIcon, XMarkIcon } from './Icons';

interface ResultModalProps {
    imageUrl: string;
    onClose: () => void;
    onDownload: () => void;
    onUseOnCanvas: (imageUrl: string) => void;
    onGenerateVariation: () => void;
}

const ResultModal: React.FC<ResultModalProps> = ({ 
    imageUrl, 
    onClose, 
    onDownload, 
    onUseOnCanvas,
    onGenerateVariation
}) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 rounded-lg shadow-2xl w-full max-w-4xl max-h-full flex flex-col">
                <div className="p-4 flex justify-between items-center border-b border-gray-700">
                    <h2 className="text-xl font-semibold text-white">Generated Image</h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-white">
                        <XMarkIcon />
                    </button>
                </div>
                
                <div className="p-4 flex-grow overflow-auto flex justify-center items-center">
                    <img src={imageUrl} alt="Generated result" className="max-w-full max-h-[60vh] object-contain rounded-md" />
                </div>
                
                <div className="p-4 bg-gray-800 border-t border-gray-700 grid grid-cols-2 md:grid-cols-3 gap-3">
                     <button onClick={onDownload} className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                        <DownloadIcon />
                        Download
                    </button>
                    <button onClick={() => onUseOnCanvas(imageUrl)} className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                        <PaintBrushIcon />
                        Edit Further
                    </button>
                    <button onClick={onGenerateVariation} className="col-span-2 md:col-span-1 flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-md transition-colors">
                        <ArrowPathIcon />
                        Create Variation
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ResultModal;
