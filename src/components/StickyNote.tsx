import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';

interface StickyNoteProps {
  color: string;
  initialX: number;
  initialY: number;
  id?: number;
  onDelete?: (id: number) => void;
}

const StickyNote: React.FC<StickyNoteProps> = ({ color, initialX, initialY, id, onDelete }) => {
  const [position, setPosition] = useState({ x: initialX, y: initialY });
  const [isDragging, setIsDragging] = useState(false);
  const [text, setText] = useState('');
  const [showCloseButton, setShowCloseButton] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Add a slight rotation for a more natural look
  const rotation = useRef(Math.random() * 6 - 3);

  const handleDelete = () => {
    if (id !== undefined && onDelete) {
      onDelete(id);
    }
  };

  return (
    <motion.div
      drag
      dragMomentum={false}
      onDragStart={() => setIsDragging(true)}
      onDragEnd={() => setIsDragging(false)}
      initial={{ scale: 0.8, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      onClick={() => textareaRef.current?.focus()}
      onMouseEnter={() => setShowCloseButton(true)}
      onMouseLeave={() => setShowCloseButton(false)}
      style={{
        position: 'absolute',
        left: position.x,
        top: position.y,
        width: '180px',
        height: '180px',
        backgroundColor: color,
        borderRadius: '12px',
        boxShadow: isDragging 
          ? '0 12px 24px rgba(0,0,0,0.15)' 
          : '0 4px 12px rgba(0,0,0,0.08)',
        cursor: 'move',
        padding: '16px 14px',
        rotate: `${rotation.current}deg`,
        zIndex: isDragging ? 1000 : 10,
        transition: 'box-shadow 0.2s ease, transform 0.2s ease',
      }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <div className="absolute top-2 right-2 flex space-x-1">
        {showCloseButton && (
          <button 
            onClick={(e) => {
              e.stopPropagation();
              handleDelete();
            }}
            className="w-5 h-5 flex items-center justify-center rounded-full bg-white/40 hover:bg-white/60 transition-colors"
            title="Close note"
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="none" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
        <div className="w-2 h-2 rounded-full bg-white opacity-60" />
        <div className="w-2 h-2 rounded-full bg-white opacity-60" />
        <div className="w-2 h-2 rounded-full bg-white opacity-60" />
      </div>
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="Type note here..."
        className="w-full h-full bg-transparent border-none focus:outline-none resize-none"
        style={{ 
          fontSize: '14px', 
          lineHeight: '1.4', 
          color: 'rgba(0,0,0,0.7)',
          fontFamily: 'system-ui, sans-serif',
          caretColor: 'rgba(0,0,0,0.5)'
        }}
      />
    </motion.div>
  );
};

export default StickyNote; 