import React from 'react';
import { useCanvas } from '../hooks/useCanvas';

const tools = [
  { name: 'Cursor', value: 'cursor' },
  { name: 'Pencil (S)', value: 'pencil-s' },
  { name: 'Pencil (M)', value: 'pencil-m' },
  { name: 'Pencil (L)', value: 'pencil-l' },
  { name: 'Highlighter', value: 'highlighter' },
  { name: 'Eraser (S)', value: 'eraser-s' },
  { name: 'Eraser (M)', value: 'eraser-m' },
  { name: 'Eraser (L)', value: 'eraser-l' },
  { name: 'Shapes', value: 'shape' },
  { name: 'Sticky Note', value: 'sticky-note' },
  { name: 'Add Text', value: 'text' },
  { name: 'Insert Table', value: 'table' },
];

const ToolPanel: React.FC = () => {
  const { state, setTool, setToolSize } = useCanvas();

  const handleToolSelect = (tool: string) => {
    if (tool.startsWith('pencil')) {
      setTool('pencil');
      if (tool.endsWith('s')) setToolSize(1);
      else if (tool.endsWith('m')) setToolSize(3);
      else if (tool.endsWith('l')) setToolSize(5);
    } else if (tool.startsWith('eraser')) {
      setTool('eraser');
      if (tool.endsWith('s')) setToolSize(5);
      else if (tool.endsWith('m')) setToolSize(15);
      else if (tool.endsWith('l')) setToolSize(25);
    } else {
      setTool(tool);
    }
  };

  return (
    <div className="p-2">
      <h2 className="font-semibold mb-2">Tools</h2>
      <div className="flex flex-col gap-2">
        {tools.map(({ name, value }) => (
          <button
            key={value}
            className={`px-2 py-1 rounded text-left border hover:bg-gray-100 ${
              state.tool === value ? 'bg-blue-200' : ''
            }`}
            onClick={() => handleToolSelect(value)}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default ToolPanel;
