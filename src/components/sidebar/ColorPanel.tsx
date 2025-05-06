import React from 'react';
import { useCanvas } from '../../hooks/useCanvas';

const colors = ['#000000', '#FF0000', '#00FF00', '#0000FF', '#FFFF00', '#FF00FF', '#00FFFF'];

const ColorPanel: React.FC = () => {
  const { state, setColor } = useCanvas();

  return (
    <div className="p-2 border-b">
      <h2 className="font-semibold mb-2">Colors</h2>
      <div className="flex flex-wrap gap-2">
        {colors.map((color) => (
          <div
            key={color}
            className={`w-6 h-6 rounded-full cursor-pointer border ${
              state.color === color ? 'ring-2 ring-black' : ''
            }`}
            style={{ backgroundColor: color }}
            onClick={() => setColor(color)}
          />
        ))}
      </div>
    </div>
  );
};

export default ColorPanel;
