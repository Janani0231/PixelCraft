import React, { useEffect, useRef, forwardRef, useImperativeHandle } from 'react';
import { useCanvas } from '../hooks/useCanvas';

interface CanvasProps {
  activeTool: string;
  activeColor: string;
  activeBrushSize: number;
  activeOpacity: number;
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>((props, ref) => {
  const { activeTool, activeColor, activeBrushSize, activeOpacity } = props;
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const { saveToHistory, state } = useCanvas();

  useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Set initial canvas state
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = activeBrushSize;
    ctx.globalAlpha = activeOpacity / 10;

    // Only save initial state to history if there's no history yet
    if (state.history.length === 0) {
      saveToHistory(canvas);
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [activeColor, activeBrushSize, activeOpacity, saveToHistory]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set cursor based on active tool
    if (activeTool === 'line') {
      canvas.style.cursor = 'crosshair';
    } else if (activeTool === 'eraser') {
      canvas.style.cursor = 'url("data:image/svg+xml;utf8,<svg xmlns=\'http://www.w3.org/2000/svg\' width=\'24\' height=\'24\' viewBox=\'0 0 24 24\' fill=\'none\' stroke=\'black\' stroke-width=\'2\'><path d=\'M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16\'/></svg>") 0 24, auto';
    } else {
      canvas.style.cursor = 'default';
    }
  }, [activeTool]);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawing.current = true;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    lastX.current = x;
    lastY.current = y;
    startX.current = x;
    startY.current = y;

    if (activeTool === 'line') {
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.stroke();
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.stroke();
    }
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    if (activeTool === 'line') {
      // Create a temporary canvas to store the current state
      const tempCanvas = document.createElement('canvas');
      tempCanvas.width = canvas.width;
      tempCanvas.height = canvas.height;
      const tempCtx = tempCanvas.getContext('2d');
      if (tempCtx) {
        // Draw the current canvas state to the temporary canvas
        tempCtx.drawImage(canvas, 0, 0);
        
        // Clear the main canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Redraw the temporary canvas
        ctx.drawImage(tempCanvas, 0, 0);
        
        // Draw the new line
        ctx.beginPath();
        ctx.moveTo(startX.current, startY.current);
        ctx.lineTo(x, y);
        ctx.stroke();
      }
    } else {
      ctx.beginPath();
      ctx.moveTo(lastX.current, lastY.current);
      ctx.lineTo(x, y);
      ctx.stroke();
    }

    lastX.current = x;
    lastY.current = y;
  };

  const stopDrawing = () => {
    if (!isDrawing.current) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    isDrawing.current = false;
    
    // Reset composite operation
    ctx.globalCompositeOperation = 'source-over';
    
    // Save the final state to history
    saveToHistory(canvas);
  };

  return (
    <canvas
      ref={canvasRef}
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseOut={stopDrawing}
      className="w-full h-full"
    />
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
