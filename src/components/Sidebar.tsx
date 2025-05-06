'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SidebarProps {
  activePanel: string;
  setActivePanel: (panel: string) => void;
  activeTool: string;
  setActiveTool: (tool: string) => void;
  activeColor: string;
  setActiveColor: (color: string) => void;
  activeBrushSize: number;
  setActiveBrushSize: (size: number) => void;
}

// Mock data for layers panel
const mockLayers = [
  { id: 1, name: 'Background', visible: true, locked: false },
  { id: 2, name: 'Sketch', visible: true, locked: false },
  { id: 3, name: 'Details', visible: true, locked: false },
  { id: 4, name: 'Highlights', visible: true, locked: false },
];

// Color palette data
const colorPalette = [
  '#000000', // Black
  '#FFFFFF', // White
  '#FF0000', // Red
  '#00FF00', // Green
  '#0000FF', // Blue
  '#FFFF00', // Yellow
  '#FF00FF', // Magenta
  '#00FFFF', // Cyan
  '#FFA500', // Orange
  '#800080', // Purple
];

// Brush sizes
const brushSizes = [2, 5, 10, 20, 30];

// Shape tools
const shapeTools = ['Rectangle', 'Circle', 'Line', 'Triangle'];

const Sidebar: React.FC<SidebarProps> = ({
  activePanel,
  setActivePanel,
  activeTool,
  setActiveTool,
  activeColor,
  setActiveColor,
  activeBrushSize,
  setActiveBrushSize,
}) => {
  return (
    <div className="w-full h-full bg-white shadow-lg">
      {/* Tool Selection Tabs */}
      <div className="flex border-b">
        <button 
          className={`flex-1 py-3 px-4 text-center font-medium ${activePanel === 'colors' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActivePanel('colors')}
        >
          Colors
        </button>
        <button 
          className={`flex-1 py-3 px-4 text-center font-medium ${activePanel === 'brushes' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActivePanel('brushes')}
        >
          Brush
        </button>
        <button 
          className={`flex-1 py-3 px-4 text-center font-medium ${activePanel === 'layers' ? 'text-indigo-600 border-b-2 border-indigo-600' : 'text-gray-500'}`}
          onClick={() => setActivePanel('layers')}
        >
          Layers
        </button>
      </div>

      {/* Panel Content */}
      <div className="p-4">
        {/* Color Palette Panel */}
        {activePanel === 'colors' && (
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Color Palette</h3>
            <div className="grid grid-cols-5 gap-2">
              {colorPalette.map((color) => (
                <button
                  key={color}
                  className={`w-full aspect-square rounded-md border-2 ${activeColor === color ? 'border-indigo-600' : 'border-gray-200'}`}
                  style={{ backgroundColor: color }}
                  onClick={() => setActiveColor(color)}
                />
              ))}
            </div>
            <div className="mt-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Custom Color</label>
              <input 
                type="color" 
                value={activeColor}
                onChange={(e) => setActiveColor(e.target.value)}
                className="w-full h-10 cursor-pointer rounded border border-gray-300"
              />
            </div>
          </div>
        )}

        {/* Brush Settings Panel */}
        {activePanel === 'brushes' && (
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Tools</h3>
            <div className="grid grid-cols-3 gap-2 mb-6">
              <button
                className={`p-2 text-center rounded ${activeTool === 'brush' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setActiveTool('brush')}
              >
                <svg className="w-6 h-6 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M9.75 20.85c1.78-2.12 4.05-3.61 6.5-4.28M15.75 12l-8.45 8.45c-.3.3-.3.79 0 1.09.12.12.28.2.45.24l3.03.44c.44.06.86-.18 1.06-.56L15.75 12zm0 0l3-3m3.75-10.5L19 2l-5.25 5.25 3 3 5.25-5.25-2.5-2.5z" />
                </svg>
                Brush
              </button>
              <button
                className={`p-2 text-center rounded ${activeTool === 'eraser' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setActiveTool('eraser')}
              >
                <svg className="w-6 h-6 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M2.586 15.408l6 6a2 2 0 002.828 0l12-12a2 2 0 000-2.828l-6-6a2 2 0 00-2.828 0l-12 12a2 2 0 000 2.828zM5.414 15L15 5.414 18.586 9 9 18.586 5.414 15z" />
                </svg>
                Eraser
              </button>
              <button
                className={`p-2 text-center rounded ${activeTool === 'shapes' ? 'bg-indigo-100 text-indigo-700' : 'bg-gray-100 text-gray-700'}`}
                onClick={() => setActiveTool('shapes')}
              >
                <svg className="w-6 h-6 mx-auto mb-1" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M11 13h2v2h-2v-2zm0-6h2v2h-2V7zm6-4H7a4 4 0 00-4 4v10a4 4 0 004 4h10a4 4 0 004-4V7a4 4 0 00-4-4z" />
                </svg>
                Shapes
              </button>
            </div>

            {/* Brush Size Slider */}
            <h3 className="font-medium text-gray-700 mb-3">Brush Size</h3>
            <input
              type="range"
              min="1"
              max="50"
              value={activeBrushSize}
              onChange={(e) => setActiveBrushSize(parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
            />
            <div className="flex justify-between mt-2">
              <span className="text-xs text-gray-500">1px</span>
              <span className="text-xs text-gray-500">50px</span>
            </div>

            {/* Brush Size Presets */}
            <div className="flex justify-between mt-4">
              {brushSizes.map((size) => (
                <button
                  key={size}
                  className={`rounded-full flex items-center justify-center ${activeColor === '#FFFFFF' ? 'border border-gray-300' : ''}`}
                  style={{ 
                    width: size + 10 + 'px', 
                    height: size + 10 + 'px',
                    backgroundColor: activeTool === 'eraser' ? '#FFFFFF' : activeColor 
                  }}
                  onClick={() => setActiveBrushSize(size)}
                />
              ))}
            </div>

            {/* Shape Tools (Only visible when shapes tool is active) */}
            {activeTool === 'shapes' && (
              <div className="mt-6">
                <h3 className="font-medium text-gray-700 mb-3">Shape Tools</h3>
                <div className="grid grid-cols-2 gap-2">
                  {shapeTools.map((shape) => (
                    <button
                      key={shape}
                      className="p-2 bg-gray-100 text-gray-700 rounded hover:bg-indigo-100 hover:text-indigo-700"
                    >
                      {shape}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Layers Panel */}
        {activePanel === 'layers' && (
          <div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-medium text-gray-700">Layers</h3>
              <button className="p-1 text-gray-500 hover:text-indigo-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-2 bg-gray-50 rounded hover:bg-gray-100">
                <div className="flex items-center space-x-2">
                  <button className="text-gray-500">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  </button>
                  <span className="text-sm text-gray-700">Layer 1</span>
                </div>
                <button className="text-gray-500">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Sidebar; 