'use client';

import React from 'react';
import { motion } from 'framer-motion';

const Navbar = () => {
  return (
    <nav className="bg-white shadow-md py-4 sticky top-0 z-10">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <motion.div 
          className="flex items-center space-x-2"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3 }}
        >
          <svg 
            className="w-8 h-8 text-primary-600" 
            fill="currentColor" 
            viewBox="0 0 24 24"
          >
            <path d="M17.5,12A1.5,1.5 0 0,1 16,10.5A1.5,1.5 0 0,1 17.5,9A1.5,1.5 0 0,1 19,10.5A1.5,1.5 0 0,1 17.5,12M14.5,8A1.5,1.5 0 0,1 13,6.5A1.5,1.5 0 0,1 14.5,5A1.5,1.5 0 0,1 16,6.5A1.5,1.5 0 0,1 14.5,8M9.5,8A1.5,1.5 0 0,1 8,6.5A1.5,1.5 0 0,1 9.5,5A1.5,1.5 0 0,1 11,6.5A1.5,1.5 0 0,1 9.5,8M5.5,12A1.5,1.5 0 0,1 4,10.5A1.5,1.5 0 0,1 5.5,9A1.5,1.5 0 0,1 7,10.5A1.5,1.5 0 0,1 5.5,12M12,3A9,9 0 0,0 3,12A9,9 0 0,0 12,21A9,9 0 0,0 21,12A9,9 0 0,0 12,3Z" />
          </svg>
          <span className="text-xl font-bold text-gray-800">PixelCraft</span>
        </motion.div>
        
        <motion.div 
          className="hidden md:flex space-x-6"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: 0.1 }}
        >
          <a href="#canvas-section" className="text-gray-700 hover:text-primary-600 transition-colors">Canvas</a>
          <a href="#gallery" className="text-gray-700 hover:text-primary-600 transition-colors">Gallery</a>
          <a href="#tutorials" className="text-gray-700 hover:text-primary-600 transition-colors">Tutorials</a>
          <a href="#about" className="text-gray-700 hover:text-primary-600 transition-colors">About</a>
        </motion.div>
        
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.3, delay: 0.2 }}
        >
          <a 
            href="#canvas-section" 
            className="bg-primary-600 text-white px-4 py-2 rounded hover:bg-primary-700 transition-colors"
          >
            Start Drawing
          </a>
        </motion.div>
      </div>
    </nav>
  );
};

export default Navbar; 