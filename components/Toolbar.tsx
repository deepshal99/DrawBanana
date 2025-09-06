
import React from 'react';
import { DrawingState, Tool } from '../types';
import { PencilIcon, EraserIcon } from './Icons';

interface ToolbarProps {
    drawingState: DrawingState;
    setDrawingState: React.Dispatch<React.SetStateAction<DrawingState>>;
}

const ToolButton: React.FC<{
    label: string;
    icon: React.ReactNode;
    isActive: boolean;
    onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
    <button
        title={label}
        onClick={onClick}
        className={`w-full flex items-center justify-center p-3 rounded-lg transition-colors ${
            isActive ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
        }`}
    >
        {icon}
    </button>
);


const Toolbar: React.FC<ToolbarProps> = ({ drawingState, setDrawingState }) => {
    const handleToolChange = (tool: Tool) => {
        setDrawingState(prev => ({ ...prev, tool }));
    };

    const handleColorChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDrawingState(prev => ({ ...prev, color: e.target.value }));
    };

    const handleLineWidthChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setDrawingState(prev => ({ ...prev, lineWidth: parseInt(e.target.value, 10) }));
    };

    return (
        <div className="flex flex-row lg:flex-col gap-4 w-full">
            <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
                <ToolButton
                    label="Pen"
                    icon={<PencilIcon />}
                    isActive={drawingState.tool === Tool.PEN}
                    onClick={() => handleToolChange(Tool.PEN)}
                />
                <ToolButton
                    label="Eraser"
                    icon={<EraserIcon />}
                    isActive={drawingState.tool === Tool.ERASER}
                    onClick={() => handleToolChange(Tool.ERASER)}
                />
            </div>
            
            <div className="flex flex-col gap-2 items-center">
                 <label htmlFor="color-picker" className="text-sm font-medium text-gray-400">Color</label>
                 <input
                    id="color-picker"
                    type="color"
                    value={drawingState.color}
                    onChange={handleColorChange}
                    className="w-12 h-12 p-1 bg-gray-700 rounded-lg border-2 border-gray-600 cursor-pointer"
                />
            </div>
            
            <div className="flex flex-col gap-2 items-center w-full">
                <label htmlFor="line-width" className="text-sm font-medium text-gray-400">
                    Size: {drawingState.lineWidth}
                </label>
                <input
                    id="line-width"
                    type="range"
                    min="1"
                    max="50"
                    value={drawingState.lineWidth}
                    onChange={handleLineWidthChange}
                    className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer accent-purple-500"
                />
            </div>
        </div>
    );
};

export default Toolbar;
