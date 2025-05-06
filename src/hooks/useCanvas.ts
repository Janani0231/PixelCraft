import { useState } from 'react';

interface Layer {
  name: string;
  visible: boolean;
}

interface CanvasState {
  color: string;
  brushSize: number;
  tool: string;
  layers: Layer[];
  currentLayer: number;
  size: number;
  toolSize: number;
}

export const useCanvas = () => {
  const [state, setState] = useState<CanvasState>({
    color: '#000000',
    brushSize: 5,
    tool: 'cursor',
    layers: [{ name: 'Layer 1', visible: true }],
    currentLayer: 0,
    size: 5,
    toolSize: 1
  });

  const setColor = (color: string) => setState(prev => ({ ...prev, color }));
  const setBrushSize = (brushSize: number) => setState(prev => ({ ...prev, brushSize }));
  const setTool = (tool: string) => setState(prev => ({ ...prev, tool }));
  const setToolSize = (size: number) => setState(prev => ({ ...prev, toolSize: size }));
  const setCurrentLayer = (index: number) => setState(prev => ({ ...prev, currentLayer: index }));
  
  const addStickyNote = (x: number, y: number) => {
    // Implementation for adding sticky note
  };
  
  const addTextBox = (x: number, y: number) => {
    // Implementation for adding text box
  };
  
  const insertTable = (x: number, y: number) => {
    // Implementation for inserting table
  };

  return { 
    state, 
    setColor, 
    setBrushSize, 
    setTool, 
    setToolSize,
    setCurrentLayer,
    addStickyNote,
    addTextBox,
    insertTable
  };
}; 