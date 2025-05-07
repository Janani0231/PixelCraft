import { useState, useCallback, useRef } from 'react';

interface Layer {
  name: string;
  visible: boolean;
  canvas: HTMLCanvasElement | null;
}

// Keep history as a standalone variable to ensure it persists
// This prevents issues with state synchronization
let globalHistory: ImageData[] = [];
let globalHistoryIndex = -1;

interface CanvasState {
  color: string;
  brushSize: number;
  highlighterSize: number;
  tool: string;
  layers: Layer[];
  currentLayer: number;
  size: number;
  toolSize: number;
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
    opacity: 1
  });

  // Use refs for stable functions
  const lastCanvasRef = useRef<HTMLCanvasElement | null>(null);

  // Getter functions to access history from component
  const getHistory = useCallback(() => globalHistory, []);
  const getHistoryIndex = useCallback(() => globalHistoryIndex, []);

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

  // Get a simple hash of image data to compare
  const getImageDataDigest = (imageData: ImageData): string => {
    // We'll calculate a more detailed fingerprint of the image
    const width = imageData.width;
    const height = imageData.height;
    const data = imageData.data;
    
    // Sample more points and include position information in the digest
    // to better differentiate visually similar shapes in different positions
    const xSamples = 20;
    const ySamples = 20;
    const xStep = Math.max(1, Math.floor(width / xSamples));
    const yStep = Math.max(1, Math.floor(height / ySamples));
    
    let digest = '';
    let nonEmptyPixelsCount = 0;
    
    // Count non-empty pixels in each quadrant of the canvas
    const quadrants = [0, 0, 0, 0];
    const halfWidth = Math.floor(width / 2);
    const halfHeight = Math.floor(height / 2);
    
    // Sample entire image with lower granularity to detect shape changes
    for (let y = 0; y < height; y += yStep) {
      for (let x = 0; x < width; x += xStep) {
        const idx = (y * width + x) * 4;
        
        // Check if pixel is non-transparent
        if (idx < data.length && data[idx + 3] > 0) {
          nonEmptyPixelsCount++;
          
          // Determine which quadrant the pixel is in
          const quadrantIdx = (x < halfWidth ? 0 : 1) + (y < halfHeight ? 0 : 2);
          quadrants[quadrantIdx]++;
          
          // Add position information and color to the digest for a few key pixels
          if (nonEmptyPixelsCount % 10 === 0) {
            digest += `${x},${y}:${data[idx]},${data[idx + 1]},${data[idx + 2]};`;
          }
        }
      }
    }
    
    // Add quadrant information to the digest to detect position changes
    digest += `|Q:${quadrants[0]},${quadrants[1]},${quadrants[2]},${quadrants[3]}`;
    
    // Add total number of non-empty pixels to the digest
    digest += `|T:${nonEmptyPixelsCount}`;
    
    return digest;
  };

  const saveToHistory = useCallback((canvas: HTMLCanvasElement) => {
    lastCanvasRef.current = canvas;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      console.error('[HISTORY] Failed to get context for saving history');
      return;
    }

    try {
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const digest = getImageDataDigest(imageData);
      
      console.log(`[HISTORY] Saving state - Current history length: ${globalHistory.length}, Index: ${globalHistoryIndex}`);
      
      // If it's the first state or we have no history yet
      if (globalHistory.length === 0) {
        globalHistory = [imageData];
        globalHistoryIndex = 0;
        console.log('[HISTORY] Added first state to history');
        return;
      }
      
      // Create a unique ID for this history state
      // Use timestamp and a random string
      const stateId = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}`;
      
      // ⚠️ IMPORTANT: For dot strokes, we'll assume they're always different
      // This is a fallback to ensure proper history for small strokes
      const forceUnique = true;
      
      if (!forceUnique) {
        // Check if the current state is different from the last one
        // Only compare with the last state to avoid false positives
        const lastIndex = globalHistoryIndex;
        const currentDigest = lastIndex >= 0 && lastIndex < globalHistory.length 
          ? getImageDataDigest(globalHistory[lastIndex])
          : '';
        
        if (digest === currentDigest) {
          console.log('[HISTORY] Skipping identical state (no visual changes)');
          return;
        }
        
        console.log(`[HISTORY] New state differs from previous (ID: ${stateId})`);
      } else {
        console.log(`[HISTORY] Forcing unique state (ID: ${stateId})`);
      }
      
      // Remove any future states if we're not at the end
      if (globalHistoryIndex < globalHistory.length - 1) {
        globalHistory = globalHistory.slice(0, globalHistoryIndex + 1);
        console.log('[HISTORY] Truncated future history states');
      }
      
      // Add the new state
      globalHistory.push(imageData);
      globalHistoryIndex = globalHistory.length - 1;
      
      // Limit history to 50 states
      if (globalHistory.length > 50) {
        globalHistory = globalHistory.slice(-50);
        globalHistoryIndex = globalHistory.length - 1;
      }
      
      console.log(`[HISTORY] State saved. New history length: ${globalHistory.length}, Index: ${globalHistoryIndex}`);
    } catch (e) {
      console.error('[HISTORY] Error saving to history:', e);
    }
  }, []);

  const undo = useCallback((canvas: HTMLCanvasElement, onAfterUndo?: () => void) => {
    lastCanvasRef.current = canvas;
    
    console.log(`[UNDO] Requested. Current history index: ${globalHistoryIndex}, Length: ${globalHistory.length}`);
    
    if (globalHistory.length === 0) {
      console.log('[UNDO] No history to undo');
      return;
    }
    
    // If we're at the first state, just restore it and stay there
    if (globalHistoryIndex <= 0) {
      console.log('[UNDO] Already at first state or before it');
      
      if (globalHistory.length > 0) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.putImageData(globalHistory[0], 0, 0);
          globalHistoryIndex = 0;
          console.log('[UNDO] Restored to initial state');
          
          // Call the callback if provided
          if (onAfterUndo) {
            onAfterUndo();
          }
        }
      }
      return;
    }
    
    // Move back one state
    globalHistoryIndex -= 1;
    console.log(`[UNDO] Moving to history index ${globalHistoryIndex}`);
    
    // Apply the previous state
    const ctx = canvas.getContext('2d');
    if (ctx && globalHistoryIndex >= 0 && globalHistoryIndex < globalHistory.length) {
      const prevState = globalHistory[globalHistoryIndex];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(prevState, 0, 0);
      
      // Call the callback if provided
      if (onAfterUndo) {
        onAfterUndo();
      }
    }
  }, []);

  const redo = useCallback((canvas: HTMLCanvasElement, onAfterRedo?: () => void) => {
    lastCanvasRef.current = canvas;
    
    console.log(`[REDO] Requested. Current history index: ${globalHistoryIndex}, Length: ${globalHistory.length}`);
    
    if (globalHistory.length === 0) {
      console.log('[REDO] No history to redo');
      return;
    }
    
    // Check if we can move forward in history
    if (globalHistoryIndex >= globalHistory.length - 1) {
      console.log('[REDO] Already at the latest state');
      return;
    }
    
    // Move forward one state
    globalHistoryIndex += 1;
    console.log(`[REDO] Moving to history index ${globalHistoryIndex}`);
    
    // Apply the next state
    const ctx = canvas.getContext('2d');
    if (ctx && globalHistoryIndex >= 0 && globalHistoryIndex < globalHistory.length) {
      const nextState = globalHistory[globalHistoryIndex];
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(nextState, 0, 0);
      
      // Call the callback if provided
      if (onAfterRedo) {
        onAfterRedo();
      }
    }
  }, []);

  const clearCanvas = useCallback((canvas: HTMLCanvasElement) => {
    lastCanvasRef.current = canvas;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    try {
      // Save current state before clearing
      saveToHistory(canvas);
      
      // Clear the canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Save the cleared state
      saveToHistory(canvas);
      console.log('[CLEAR] Canvas cleared and state saved');
    } catch (e) {
      console.error('[CLEAR] Error clearing canvas:', e);
    }
  }, [saveToHistory]);

  const saveAsImage = useCallback((canvas: HTMLCanvasElement) => {
    lastCanvasRef.current = canvas;
    
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
    setOpacity,
    getHistory,
    getHistoryIndex
  };
}; 