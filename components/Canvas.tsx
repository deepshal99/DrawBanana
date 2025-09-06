
import React, { useRef, useEffect, useImperativeHandle, ForwardedRef, forwardRef } from 'react';
import { DrawingState } from '../types';

interface CanvasProps {
    drawingState: DrawingState;
    onDrawEnd: () => void;
}

const Canvas: React.ForwardRefRenderFunction<HTMLCanvasElement, CanvasProps> = (
    { drawingState, onDrawEnd },
    ref
) => {
    const internalCanvasRef = useRef<HTMLCanvasElement>(null);
    const isDrawing = useRef<boolean>(false);
    const lastPos = useRef<{ x: number; y: number } | null>(null);

    // Expose the internal canvas ref to the parent component
    useImperativeHandle(ref, () => internalCanvasRef.current as HTMLCanvasElement);

    const getCursorClass = () => {
        switch (drawingState.tool) {
            case 'PEN':
                return 'custom-cursor-draw';
            case 'ERASER':
                return 'custom-cursor-eraser';
            default:
                return 'crosshair';
        }
    };

    const getCoords = (e: React.MouseEvent<HTMLCanvasElement>): { x: number; y: number } | null => {
        const canvas = internalCanvasRef.current;
        if (!canvas) return null;
        const rect = canvas.getBoundingClientRect();
        return {
            x: (e.clientX - rect.left) * (canvas.width / rect.width),
            y: (e.clientY - rect.top) * (canvas.height / rect.height)
        };
    };

    const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const coords = getCoords(e);
        if (coords) {
            isDrawing.current = true;
            lastPos.current = coords;
        }
    };

    const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing.current) return;
        const coords = getCoords(e);
        const canvas = internalCanvasRef.current;
        const context = canvas?.getContext('2d');

        if (context && coords && lastPos.current) {
            context.beginPath();
            context.strokeStyle = drawingState.color;
            context.lineWidth = drawingState.lineWidth;
            context.lineCap = 'round';
            context.lineJoin = 'round';
            context.globalCompositeOperation = drawingState.tool === 'ERASER' ? 'destination-out' : 'source-over';
            
            context.moveTo(lastPos.current.x, lastPos.current.y);
            context.lineTo(coords.x, coords.y);
            context.stroke();
            lastPos.current = coords;
        }
    };

    const stopDrawing = () => {
        if(isDrawing.current) {
            isDrawing.current = false;
            lastPos.current = null;
            onDrawEnd();
        }
    };

    useEffect(() => {
        const canvas = internalCanvasRef.current;
        if (canvas) {
            // Set canvas dimensions based on container size for responsiveness
            const container = canvas.parentElement;
            if (container) {
                const { width, height } = container.getBoundingClientRect();
                canvas.width = width;
                canvas.height = height;
            }
        }
    }, []);

    return (
        <canvas
            ref={internalCanvasRef}
            className={`absolute top-0 left-0 w-full h-full ${getCursorClass()}`}
            onMouseDown={startDrawing}
            onMouseMove={draw}
            onMouseUp={stopDrawing}
            onMouseLeave={stopDrawing}
        />
    );
};

export default forwardRef(Canvas);
