import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Canvas from './Canvas';
import StickyNote from './StickyNote';
import { useCanvas } from '../hooks/useCanvas';

// Pastel color palette
const COLORS = {
  primary: '#f8e1e7', // Light pink
  secondary: '#e1f8f5', // Light cyan
  accent: '#fee4bd', // Light peach
  background: '#f9f9f9', // Off-white
  dark: '#6e7891', // Muted blue-gray
  text: '#4a4a4a',
  pastelPalette: ['#f8e1e7', '#e1f8f5', '#fee4bd', '#e6e1f8', '#dcf8e1', '#f8e1e1']
};

// Predefined colors for the color picker
const COLOR_PRESETS = [
  '#4a4a4a', // Dark gray
  '#f44336', // Red
  '#2196f3', // Blue
  '#4caf50', // Green
  '#ff9800', // Orange
  '#9c27b0'  // Purple
];

const DrawingApp: React.FC = () => {
  const [showPenSettings, setShowPenSettings] = useState(false);
  const [showEraserSizes, setShowEraserSizes] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showShapeOptions, setShowShapeOptions] = useState(false);
  const [showBorderOptions, setShowBorderOptions] = useState(false);
  const [showImageUpload, setShowImageUpload] = useState(false);
  const [showTableOptions, setShowTableOptions] = useState(false);
  const [penWidth, setPenWidth] = useState(5);
  const [opacity, setOpacity] = useState(10);
  const [selectedColor, setSelectedColor] = useState('#4a4a4a');
  const [customColor, setCustomColor] = useState('#4a4a4a');
  const [selectedShape, setSelectedShape] = useState('rectangle');
  const [borderSettings, setBorderSettings] = useState<{
    type: string;
    width: number;
    color: string;
    active: boolean;
  }>({
    type: 'solid',
    width: 2,
    color: '#000000',
    active: false
  });
  const { 
    state, 
    setTool, 
    setBrushSize, 
    setColor,
    setOpacity: setCanvasOpacity,
    undo,
    redo,
    clearCanvas,
    saveAsImage,
    saveToHistory,
    getHistory
  } = useCanvas();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stickyNotes, setStickyNotes] = useState<Array<{ id: number; color: string; x: number; y: number }>>([]);
  const [showStickyNotes, setShowStickyNotes] = useState(false);
  const stickyNoteColors = COLORS.pastelPalette;
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [tableConfig, setTableConfig] = useState<{
    rows: number;
    cols: number;
    cellWidth: number;
    cellHeight: number;
    borderColor: string;
    x: number;
    y: number;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [tableSettings, setTableSettings] = useState({
    rows: 3,
    cols: 3,
    cellWidth: 60,
    cellHeight: 40,
    borderColor: '#000000'
  });

  // Save initial state when canvas is ready
  useEffect(() => {
    if (canvasRef.current) {
      // A short delay to ensure canvas is fully rendered
      setTimeout(() => {
        // Make sure we start with a clean history when the app initializes
        if (getHistory().length === 0) {
          console.log('[APP] Initializing canvas history with blank state');
          saveToHistory(canvasRef.current!);
        } else {
          console.log('[APP] Canvas history already initialized, skipping');
        }
      }, 500);
    }
  }, [saveToHistory, getHistory]);

  const handleToolSelect = (tool: string) => {
    setTool(tool);
    setShowPenSettings(tool === 'pen');
    setShowEraserSizes(tool === 'eraser');
    setShowShapeOptions(tool === 'shape');
    setShowBorderOptions(false);
    setShowImageUpload(false);
    setShowTableOptions(tool === 'table');
    setShowColorPicker(false);
    setShowStickyNotes(false);
  };

  const handleShapeSelect = (shape: string) => {
    setSelectedShape(shape);
  };

  const handleUndo = () => {
    if (canvasRef.current) {
      undo(canvasRef.current, () => {
        // After undo, trigger the canvas to redraw table texts
        // We'll use a custom event to communicate with the Canvas component
        const event = new CustomEvent('redrawTableTexts');
        canvasRef.current?.dispatchEvent(event);
      });
    }
  };

  const handleRedo = () => {
    if (canvasRef.current) {
      redo(canvasRef.current, () => {
        // After redo, trigger the canvas to redraw table texts
        const event = new CustomEvent('redrawTableTexts');
        canvasRef.current?.dispatchEvent(event);
      });
    }
  };

  const handleClear = () => {
    if (canvasRef.current) {
      clearCanvas(canvasRef.current);
    }
  };

  const handleSave = () => {
    if (canvasRef.current) {
      saveAsImage(canvasRef.current);
    }
  };

  const handleColorChange = (color: string) => {
    setSelectedColor(color);
    setCustomColor(color);
    setColor(color);
  };

  const handlePenWidthChange = (width: number) => {
    setPenWidth(width);
    setBrushSize(width);
  };

  const handleOpacityChange = (value: number) => {
    setOpacity(value);
    setCanvasOpacity(value / 10);
  };

  const handleStickyNoteClick = () => {
    setShowStickyNotes(!showStickyNotes);
    setShowPenSettings(false);
    setShowEraserSizes(false);
    setShowColorPicker(false);
  };

  const addStickyNote = (color: string) => {
    const newNote = {
      id: Date.now(),
      color,
      x: Math.random() * (window.innerWidth - 200) + 50,
      y: Math.random() * (window.innerHeight - 200) + 50
    };
    setStickyNotes(prev => [...prev, newNote]);
  };

  const deleteStickyNote = (id: number) => {
    setStickyNotes(notes => notes.filter(note => note.id !== id));
  };

  const toggleBorderOptions = () => {
    setShowBorderOptions(!showBorderOptions);
    setShowPenSettings(false);
    setShowEraserSizes(false);
    setShowShapeOptions(false);
    setShowColorPicker(false);
    setShowStickyNotes(false);
  };

  const handleBorderTypeChange = (type: string) => {
    setBorderSettings({
      ...borderSettings,
      type,
      active: true
    });
  };

  const handleBorderWidthChange = (width: number) => {
    setBorderSettings({
      ...borderSettings,
      width,
      active: true
    });
  };

  const handleBorderColorChange = (color: string) => {
    setBorderSettings({
      ...borderSettings,
      color,
      active: true
    });
  };

  const toggleBorder = () => {
    setBorderSettings({
      ...borderSettings,
      active: !borderSettings.active
    });
  };

  const toggleImageUpload = () => {
    setShowImageUpload(!showImageUpload);
    setShowPenSettings(false);
    setShowEraserSizes(false);
    setShowShapeOptions(false);
    setShowBorderOptions(false);
    setShowColorPicker(false);
    setShowStickyNotes(false);
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedImage(e.target.files[0]);
      // Close the panel after selection
      setShowImageUpload(false);
    }
  };

  const triggerFileInput = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Reset selected image after it's been inserted
  useEffect(() => {
    if (selectedImage) {
      // Reset the selected image after a short delay to ensure it's processed
      const timer = setTimeout(() => {
        setSelectedImage(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [selectedImage]);

  const toggleTableOptions = () => {
    setShowTableOptions(!showTableOptions);
    setShowPenSettings(false);
    setShowEraserSizes(false);
    setShowShapeOptions(false);
    setShowBorderOptions(false);
    setShowImageUpload(false);
    setShowColorPicker(false);
    setShowStickyNotes(false);
    
    // If opening the table options, also set the tool to 'table'
    if (!showTableOptions) {
      setTool('table');
    }
  };

  const updateTableSetting = (key: keyof typeof tableSettings, value: number | string) => {
    setTableSettings(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Reset table config after it's been inserted
  useEffect(() => {
    if (tableConfig) {
      // Reset the table config after a short delay to ensure it's processed
      const timer = setTimeout(() => {
        setTableConfig(null);
      }, 500);
      return () => clearTimeout(timer);
    }
  }, [tableConfig]);

  const PresetColorButton = ({ color }: { color: string }) => (
    <button
      onClick={() => handleColorChange(color)}
      className={`w-7 h-7 rounded-full hover:scale-110 transition-transform ${selectedColor === color ? 'ring-2 ring-offset-2 ring-gray-500' : ''}`}
      style={{ backgroundColor: color }}
      aria-label={`Select color ${color}`}
    />
  );

  return (
    <div className="flex flex-col h-screen bg-white">
      {/* Header - Now with pastel accent color */}
      <header className="py-3 px-4 border-b border-gray-100 flex items-center justify-between" style={{ backgroundColor: COLORS.primary }}>
        <div className="flex items-center">
          <svg 
            className="w-7 h-7 mr-2" 
            fill={COLORS.dark} 
            viewBox="0 0 24 24"
          >
            <path d="M7,14c-1.66,0-3,1.34-3,3c0,1.31-1.16,2-2,2c0.92,1.22,2.5,2,4,2c2.21,0,4-1.79,4-4C10,15.34,8.66,14,7,14z M20.71,4.29l-1-1c-0.39-0.39-1.02-0.39-1.41,0L9,12.59V15h2.41l9.29-9.29C21.1,5.32,21.1,4.69,20.71,4.29z" />
          </svg>
          <h1 className="text-xl font-medium text-gray-800">PixelCraft</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button 
            onClick={handleUndo}
            className="p-2 rounded-full hover:bg-white/50 text-gray-600"
            title="Undo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
            </svg>
          </button>
          <button 
            onClick={handleRedo}
            className="p-2 rounded-full hover:bg-white/50 text-gray-600"
            title="Redo"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 10H4a8 8 0 00-8 8v2M14 10l-6 6m6-6l-6-6" />
            </svg>
          </button>
          <button 
            onClick={handleClear}
            className="p-2 rounded-full hover:bg-white/50 text-gray-600"
            title="Clear Canvas"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <button 
            onClick={handleSave}
            className="p-2 rounded-full hover:bg-white/50 text-gray-600"
            title="Save Image"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left Toolbar - Now with pastel background and increased width */}
        <div className="w-16 border-r border-gray-100 flex flex-col items-center py-4 space-y-5" style={{ backgroundColor: COLORS.secondary }}>
          <button
            onClick={() => handleToolSelect('pen')}
            className={`p-2 rounded-lg transition-colors ${
              state.tool === 'pen' ? 'bg-white' : 'hover:bg-white/70'
            }`}
            title="Pen"
          >
            <svg className="w-5 h-5" fill="none" stroke={COLORS.dark} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
            </svg>
          </button>
          
          <button
            onClick={() => handleToolSelect('eraser')}
            className={`p-2 rounded-lg transition-colors ${
              state.tool === 'eraser' ? 'bg-white' : 'hover:bg-white/70'
            }`}
            title="Eraser"
          >
            <svg className="w-5 h-5" fill="none" stroke={COLORS.dark} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          
          <button
            onClick={() => handleToolSelect('line')}
            className={`p-2 rounded-lg transition-colors ${
              state.tool === 'line' ? 'bg-white' : 'hover:bg-white/70'
            }`}
            title="Line"
          >
            <svg className="w-5 h-5" fill="none" stroke={COLORS.dark} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 19L19 5" />
            </svg>
          </button>

          <button
            onClick={() => handleToolSelect('shape')}
            className={`p-2 rounded-lg transition-colors ${
              state.tool === 'shape' ? 'bg-white' : 'hover:bg-white/70'
            }`}
            title="Shapes"
          >
            <svg className="w-5 h-5" fill="none" stroke={COLORS.dark} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 5h16a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1z" />
            </svg>
          </button>

          <button
            onClick={handleStickyNoteClick}
            className={`p-2 rounded-lg transition-colors ${
              showStickyNotes ? 'bg-white' : 'hover:bg-white/70'
            }`}
            title="Sticky Notes"
          >
            <svg className="w-5 h-5" fill="none" stroke={COLORS.dark} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>

          <button
            onClick={toggleBorderOptions}
            className={`p-2 rounded-lg transition-colors ${
              showBorderOptions ? 'bg-white' : 'hover:bg-white/70'
            }`}
            title="Border Settings"
          >
            <svg className="w-5 h-5" fill="none" stroke={COLORS.dark} viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" strokeWidth="2" strokeDasharray={borderSettings.active ? "4 2" : "0 0"} />
            </svg>
          </button>

          <button
            onClick={toggleImageUpload}
            className={`p-2 rounded-lg transition-colors ${
              showImageUpload ? 'bg-white' : 'hover:bg-white/70'
            }`}
            title="Insert Image"
          >
            <svg className="w-5 h-5" fill="none" stroke={COLORS.dark} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          </button>

          <button
            onClick={toggleTableOptions}
            className={`p-2 rounded-lg transition-colors ${
              state.tool === 'table' ? 'bg-white' : 'hover:bg-white/70'
            }`}
            title="Insert Table"
          >
            <svg className="w-5 h-5" fill="none" stroke={COLORS.dark} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 10h18M3 14h18M3 18h18M3 6h18" />
            </svg>
          </button>
        </div>

        {/* Main Canvas Area - Clean white background, rounded corners */}
        <div className="flex-1 relative bg-white p-2">
          <div className="rounded-xl h-full overflow-hidden">
            <Canvas
              ref={canvasRef}
              activeTool={state.tool}
              activeColor={selectedColor}
              activeBrushSize={penWidth}
              activeOpacity={opacity}
              activeShape={state.tool === 'shape' ? selectedShape : undefined}
              activeBorder={borderSettings.active ? {
                type: borderSettings.type,
                width: borderSettings.width,
                color: borderSettings.color
              } : undefined}
              imageToInsert={selectedImage}
              tableConfig={state.tool === 'table' ? tableSettings : null}
            />
          </div>

          {/* Hidden file input for image upload */}
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleImageSelect}
            accept="image/*"
            className="hidden"
          />

          {/* Sticky Notes */}
          {stickyNotes.map(note => (
            <StickyNote
              key={note.id}
              id={note.id}
              color={note.color}
              initialX={note.x}
              initialY={note.y}
              onDelete={deleteStickyNote}
            />
          ))}
        </div>
      </div>

      {/* Settings Panels - Floating, modern style with pastel colors */}
      <AnimatePresence>
        {showPenSettings && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-20 top-16 bg-white rounded-xl shadow-lg p-4 w-64 border border-gray-100 z-50"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-700">Pen Settings</h3>
              <button 
                onClick={() => setShowPenSettings(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Color</label>
                <div className="flex flex-wrap gap-2 mb-3">
                  {COLOR_PRESETS.map(color => (
                    <PresetColorButton key={color} color={color} />
                  ))}
                </div>
                
                <div className="mt-2">
                  <label className="block text-xs font-medium text-gray-500 mb-2">Custom Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={customColor}
                      onChange={(e) => {
                        setCustomColor(e.target.value);
                      }}
                      className="w-10 h-8 rounded cursor-pointer border-0"
                    />
                    <button 
                      onClick={() => handleColorChange(customColor)}
                      className="px-2 py-1 bg-gray-100 rounded text-xs font-medium hover:bg-gray-200"
                    >
                      Apply
                    </button>
                  </div>
                </div>
                
                <div 
                  className="mt-2 h-4 w-full rounded"
                  style={{ backgroundColor: selectedColor }}
                ></div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Width</label>
                <input
                  type="range"
                  min="1"
                  max="30"
                  value={penWidth}
                  onChange={(e) => handlePenWidthChange(Number(e.target.value))}
                  className="w-full accent-pink-300"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1px</span>
                  <span>{penWidth}px</span>
                  <span>30px</span>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Transparency</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={opacity}
                  onChange={(e) => handleOpacityChange(Number(e.target.value))}
                  className="w-full accent-cyan-300"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>Low</span>
                  <span>{opacity}/10</span>
                  <span>High</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {showEraserSizes && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-20 top-16 bg-white rounded-xl shadow-lg p-4 w-48 border border-gray-100 z-50"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-700">Eraser Size</h3>
              <button 
                onClick={() => setShowEraserSizes(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handlePenWidthChange(5)}
                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 rounded-lg flex items-center"
              >
                <div className="w-3 h-3 bg-gray-300 rounded-full mr-2"></div>
                Small (5px)
              </button>
              <button
                onClick={() => handlePenWidthChange(15)}
                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 rounded-lg flex items-center"
              >
                <div className="w-4 h-4 bg-gray-300 rounded-full mr-2"></div>
                Medium (15px)
              </button>
              <button
                onClick={() => handlePenWidthChange(25)}
                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 rounded-lg flex items-center"
              >
                <div className="w-5 h-5 bg-gray-300 rounded-full mr-2"></div>
                Large (25px)
              </button>
              <button
                onClick={() => handlePenWidthChange(40)}
                className="w-full px-3 py-2 text-sm text-left hover:bg-gray-50 rounded-lg flex items-center"
              >
                <div className="w-6 h-6 bg-gray-300 rounded-full mr-2"></div>
                Extra Large (40px)
              </button>
            </div>
          </motion.div>
        )}

        {showShapeOptions && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-20 top-16 bg-white rounded-xl shadow-lg p-4 w-48 border border-gray-100 z-50"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-700">Shape</h3>
              <button 
                onClick={() => setShowShapeOptions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              <button
                onClick={() => handleShapeSelect('rectangle')}
                className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 rounded-lg flex items-center ${selectedShape === 'rectangle' ? 'bg-gray-100' : ''}`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <rect x="4" y="4" width="16" height="16" rx="1" strokeWidth="2" />
                </svg>
                Rectangle
              </button>
              <button
                onClick={() => handleShapeSelect('circle')}
                className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 rounded-lg flex items-center ${selectedShape === 'circle' ? 'bg-gray-100' : ''}`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <circle cx="12" cy="12" r="8" strokeWidth="2" />
                </svg>
                Circle
              </button>
              <button
                onClick={() => handleShapeSelect('triangle')}
                className={`w-full px-3 py-2 text-sm text-left hover:bg-gray-50 rounded-lg flex items-center ${selectedShape === 'triangle' ? 'bg-gray-100' : ''}`}
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path d="M12 4L4 20H20L12 4Z" strokeWidth="2" />
                </svg>
                Triangle
              </button>
            </div>
          </motion.div>
        )}

        {showStickyNotes && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-20 top-16 bg-white rounded-xl shadow-lg p-4 w-48 border border-gray-100 z-50"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-700">Sticky Notes</h3>
              <button 
                onClick={() => setShowStickyNotes(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="grid grid-cols-3 gap-2">
              {stickyNoteColors.map((color, index) => (
                <button
                  key={index}
                  onClick={() => addStickyNote(color)}
                  className="w-full aspect-square rounded-lg shadow-sm hover:shadow-md transition-shadow"
                  style={{ backgroundColor: color }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {showBorderOptions && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-20 top-16 bg-white rounded-xl shadow-lg p-4 w-64 border border-gray-100 z-50"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-700">Border Settings</h3>
              <button 
                onClick={() => setShowBorderOptions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Enable Border</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    className="sr-only peer"
                    checked={borderSettings.active}
                    onChange={toggleBorder}
                  />
                  <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Border Type</label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleBorderTypeChange('solid')}
                    className={`p-2 border rounded-md flex items-center justify-center ${borderSettings.type === 'solid' ? 'bg-gray-100 border-gray-400' : 'border-gray-200'}`}
                  >
                    <div className="w-full h-3 bg-gray-800"></div>
                  </button>
                  <button
                    onClick={() => handleBorderTypeChange('dotted')}
                    className={`p-2 border rounded-md flex items-center justify-center ${borderSettings.type === 'dotted' ? 'bg-gray-100 border-gray-400' : 'border-gray-200'}`}
                  >
                    <svg width="100%" height="3" xmlns="http://www.w3.org/2000/svg">
                      <line x1="0" y1="1.5" x2="100" y2="1.5" stroke="#333" strokeWidth="3" strokeDasharray="3,3" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Border Width</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={borderSettings.width}
                  onChange={(e) => handleBorderWidthChange(Number(e.target.value))}
                  className="w-full accent-blue-300"
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>1px</span>
                  <span>{borderSettings.width}px</span>
                  <span>10px</span>
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Border Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={borderSettings.color}
                    onChange={(e) => handleBorderColorChange(e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer border-0"
                  />
                  <div 
                    className="ml-2 flex-1 h-8 rounded border border-gray-200"
                    style={{ backgroundColor: borderSettings.color }}
                  ></div>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {showImageUpload && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-20 top-16 bg-white rounded-xl shadow-lg p-4 w-64 border border-gray-100 z-50"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-700">Insert Image</h3>
              <button 
                onClick={() => setShowImageUpload(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors" onClick={triggerFileInput}>
                <svg className="w-10 h-10 mx-auto text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
                <p className="mt-2 text-sm text-gray-500">Click to select an image</p>
                <p className="text-xs text-gray-400 mt-1">JPG, PNG, GIF formats</p>
              </div>
            </div>
          </motion.div>
        )}

        {showTableOptions && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute left-20 top-16 bg-white rounded-xl shadow-lg p-4 w-72 border border-gray-100 z-50"
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-medium text-gray-700">Table Settings</h3>
              <button 
                onClick={() => setShowTableOptions(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Rows</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tableSettings.rows}
                    onChange={(e) => updateTableSetting('rows', Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">Columns</label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={tableSettings.cols}
                    onChange={(e) => updateTableSetting('cols', Math.max(1, parseInt(e.target.value) || 1))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-xs font-medium text-gray-500 mb-2">Border Color</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={tableSettings.borderColor}
                    onChange={(e) => updateTableSetting('borderColor', e.target.value)}
                    className="w-10 h-8 rounded cursor-pointer border-0"
                  />
                  <div 
                    className="ml-2 flex-1 h-8 rounded border border-gray-200"
                    style={{ backgroundColor: tableSettings.borderColor }}
                  ></div>
                </div>
              </div>
              
              <div className="p-3 bg-gray-50 rounded-md text-sm text-gray-600">
                <p className="flex items-center">
                  <svg className="w-4 h-4 mr-2 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Click and drag on the canvas to create your table
                </p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DrawingApp; 