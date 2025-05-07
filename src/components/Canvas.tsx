import React, { useEffect, useRef, forwardRef, useImperativeHandle, useState } from 'react';
import { useCanvas } from '../hooks/useCanvas';

interface TableConfig {
  rows: number;
  cols: number;
  cellWidth: number;
  cellHeight: number;
  borderColor: string;
  x?: number;
  y?: number;
}

// Add interface for table cell data
interface TableCellData {
  row: number;
  col: number;
  text: string;
}

interface CanvasProps {
  activeTool: string;
  activeColor: string;
  activeBrushSize: number;
  activeOpacity: number;
  activeShape?: string;
  activeBorder?: {
    type: string;
    width: number;
    color: string;
  };
  imageToInsert?: File | null;
  tableConfig?: TableConfig | null;
}

const Canvas = forwardRef<HTMLCanvasElement, CanvasProps>((props, ref) => {
  const { 
    activeTool, 
    activeColor, 
    activeBrushSize, 
    activeOpacity, 
    activeShape, 
    activeBorder, 
    imageToInsert,
    tableConfig
  } = props;
  
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const isDrawing = useRef(false);
  const hasDrawn = useRef(false);
  const lastX = useRef(0);
  const lastY = useRef(0);
  const startX = useRef(0);
  const startY = useRef(0);
  const historyInitialized = useRef(false);
  const { saveToHistory, getHistory } = useCanvas();
  // Keep track of the initial state before each stroke
  const initialStrokeState = useRef<ImageData | null>(null);
  const [hasBorder, setHasBorder] = useState(false);
  
  // Add state for table text
  const [tables, setTables] = useState<{
    tableId: string;
    config: TableConfig;
    cells: TableCellData[];
  }[]>([]);
  const [activeTableCell, setActiveTableCell] = useState<{
    tableId: string;
    row: number;
    col: number;
  } | null>(null);
  const [textInputValue, setTextInputValue] = useState("");
  const [textInputPosition, setTextInputPosition] = useState({ x: 0, y: 0 });
  const [showTextInput, setShowTextInput] = useState(false);
  const textInputRef = useRef<HTMLInputElement>(null);
  
  useImperativeHandle(ref, () => canvasRef.current as HTMLCanvasElement);

  // Effect to handle table insertion when tableConfig changes
  useEffect(() => {
    if (!tableConfig) return;
    
    // Skip if x or y are undefined (this happens with the table tool)
    if (tableConfig.x === undefined || tableConfig.y === undefined) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Capture the current state before adding the table
    captureInitialState();

    // Draw the table
    const { rows, cols, cellWidth, cellHeight, borderColor, x, y } = tableConfig;
    const tableWidth = cols * cellWidth;
    const tableHeight = rows * cellHeight;

    // Set table styling
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1;
    
    // Draw the outer border
    ctx.strokeRect(x, y, tableWidth, tableHeight);
    
    // Draw horizontal lines (rows)
    for (let i = 1; i < rows; i++) {
      ctx.beginPath();
      ctx.moveTo(x, y + i * cellHeight);
      ctx.lineTo(x + tableWidth, y + i * cellHeight);
      ctx.stroke();
    }
    
    // Draw vertical lines (columns)
    for (let i = 1; i < cols; i++) {
      ctx.beginPath();
      ctx.moveTo(x + i * cellWidth, y);
      ctx.lineTo(x + i * cellWidth, y + tableHeight);
      ctx.stroke();
    }
    
    // Add this table to our tables state
    const tableId = `table-${Date.now()}`;
    setTables(prevTables => [
      ...prevTables,
      {
        tableId,
        config: tableConfig as Required<TableConfig>,
        cells: []
      }
    ]);
    
    // Save to history
    saveToHistory(canvas);
    
    // Reset styling to default
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = activeBrushSize;
    
    console.log('[CANVAS] Table inserted and saved to history');
  }, [tableConfig, saveToHistory]);

  // Effect to handle image insertion when imageToInsert changes
  useEffect(() => {
    if (!imageToInsert) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Capture the current state before adding the image
    captureInitialState();

    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      if (e.target?.result) {
        img.onload = () => {
          // Calculate image size to fit inside canvas while maintaining aspect ratio
          const MAX_WIDTH = canvas.width * 0.8;
          const MAX_HEIGHT = canvas.height * 0.8;
          
          let width = img.width;
          let height = img.height;
          
          if (width > MAX_WIDTH) {
            height = (MAX_WIDTH / width) * height;
            width = MAX_WIDTH;
          }
          
          if (height > MAX_HEIGHT) {
            width = (MAX_HEIGHT / height) * width;
            height = MAX_HEIGHT;
          }
          
          // Position image in center of canvas
          const x = (canvas.width - width) / 2;
          const y = (canvas.height - height) / 2;
          
          // Draw the image
          ctx.drawImage(img, x, y, width, height);
          
          // Save to history
          saveToHistory(canvas);
          
          console.log('[CANVAS] Image inserted and saved to history');
        };
        
        img.src = e.target.result as string;
      }
    };
    
    reader.readAsDataURL(imageToInsert);
  }, [imageToInsert, saveToHistory]);

  // This effect only runs once on initial mount to set up the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Set canvas size to match container
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        // Save current drawing if it exists
        let prevImageData;
        if (canvas.width > 0 && canvas.height > 0) {
          try {
            prevImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          } catch (e) {
            console.error('[CANVAS] Error saving state during resize:', e);
          }
        }
        
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        
        // Clear canvas to ensure transparency
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Restore the drawing after resize if we had one
        if (prevImageData) {
          try {
            ctx.putImageData(prevImageData, 0, 0);
          } catch (e) {
            console.error('[CANVAS] Error restoring state after resize:', e);
          }
        }
        
        // Reset necessary canvas properties after resize
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.strokeStyle = activeColor;
        ctx.lineWidth = activeBrushSize;
        ctx.globalAlpha = activeOpacity / 10;

        // Draw border if active
        if (activeBorder && activeBorder.type) {
          drawBorder();
        }
      }
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Set initial canvas state
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = activeBrushSize;
    ctx.globalAlpha = activeOpacity / 10;
    
    // Initialize history with blank canvas as first state
    if (!historyInitialized.current && getHistory().length === 0) {
      console.log('[CANVAS] Initializing blank history state');
      saveToHistory(canvas);
      historyInitialized.current = true;
    }

    return () => {
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [activeColor, activeBrushSize, activeOpacity, saveToHistory, getHistory]);

  // This effect runs whenever pen properties change, but doesn't clear the canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Update only the necessary pen properties
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = activeBrushSize;
    ctx.globalAlpha = activeOpacity / 10;
  }, [activeColor, activeBrushSize, activeOpacity]);

  // This effect runs when the border properties change
  useEffect(() => {
    if (activeBorder && activeBorder.type) {
      setHasBorder(true);
      drawBorder();
      
      // Redraw table texts after border changes
      setTimeout(() => {
        redrawAllTableTexts();
      }, 0);
    } else {
      setHasBorder(false);
    }
  }, [activeBorder]);

  // Add effect to listen for the redrawTableTexts event
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const handleRedrawTableTexts = () => {
      console.log('[CANVAS] Redrawing table texts after undo/redo');
      redrawAllTableTexts();
    };
    
    canvas.addEventListener('redrawTableTexts', handleRedrawTableTexts);
    
    return () => {
      canvas.removeEventListener('redrawTableTexts', handleRedrawTableTexts);
    };
  }, [tables]);

  // Effect to redraw table texts after canvas operations
  useEffect(() => {
    // Redraw all table texts after a short delay
    // This helps ensure texts are preserved after operations like undo/redo
    const redrawTimer = setTimeout(() => {
      redrawAllTableTexts();
    }, 50);
    
    return () => clearTimeout(redrawTimer);
  }, [tables]);

  // Add effect to handle resizing and keep table text
  useEffect(() => {
    const handleResize = () => {
      // Wait a bit for canvas to resize then redraw texts
      setTimeout(() => {
        redrawAllTableTexts();
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, [tables]);

  const drawBorder = () => {
    if (!activeBorder) return;
    if (!canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    // Save current drawing state
    ctx.save();

    // Set border properties
    ctx.strokeStyle = activeBorder.color;
    ctx.lineWidth = activeBorder.width;
    
    // Adjust the positioning to prevent cutoff
    const padding = activeBorder.width + 1;
    const width = canvas.width - (padding * 2);
    const height = canvas.height - (padding * 2);
    
    // Clear any existing border
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (initialStrokeState.current) {
      ctx.putImageData(initialStrokeState.current, 0, 0);
    }
    
    // Set line style based on border type
    if (activeBorder.type === 'dotted') {
      ctx.setLineDash([activeBorder.width * 2, activeBorder.width * 2]);
    } else {
      ctx.setLineDash([]);  // Solid border
    }
    
    // Draw the border with padding to avoid cutoff
    ctx.beginPath();
    ctx.rect(padding, padding, width, height);
    ctx.stroke();
    
    // Restore drawing state
    ctx.restore();

    setHasBorder(true);
  };

  // Add function to check if a point is inside a table cell
  const getTableCellAtPoint = (x: number, y: number) => {
    for (const table of tables) {
      const { config } = table;
      const { rows, cols, cellWidth, cellHeight, x: tableX, y: tableY } = config;
      
      // Skip if tableX or tableY is undefined
      if (tableX === undefined || tableY === undefined) continue;
      
      if (
        x >= tableX && 
        x <= tableX + (cols * cellWidth) && 
        y >= tableY && 
        y <= tableY + (rows * cellHeight)
      ) {
        // Point is inside table, determine which cell
        const relativeX = x - tableX;
        const relativeY = y - tableY;
        
        const col = Math.floor(relativeX / cellWidth);
        const row = Math.floor(relativeY / cellHeight);
        
        // Ensure row and col are within bounds
        if (col >= 0 && col < cols && row >= 0 && row < rows) {
          return {
            tableId: table.tableId,
            row,
            col,
            cellX: tableX + (col * cellWidth),
            cellY: tableY + (row * cellHeight)
          };
        }
      }
    }
    
    return null;
  };
  
  // Update startDrawing to handle table cell clicks for text input
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if we clicked on a table cell
    const cell = getTableCellAtPoint(x, y);
    if (cell) {
      handleTableCellClick(cell);
      return;
    }
    
    // Hide text input if clicking elsewhere
    setShowTextInput(false);
    
    // For drawing tools, proceed with original logic
    isDrawing.current = true;
    lastX.current = x;
    lastY.current = y;
    startX.current = x;
    startY.current = y;
    hasDrawn.current = false;
    
    // Capture the current state before starting a new stroke
    captureInitialState();
    
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;
    
    // Set the proper composite operation based on the active tool
    if (activeTool === 'line' || activeTool === 'shape') {
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.moveTo(x, y);
    } else if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath();
      ctx.arc(x, y, activeBrushSize / 2, 0, Math.PI * 2, false);
      ctx.fill();
      hasDrawn.current = true;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x, y);
      ctx.stroke();
      hasDrawn.current = true;
    }
  };
  
  // Handle clicking on a table cell
  const handleTableCellClick = (cell: { tableId: string; row: number; col: number; cellX: number; cellY: number }) => {
    // Find the table
    const table = tables.find(t => t.tableId === cell.tableId);
    if (!table) return;
    
    const { config } = table;
    const { cellWidth, cellHeight } = config;
    
    // Set active table cell
    setActiveTableCell({
      tableId: cell.tableId,
      row: cell.row,
      col: cell.col
    });
    
    // Get existing text for this cell
    const existingCell = table.cells.find(c => c.row === cell.row && c.col === cell.col);
    const existingText = existingCell ? existingCell.text : "";
    
    // Position the text input in the center of the cell
    const inputX = cell.cellX + 5; // Add a small padding
    const inputY = cell.cellY + 5;
    
    setTextInputPosition({ x: inputX, y: inputY });
    setTextInputValue(existingText);
    setShowTextInput(true);
    
    // Focus the input once it's visible
    setTimeout(() => {
      if (textInputRef.current) {
        textInputRef.current.focus();
      }
    }, 10);
  };
  
  // Handle text input change
  const handleTextInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTextInputValue(e.target.value);
  };
  
  // Handle text input blur (when user clicks away or presses Enter)
  const handleTextInputBlur = () => {
    if (!activeTableCell) return;
    
    // Find the table
    const tableIndex = tables.findIndex(t => t.tableId === activeTableCell.tableId);
    if (tableIndex === -1) return;
    
    // Update or add cell text
    const existingCellIndex = tables[tableIndex].cells.findIndex(
      c => c.row === activeTableCell.row && c.col === activeTableCell.col
    );
    
    const newTables = [...tables];
    
    if (existingCellIndex >= 0) {
      // Update existing cell
      newTables[tableIndex].cells[existingCellIndex].text = textInputValue;
    } else {
      // Add new cell
      newTables[tableIndex].cells.push({
        row: activeTableCell.row,
        col: activeTableCell.col,
        text: textInputValue
      });
    }
    
    setTables(newTables);
    
    // Draw the text on the canvas
    drawTableCellText(
      activeTableCell.tableId,
      activeTableCell.row,
      activeTableCell.col,
      textInputValue
    );
    
    // Hide the input
    setShowTextInput(false);
    setActiveTableCell(null);
    
    // Save to history
    if (canvasRef.current) {
      saveToHistory(canvasRef.current);
    }
  };
  
  // Handle key press in text input
  const handleTextInputKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTextInputBlur();
    }
  };
  
  // Draw text in a table cell
  const drawTableCellText = (tableId: string, row: number, col: number, text: string) => {
    if (!canvasRef.current) return;
    
    const table = tables.find(t => t.tableId === tableId);
    if (!table) return;
    
    const { config } = table;
    const { cellWidth, cellHeight, x: tableX, y: tableY } = config;
    
    // Ensure tableX and tableY are defined
    if (tableX === undefined || tableY === undefined) return;
    
    const ctx = canvasRef.current.getContext('2d');
    if (!ctx) return;
    
    // Calculate cell position
    const cellX = tableX + (col * cellWidth);
    const cellY = tableY + (row * cellHeight);
    
    // Save context to restore later
    ctx.save();
    
    // Set text styles
    ctx.font = '14px Arial';
    ctx.fillStyle = activeColor;
    ctx.textBaseline = 'top';
    
    // Create a clipping region for the cell
    ctx.beginPath();
    ctx.rect(cellX + 1, cellY + 1, cellWidth - 2, cellHeight - 2);
    ctx.clip();
    
    // Clear existing text in the cell (don't erase the borders)
    ctx.clearRect(cellX + 1, cellY + 1, cellWidth - 2, cellHeight - 2);
    
    // Draw the text with padding
    ctx.fillText(text, cellX + 5, cellY + 5, cellWidth - 10);
    
    // Restore context
    ctx.restore();
  };
  
  // Redraw all table cell texts when necessary
  const redrawAllTableTexts = () => {
    tables.forEach(table => {
      table.cells.forEach(cell => {
        drawTableCellText(table.tableId, cell.row, cell.col, cell.text);
      });
    });
  };

  // When component mounts, set up to handle clicks outside the text input
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (showTextInput && textInputRef.current && !textInputRef.current.contains(e.target as Node)) {
        handleTextInputBlur();
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showTextInput]);

  // Update draw function to handle table drawing
  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!canvasRef.current) return;
    
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // For drawing tools
    if (!isDrawing.current) return;
    
    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    hasDrawn.current = true;
    
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.strokeStyle = activeColor;
    ctx.lineWidth = activeBrushSize;
    
    if (activeTool === 'line') {
      if (!initialStrokeState.current) {
        captureInitialState();
        if (!initialStrokeState.current) return;
      }

      // Clear the canvas and redraw from the initial state
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(initialStrokeState.current, 0, 0);
      
      // Set proper drawing settings
      ctx.globalCompositeOperation = 'source-over';
      
      // Draw the new line
      ctx.beginPath();
      ctx.moveTo(startX.current, startY.current);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      hasDrawn.current = true;
    } else if (activeTool === 'table') {
      // Handle table drawing similar to shapes
      if (!initialStrokeState.current) {
        captureInitialState();
        if (!initialStrokeState.current) return;
      }

      // Clear the canvas and redraw from the initial state
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(initialStrokeState.current, 0, 0);
      
      // Set proper drawing settings
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = tableConfig?.borderColor || '#000000';
      ctx.lineWidth = 1;
      
      // Calculate table dimensions
      const width = Math.abs(x - startX.current);
      const height = Math.abs(y - startY.current);
      const startPosX = Math.min(startX.current, x);
      const startPosY = Math.min(startY.current, y);
      
      // Get the number of rows and columns from tableConfig
      const rows = tableConfig?.rows || 3;
      const cols = tableConfig?.cols || 3;
      
      // Calculate cell dimensions
      const cellWidth = width / cols;
      const cellHeight = height / rows;
      
      // Draw the outer border
      ctx.strokeRect(startPosX, startPosY, width, height);
      
      // Draw horizontal lines (rows)
      for (let i = 1; i < rows; i++) {
        ctx.beginPath();
        ctx.moveTo(startPosX, startPosY + i * cellHeight);
        ctx.lineTo(startPosX + width, startPosY + i * cellHeight);
        ctx.stroke();
      }
      
      // Draw vertical lines (columns)
      for (let i = 1; i < cols; i++) {
        ctx.beginPath();
        ctx.moveTo(startPosX + i * cellWidth, startPosY);
        ctx.lineTo(startPosX + i * cellWidth, startPosY + height);
        ctx.stroke();
      }
      
      // Reset stroke style
      ctx.strokeStyle = activeColor;
      
      hasDrawn.current = true;
    } else if (activeTool === 'shape' && activeShape) {
      if (!initialStrokeState.current) {
        captureInitialState();
        if (!initialStrokeState.current) return;
      }

      // Clear the canvas and redraw from the initial state
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(initialStrokeState.current, 0, 0);
      
      // Set proper drawing settings
      ctx.globalCompositeOperation = 'source-over';
      
      // Draw the shape based on activeShape
      const width = Math.abs(x - startX.current);
      const height = Math.abs(y - startY.current);
      const startPosX = Math.min(startX.current, x);
      const startPosY = Math.min(startY.current, y);
      
      ctx.beginPath();
      
      switch (activeShape) {
        case 'rectangle':
          ctx.rect(startPosX, startPosY, width, height);
          break;
          
        case 'circle':
          const radius = Math.sqrt(width * width + height * height) / 2;
          const centerX = (startX.current + x) / 2;
          const centerY = (startY.current + y) / 2;
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          break;
          
        case 'triangle':
          ctx.moveTo(startX.current, startY.current);
          ctx.lineTo(x, y);
          ctx.lineTo(startX.current - (x - startX.current), y);
          ctx.closePath();
          break;
          
        default:
          break;
      }
      
      ctx.stroke();
      
      hasDrawn.current = true;
    } else if (activeTool === 'eraser') {
      // Use destination-out for true erasing (making pixels transparent)
      ctx.globalCompositeOperation = 'destination-out';
      
      // Draw a line between points for continuous erasing
      ctx.beginPath();
      ctx.moveTo(lastX.current, lastY.current);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      // Also use a circle for better coverage
      ctx.beginPath();
      ctx.arc(x, y, activeBrushSize / 2, 0, Math.PI * 2, false);
      ctx.fill();
      
      hasDrawn.current = true;
    } else if (activeTool === 'pen') {
      // Normal drawing
      ctx.globalCompositeOperation = 'source-over';
      ctx.beginPath();
      ctx.moveTo(lastX.current, lastY.current);
      ctx.lineTo(x, y);
      ctx.stroke();
      
      hasDrawn.current = true;
    }

    lastX.current = x;
    lastY.current = y;
  };

  // Update stopDrawing function to handle table creation
  const stopDrawing = () => {
    if (!canvasRef.current) return;
    
    // For drawing tools
    if (isDrawing.current && hasDrawn.current) {
      isDrawing.current = false;
      
      // Handle table creation when releasing mouse
      if (activeTool === 'table') {
        const canvas = canvasRef.current;
        
        // Calculate table dimensions
        const width = Math.abs(lastX.current - startX.current);
        const height = Math.abs(lastY.current - startY.current);
        const x = Math.min(startX.current, lastX.current);
        const y = Math.min(startY.current, lastY.current);
        
        // Get the number of rows and columns from tableConfig
        const rows = tableConfig?.rows || 3;
        const cols = tableConfig?.cols || 3;
        
        // Calculate cell dimensions
        const cellWidth = width / cols;
        const cellHeight = height / rows;
        
        // Add this table to our tables state
        const tableId = `table-${Date.now()}`;
        setTables(prevTables => [
          ...prevTables,
          {
            tableId,
            config: {
              rows,
              cols,
              cellWidth,
              cellHeight,
              borderColor: tableConfig?.borderColor || '#000000',
              x,
              y
            },
            cells: []
          }
        ]);
      }
      
      // This ensures the last "move" of the stroke is captured
      const canvas = canvasRef.current;
      
      // Save the current completed stroke to history
      saveToHistory(canvas);
    }
    
    isDrawing.current = false;
  };

  // Update cursor effect for different tools
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Set cursor based on active tool
    if (activeTool === 'line' || activeTool === 'shape' || activeTool === 'table') {
      canvas.style.cursor = 'crosshair';
    } else if (activeTool === 'eraser') {
      // Create a custom eraser cursor size based on the brush size
      const size = Math.min(Math.max(activeBrushSize, 10), 40);
      canvas.style.cursor = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'><circle cx='${size/2}' cy='${size/2}' r='${size/2 - 1}' stroke='%23cccccc' stroke-width='1.5' fill='white' fill-opacity='0.5'/></svg>") ${size/2} ${size/2}, auto`;
    } else if (activeTool === 'pen') {
      const size = Math.min(Math.max(activeBrushSize, 6), 20);
      canvas.style.cursor = `url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='${size}' height='${size}' viewBox='0 0 ${size} ${size}'><circle cx='${size/2}' cy='${size/2}' r='${size/4}' fill='%23666666'/></svg>") ${size/2} ${size/2}, auto`;
    } else {
      canvas.style.cursor = 'default';
    }
  }, [activeTool, activeBrushSize]);

  const captureInitialState = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    try {
      initialStrokeState.current = ctx.getImageData(0, 0, canvas.width, canvas.height);
      console.log('[CANVAS] Captured initial state before stroke');
    } catch (e) {
      console.error('[CANVAS] Error saving initial state:', e);
      initialStrokeState.current = null;
    }
  };

  return (
    <>
      <canvas
        ref={canvasRef}
        className="w-full h-full cursor-crosshair"
        onMouseDown={startDrawing}
        onMouseMove={draw}
        onMouseUp={stopDrawing}
        onMouseOut={stopDrawing}
      />
      {showTextInput && (
        <div
          style={{
            position: 'absolute',
            left: textInputPosition.x + 'px',
            top: textInputPosition.y + 'px',
            zIndex: 1000
          }}
        >
          <input
            ref={textInputRef}
            type="text"
            value={textInputValue}
            onChange={handleTextInputChange}
            onBlur={handleTextInputBlur}
            onKeyPress={handleTextInputKeyPress}
            className="border border-blue-500 p-1 outline-none"
            style={{
              width: activeTableCell ? 
                (tables.find(t => t.tableId === activeTableCell.tableId)?.config.cellWidth || 100) - 12 + 'px' : 
                '100px'
            }}
          />
        </div>
      )}
    </>
  );
});

Canvas.displayName = 'Canvas';

export default Canvas;
