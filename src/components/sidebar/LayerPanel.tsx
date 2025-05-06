import React from 'react';
import { useCanvas } from '../../hooks/useCanvas';

const LayerPanel: React.FC = () => {
  const { state, setCurrentLayer } = useCanvas();

  return (
    <div className="p-2">
      <h2 className="font-semibold mb-2">Layers</h2>
      <ul className="space-y-1">
        {state.layers.map((layer, index) => (
          <li
            key={index}
            className={`p-2 border rounded cursor-pointer ${
              index === state.currentLayer ? 'bg-gray-200 font-bold' : 'bg-white'
            }`}
            onClick={() => setCurrentLayer(index)}
          >
            {layer.name}
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LayerPanel;
