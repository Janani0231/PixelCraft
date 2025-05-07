import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Canvas from './Canvas';
import Sidebar from './Sidebar';
import StickyNote from './StickyNote';
import { useCanvas } from '../hooks/useCanvas';

const DrawingApp: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [toolsPanelOpen, setToolsPanelOpen] = useState(false);
  const [showPenSettings, setShowPenSettings] = useState(false);
  const [showHighlighterSettings, setShowHighlighterSettings] = useState(false);
  const [showEraserSizes, setShowEraserSizes] = useState(false);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [penWidth, setPenWidth] = useState(5);
  const [highlighterWidth, setHighlighterWidth] = useState(10);
  const [opacity, setOpacity] = useState(10);
  const [selectedColor, setSelectedColor] = useState('#000000');
  const { 
    state, 
    setTool, 
    setBrushSize, 
    setHighlighterSize,
    setColor, 
    undo,
    redo,
    clearCanvas,
    saveAsImage
  } = useCanvas();
  const [activePanel, setActivePanel] = useState('colors');
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stickyNotes, setStickyNotes] = useState<Array<{ id: number; color: string; x: number; y: number }>>([]);
  const [showStickyNotes, setShowStickyNotes] = useState(false);
  const stickyNoteColors = ['#FFD700', '#FF69B4', '#98FB98', '#87CEEB'];

  const handleToolSelect = (tool: string) => {
    setTool(tool);
    setShowPenSettings(tool === 'pen');
    setShowHighlighterSettings(tool === 'highlighter');
    setShowEraserSizes(tool === 'eraser');
    setShowColorPicker(false);
    setShowStickyNotes(false);
  };

  const handleUndo = () => {
    if (canvasRef.current) {
      undo(canvasRef.current);
    }
  };

  const handleRedo = () => {
    if (canvasRef.current) {
      redo(canvasRef.current);
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
    setColor(color);
    setShowColorPicker(false);
  };

  const handlePenWidthChange = (width: number) => {
    setPenWidth(width);
    setBrushSize(width);
  };

  const handleHighlighterWidthChange = (width: number) => {
    setHighlighterWidth(width);
    setHighlighterSize(width);
  };

  const handleOpacityChange = (value: number) => {
    setOpacity(value);
  };

  const handleStickyNoteClick = () => {
    setShowStickyNotes(!showStickyNotes);
    setShowPenSettings(false);
    setShowHighlighterSettings(false);
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

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-gradient-to-r from-purple-600 to-indigo-600 py-4 px-6 shadow-lg">
        <div className="flex items-center justify-between max-w-7xl mx-auto">
          <div className="flex items-center">
            <svg 
              className="w-8 h-8 text-white mr-3" 
              fill="currentColor" 
              viewBox="0 0 24 24"
            >
              <path d="M17.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,9A1.5,1.5 0 0,1 19,10.5A1.5,1.5 0 0,1 17.5,12M14.5,8A1.5,1.5 0 0,1 13,6.5A1.5,1.5 0 0,1 14.5,5A1.5,1.5 0 0,1 16,6.5A1.5,1.5 0 0,1 14.5,8M9.5,8A1.5,1.5 0 0,1 8,6.5A1.5,1.5 0 0,1 9.5,5A1.5,1.5 0 0,1 11,6.5A1.5,1.5 0 0,1 9.5,8M5.5,12A1.5,1.5 0 0,1 4,10.5A1.5,1.5 0 0,1 5.5,9A1.5,1.5 0 0,1 7,10.5A1.5,1.5 0 0,1 5.5,12M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3Z" />
            </svg>
            <h1 className="text-2xl font-bold text-white">PixelCraft</h1>
          </div>
          <p className="text-purple-200 italic">"Where creativity meets precision"</p>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <div className="w-16 bg-gray-800 shadow-lg flex flex-col items-center py-4">
          {/* Tools */}
          <div className="space-y-4">
            <button
              onClick={() => handleToolSelect('pen')}
              className={`p-2 rounded-lg ${state.tool === 'pen' ? 'bg-gray-700' : 'hover:bg-gray-700'} text-white`}
              title="Pen"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={() => handleToolSelect('highlighter')}
              className={`p-2 rounded-lg ${state.tool === 'highlighter' ? 'bg-gray-700' : 'hover:bg-gray-700'} text-white`}
              title="Highlighter"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
              </svg>
            </button>
            <button
              onClick={() => handleToolSelect('eraser')}
              className={`p-2 rounded-lg ${state.tool === 'eraser' ? 'bg-gray-700' : 'hover:bg-gray-700'} text-white`}
              title="Eraser"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={() => handleToolSelect('line')}
              className={`p-2 rounded-lg ${state.tool === 'line' ? 'bg-gray-700' : 'hover:bg-gray-700'} text-white group relative`}
              title="Line"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 19L19 5" />
              </svg>
              <span className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-sm rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                Line
              </span>
            </button>
          </div>

          {/* Add Sticky Note Button */}
          <button
            onClick={handleStickyNoteClick}
            className={`p-2 rounded-lg ${showStickyNotes ? 'bg-gray-700' : 'hover:bg-gray-700'} text-white`}
            title="Sticky Notes"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </button>

          {/* Action Buttons */}
          <div className="mt-auto space-y-4">
            <button
              onClick={handleUndo}
              className="p-2 rounded-lg hover:bg-gray-700 text-white"
              title="Undo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
              </svg>
            </button>
            <button
              onClick={handleRedo}
              className="p-2 rounded-lg hover:bg-gray-700 text-white"
              title="Redo"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 10H11a8 8 0 00-8 8v2M21 10l-6 6m6-6l-6-6" />
              </svg>
            </button>
            <button
              onClick={handleClear}
              className="p-2 rounded-lg hover:bg-gray-700 text-white"
              title="Clear"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
            <button
              onClick={handleSave}
              className="p-2 rounded-lg hover:bg-gray-700 text-white"
              title="Save"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
              </svg>
            </button>
          </div>
        </div>

        {/* Main Canvas Area */}
        <div className="flex-1 p-4 relative">
          <div className="bg-white rounded-lg shadow-lg p-4 h-full">
            <Canvas
              ref={canvasRef}
              activeTool={state.tool}
              activeColor={selectedColor}
              activeBrushSize={penWidth}
              activeOpacity={opacity}
            />
          </div>

          {/* Sticky Notes Panel */}
          {showStickyNotes && (
            <div className="absolute left-20 top-20 bg-white rounded-lg shadow-lg p-4">
              <h3 className="text-lg font-semibold mb-4">Sticky Notes</h3>
              <div className="grid grid-cols-2 gap-4">
                {stickyNoteColors.map((color, index) => (
                  <button
                    key={index}
                    onClick={() => addStickyNote(color)}
                    className="w-16 h-16 rounded-lg shadow-md hover:shadow-lg transition-shadow"
                    style={{ backgroundColor: color }}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Sticky Notes */}
          {stickyNotes.map(note => (
            <StickyNote
              key={note.id}
              color={note.color}
              initialX={note.x}
              initialY={note.y}
            />
          ))}
        </div>

        {/* Settings Panels */}
        {showPenSettings && (
          <div className="absolute left-20 top-20 bg-white rounded-lg shadow-lg p-4 w-64">
            <h3 className="text-lg font-semibold mb-4">Pen Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Color</label>
                <div className="flex items-center space-x-2 mt-1">
                  <div
                    className="w-8 h-8 rounded-full cursor-pointer border-2 border-gray-300"
                    style={{ backgroundColor: selectedColor }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  />
                  {showColorPicker && (
                    <div className="absolute left-24 top-24 bg-white p-2 rounded-lg shadow-lg">
                      <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-32 h-32"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Width</label>
                <input
                  type="range"
                  min="1"
                  max="20"
                  value={penWidth}
                  onChange={(e) => handlePenWidthChange(Number(e.target.value))}
                  className="w-full mt-1"
                />
                <div className="text-sm text-gray-500 mt-1">{penWidth}px</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Transparency</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={opacity}
                  onChange={(e) => handleOpacityChange(Number(e.target.value))}
                  className="w-full mt-1"
                />
                <div className="text-sm text-gray-500 mt-1">{opacity}/10</div>
              </div>
            </div>
          </div>
        )}

        {showHighlighterSettings && (
          <div className="absolute left-20 top-20 bg-white rounded-lg shadow-lg p-4 w-64">
            <h3 className="text-lg font-semibold mb-4">Highlighter Settings</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Color</label>
                <div className="flex items-center space-x-2 mt-1">
                  <div
                    className="w-8 h-8 rounded-full cursor-pointer border-2 border-gray-300"
                    style={{ backgroundColor: selectedColor }}
                    onClick={() => setShowColorPicker(!showColorPicker)}
                  />
                  {showColorPicker && (
                    <div className="absolute left-24 top-24 bg-white p-2 rounded-lg shadow-lg">
                      <input
                        type="color"
                        value={selectedColor}
                        onChange={(e) => handleColorChange(e.target.value)}
                        className="w-32 h-32"
                      />
                    </div>
                  )}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Width</label>
                <input
                  type="range"
                  min="5"
                  max="40"
                  value={highlighterWidth}
                  onChange={(e) => handleHighlighterWidthChange(Number(e.target.value))}
                  className="w-full mt-1"
                />
                <div className="text-sm text-gray-500 mt-1">{highlighterWidth}px</div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Transparency</label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  value={opacity}
                  onChange={(e) => handleOpacityChange(Number(e.target.value))}
                  className="w-full mt-1"
                />
                <div className="text-sm text-gray-500 mt-1">{opacity}/10</div>
              </div>
            </div>
          </div>
        )}

        {showEraserSizes && (
          <div className="absolute left-20 top-20 bg-white rounded-lg shadow-lg p-4">
            <h3 className="text-lg font-semibold mb-4">Eraser Size</h3>
            <div className="space-y-2">
              <button
                onClick={() => handlePenWidthChange(5)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded"
              >
                Small
              </button>
              <button
                onClick={() => handlePenWidthChange(15)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded"
              >
                Medium
              </button>
              <button
                onClick={() => handlePenWidthChange(25)}
                className="w-full px-4 py-2 text-left hover:bg-gray-100 rounded"
              >
                Large
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DrawingApp; 