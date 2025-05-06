import React, { createContext, useContext, useState } from 'react';

interface CanvasState {
  tool: string;
  toolSize: number;
  color: string;
}

interface CanvasContextType {
  state: CanvasState;
  setTool: (tool: string) => void;
  setToolSize: (size: number) => void;
  setColor: (color: string) => void;
}

const CanvasContext = createContext<CanvasContextType | undefined>(undefined);

export const CanvasProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<CanvasState>({
    tool: 'cursor',
    toolSize: 1,
    color: '#000000',
  });

  const setTool = (tool: string) => setState((prev) => ({ ...prev, tool }));
  const setToolSize = (toolSize: number) => setState((prev) => ({ ...prev, toolSize }));
  const setColor = (color: string) => setState((prev) => ({ ...prev, color }));

  return (
    <CanvasContext.Provider value={{ state, setTool, setToolSize, setColor }}>
      {children}
    </CanvasContext.Provider>
  );
};

export const useCanvas = () => {
  const context = useContext(CanvasContext);
  if (!context) {
    throw new Error('useCanvas must be used within a CanvasProvider');
  }
  return context;
};
