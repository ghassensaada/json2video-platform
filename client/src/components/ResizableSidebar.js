import React, { useState, useRef, useEffect } from 'react';

const ResizableSidebar = ({ 
  children, 
  side = 'left', 
  minWidth = 200, 
  maxWidth = 600, 
  defaultWidth = 320,
  onResize,
  className = ''
}) => {
  const [width, setWidth] = useState(defaultWidth);
  const [isResizing, setIsResizing] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const sidebarRef = useRef(null);
  const resizeRef = useRef(null);
  const lastUpdateTime = useRef(0);

  useEffect(() => {
    const handleMouseMove = (e) => {
      if (!isResizing) return;

      // Throttle updates for better performance
      const now = Date.now();
      const throttleDelay = 16; // ~60fps
      if (now - lastUpdateTime.current < throttleDelay) {
        return;
      }
      lastUpdateTime.current = now;

      const containerRect = sidebarRef.current?.parentElement?.getBoundingClientRect();
      if (!containerRect) return;

      let newWidth;
      if (side === 'left') {
        newWidth = e.clientX - containerRect.left;
      } else {
        newWidth = containerRect.right - e.clientX;
      }

      // Ensure we don't go below minimum or above maximum
      newWidth = Math.max(minWidth, Math.min(maxWidth, newWidth));
      
      // Additional constraint: ensure total sidebar width doesn't exceed viewport
      const viewportWidth = window.innerWidth;
      const otherSidebarWidth = side === 'left' ? 
        (document.querySelector('[data-side="right"]')?.offsetWidth || 350) :
        (document.querySelector('[data-side="left"]')?.offsetWidth || 300);
      const maxTotalWidth = viewportWidth * 0.75; // Leave 25% for canvas
      
      if (newWidth + otherSidebarWidth > maxTotalWidth) {
        newWidth = maxTotalWidth - otherSidebarWidth;
      }
      
      // Ensure minimum canvas width
      const minCanvasWidth = viewportWidth * 0.25; // At least 25% for canvas
      if (newWidth > viewportWidth - minCanvasWidth - otherSidebarWidth) {
        newWidth = viewportWidth - minCanvasWidth - otherSidebarWidth;
      }
      
      // Use direct DOM manipulation for smooth visual updates
      if (sidebarRef.current) {
        sidebarRef.current.style.width = `${newWidth}px`;
      }
      
      // Update local state for width indicator
      setWidth(newWidth);
    };

    const handleMouseUp = () => {
      setIsResizing(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      
      // Only call onResize once when resize is complete
      if (onResize) {
        onResize(width);
      }
    };

    if (isResizing) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = 'col-resize';
      document.body.style.userSelect = 'none';
    }

    return () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
    };
  }, [isResizing, side, minWidth, maxWidth, onResize, width]);

  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const resizeHandleStyle = {
    position: 'absolute',
    top: 0,
    bottom: 0,
    width: '6px',
    cursor: 'col-resize',
    backgroundColor: isHovering || isResizing ? '#3b82f6' : 'transparent',
    transition: 'all 0.2s ease',
    zIndex: 10,
    ...(side === 'left' ? { right: '-3px' } : { left: '-3px' })
  };

  const sidebarStyle = {
    width: `${width}px`,
    minWidth: `${minWidth}px`,
    maxWidth: `${maxWidth}px`,
    flexShrink: 0,
    flexGrow: 0,
    flexBasis: `${width}px`
  };

  return (
    <div 
      ref={sidebarRef}
      style={sidebarStyle}
      className={`relative ${className}`}
    >
      {children}
      
      {/* Resize Handle */}
      <div
        ref={resizeRef}
        style={resizeHandleStyle}
        onMouseDown={handleMouseDown}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
        className="hover:bg-blue-500 hover:shadow-lg"
        title={`Drag to resize ${side} panel`}
      >
        {/* Visual indicator dots */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col space-y-1">
          <div className={`w-1 h-1 rounded-full transition-colors duration-200 ${
            isHovering || isResizing ? 'bg-white' : 'bg-gray-400'
          }`}></div>
          <div className={`w-1 h-1 rounded-full transition-colors duration-200 ${
            isHovering || isResizing ? 'bg-white' : 'bg-gray-400'
          }`}></div>
          <div className={`w-1 h-1 rounded-full transition-colors duration-200 ${
            isHovering || isResizing ? 'bg-white' : 'bg-gray-400'
          }`}></div>
        </div>
      </div>

      {/* Width indicator during resize */}
      {isResizing && (
        <div 
          ref={(el) => {
            if (el) {
              el.style.left = side === 'left' ? `${width + 10}px` : 'auto';
              el.style.right = side === 'right' ? `${width + 10}px` : 'auto';
            }
          }}
          className="fixed bg-gray-900 text-white px-2 py-1 rounded text-xs font-mono z-50 pointer-events-none"
          style={{
            top: '10px'
          }}
        >
          {width}px
        </div>
      )}
    </div>
  );
};

export default ResizableSidebar; 