import React, { useRef, useEffect } from 'react';
import { useCanvas } from '../hooks/useCanvas';

interface CanvasProps {
  activeTool: string;
  activeColor: string;
  activeBrushSize: number;
}

const Canvas: React.FC<CanvasProps> = ({ activeTool, activeColor, activeBrushSize }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const { state, addStickyNote, addTextBox, insertTable } = useCanvas();
  const isDrawing = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;

    let drawing = false;
    let startX = 0;
    let startY = 0;

    const getMousePos = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      };
    };

    const onMouseDown = (e: MouseEvent) => {
      const { x, y } = getMousePos(e);
      startX = x;
      startY = y;
      drawing = true;

      if (state.tool === 'sticky-note') {
        addStickyNote(x, y);
        return;
      }
      if (state.tool === 'text') {
        addTextBox(x, y);
        return;
      }
      if (state.tool === 'table') {
        insertTable(x, y);
        return;
      }
    };

    const onMouseMove = (e: MouseEvent) => {
      if (!drawing || !ctx) return;
      const { x, y } = getMousePos(e);

      if (state.tool === 'pencil') {
        ctx.strokeStyle = state.color;
        ctx.lineWidth = state.size;
        ctx.lineCap = 'round';
        ctx.lineTo(x, y);
        ctx.stroke();
      } else if (state.tool === 'eraser') {
        ctx.clearRect(x - state.size / 2, y - state.size / 2, state.size, state.size);
      } else if (state.tool === 'highlighter') {
        ctx.strokeStyle = state.color;
        ctx.globalAlpha = 0.3;
        ctx.lineWidth = state.size * 3;
        ctx.lineCap = 'round';
        ctx.lineTo(x, y);
        ctx.stroke();
        ctx.globalAlpha = 1.0;
      }
    };

    const onMouseUp = (e: MouseEvent) => {
      drawing = false;
      ctx?.beginPath();

      if (state.tool === 'shape') {
        const { x, y } = getMousePos(e);
        ctx.strokeStyle = state.color;
        ctx.lineWidth = 2;
        ctx.strokeRect(startX, startY, x - startX, y - startY);
      }
    };

    canvas.addEventListener('mousedown', onMouseDown);
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseup', onMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', onMouseDown);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseup', onMouseUp);
    };
  }, [state]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    return () => window.removeEventListener('resize', resizeCanvas);
  }, []);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    isDrawing.current = true;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    lastX.current = e.clientX - rect.left;
    lastY.current = e.clientY - rect.top;
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const rect = canvas.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(lastX.current, lastY.current);
    ctx.lineTo(currentX, currentY);
    ctx.strokeStyle = activeTool === 'eraser' ? '#FFFFFF' : activeColor;
    ctx.lineWidth = activeBrushSize;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();

    lastX.current = currentX;
    lastY.current = currentY;
  };

  const stopDrawing = () => {
    isDrawing.current = false;
  };

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full border bg-white rounded"
      onMouseDown={startDrawing}
      onMouseMove={draw}
      onMouseUp={stopDrawing}
      onMouseOut={stopDrawing}
    ></canvas>
  );
};

export default Canvas;
