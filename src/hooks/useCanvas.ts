import { useState, useCallback } from 'react';

interface Layer {
  name: string;
  visible: boolean;
  canvas: HTMLCanvasElement | null;
}

interface CanvasState {
  color: string;
  brushSize: number;
  highlighterSize: number;
  tool: string;
  layers: Layer[];
  currentLayer: number;
  size: number;
  toolSize: number;
  history: ImageData[];
  historyIndex: number;
  opacity: number;
}

export const useCanvas = () => {
  const [state, setState] = useState<CanvasState>({
    color: '#000000',
    brushSize: 2,
    highlighterSize: 10,
    tool: 'pen',
    layers: [{ name: 'Layer 1', visible: true, canvas: null }],
    currentLayer: 0,
    size: 5,
    toolSize: 1,
    history: [],
    historyIndex: -1,
    opacity: 1
  });

  const setColor = useCallback((color: string) => {
    setState(prev => ({ ...prev, color }));
  }, []);

  const setBrushSize = useCallback((brushSize: number) => {
    setState(prev => ({ ...prev, brushSize }));
  }, []);

  const setHighlighterSize = useCallback((highlighterSize: number) => {
    setState(prev => ({ ...prev, highlighterSize }));
  }, []);

  const setTool = useCallback((tool: string) => {
    setState(prev => ({ ...prev, tool }));
  }, []);

  const setToolSize = (size: number) => setState(prev => ({ ...prev, toolSize: size }));
  const setOpacity = useCallback((opacity: number) => {
    setState(prev => ({ ...prev, opacity }));
  }, []);
  
  const setCurrentLayer = (index: number) => setState(prev => ({ ...prev, currentLayer: index }));
  
  const addLayer = useCallback(() => {
    setState(prev => ({
      ...prev,
      layers: [...prev.layers, { name: `Layer ${prev.layers.length + 1}`, visible: true, canvas: null }],
      currentLayer: prev.layers.length
    }));
  }, []);

  const removeLayer = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      layers: prev.layers.filter((_, i) => i !== index),
      currentLayer: Math.min(prev.currentLayer, prev.layers.length - 2)
    }));
  }, []);

  const toggleLayerVisibility = useCallback((index: number) => {
    setState(prev => ({
      ...prev,
      layers: prev.layers.map((layer, i) => 
        i === index ? { ...layer, visible: !layer.visible } : layer
      )
    }));
  }, []);

  const saveToHistory = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    setState(prev => {
      // Remove any future states if we're not at the end
      const newHistory = prev.history.slice(0, prev.historyIndex + 1);
      newHistory.push(imageData);
      
      // Limit history to last 50 states to prevent memory issues
      const limitedHistory = newHistory.slice(-50);
      
      return {
        ...prev,
        history: limitedHistory,
        historyIndex: limitedHistory.length - 1
      };
    });
  }, []);

  const undo = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setState(prev => {
      if (prev.historyIndex <= 0) return prev;

      const newIndex = prev.historyIndex - 1;
      const imageData = prev.history[newIndex];
      
      // Clear canvas before putting the previous state
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);

      return {
        ...prev,
        historyIndex: newIndex
      };
    });
  }, []);

  const redo = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setState(prev => {
      if (prev.historyIndex >= prev.history.length - 1) return prev;

      const newIndex = prev.historyIndex + 1;
      const imageData = prev.history[newIndex];
      
      // Clear canvas before putting the next state
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(imageData, 0, 0);

      return {
        ...prev,
        historyIndex: newIndex
      };
    });
  }, []);

  const clearCanvas = useCallback((canvas: HTMLCanvasElement) => {
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Save current state before clearing
    saveToHistory(canvas);

    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // Save the cleared state
    saveToHistory(canvas);
  }, [saveToHistory]);

  const saveAsImage = useCallback((canvas: HTMLCanvasElement) => {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = dataUrl;
    link.click();
  }, []);

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
    setHighlighterSize,
    setTool, 
    setToolSize,
    setCurrentLayer,
    addLayer,
    removeLayer,
    toggleLayerVisibility,
    undo,
    redo,
    clearCanvas,
    saveAsImage,
    saveToHistory,
    addStickyNote,
    addTextBox,
    insertTable,
    setOpacity
  };
}; 