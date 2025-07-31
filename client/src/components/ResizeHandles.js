import React from 'react';

const ResizeHandles = ({ element, onResize, onResizeStart, onResizeEnd, gridSize }) => {
  const handleMouseDown = (e, handle) => {
    e.stopPropagation();
    
    if (onResizeStart) onResizeStart();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startWidth = element.width;
    const startHeight = element.height;
    const startLeft = element.x;
    const startTop = element.y;
    
    // Find the element's DOM node for direct manipulation
    const elementNode = e.target.closest('[data-element-id]') || 
                       document.querySelector(`[data-element-id="${element.id}"]`);
    
    // Store original styles for restoration
    const originalTransform = elementNode?.style.transform || '';
    const originalTransition = elementNode?.style.transition || '';
    
    // Disable transitions during resize for smooth performance
    if (elementNode) {
      elementNode.style.transition = 'none';
    }
    
    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      let newWidth = startWidth;
      let newHeight = startHeight;
      let newX = startLeft;
      let newY = startTop;
      
      // Use a larger grid size for easier scaling (5x larger than normal grid)
      const scaleGridSize = Math.max(gridSize * 5, 20);
      
      // Snap to grid function with larger increments for easier scaling
      const snapToGrid = (value) => Math.round(value / scaleGridSize) * scaleGridSize;
      
      // Minimum size for easier handling
      const minSize = Math.max(gridSize * 2, 40);
      
      switch (handle) {
        case 'nw': // Top-left
          newWidth = Math.max(minSize, snapToGrid(startWidth - deltaX));
          newHeight = Math.max(minSize, snapToGrid(startHeight - deltaY));
          newX = snapToGrid(startLeft + startWidth - newWidth);
          newY = snapToGrid(startTop + startHeight - newHeight);
          break;
        case 'ne': // Top-right
          newWidth = Math.max(minSize, snapToGrid(startWidth + deltaX));
          newHeight = Math.max(minSize, snapToGrid(startHeight - deltaY));
          newY = snapToGrid(startTop + startHeight - newHeight);
          break;
        case 'sw': // Bottom-left
          newWidth = Math.max(minSize, snapToGrid(startWidth - deltaX));
          newHeight = Math.max(minSize, snapToGrid(startHeight + deltaY));
          newX = snapToGrid(startLeft + startWidth - newWidth);
          break;
        case 'se': // Bottom-right
          newWidth = Math.max(minSize, snapToGrid(startWidth + deltaX));
          newHeight = Math.max(minSize, snapToGrid(startHeight + deltaY));
          break;
        case 'n': // Top
          newHeight = Math.max(minSize, snapToGrid(startHeight - deltaY));
          newY = snapToGrid(startTop + startHeight - newHeight);
          break;
        case 's': // Bottom
          newHeight = Math.max(minSize, snapToGrid(startHeight + deltaY));
          break;
        case 'w': // Left
          newWidth = Math.max(minSize, snapToGrid(startWidth - deltaX));
          newX = snapToGrid(startLeft + startWidth - newWidth);
          break;
        case 'e': // Right
          newWidth = Math.max(minSize, snapToGrid(startWidth + deltaX));
          break;
      }
      
      // Apply changes directly to DOM IMMEDIATELY for real-time feedback
      if (elementNode) {
        elementNode.style.left = `${newX}px`;
        elementNode.style.top = `${newY}px`;
        elementNode.style.width = `${newWidth}px`;
        elementNode.style.height = `${newHeight}px`;
      }
      
      // Throttle ONLY the React state updates (not DOM updates)
      if (!handleMouseMove.lastUpdate || Date.now() - handleMouseMove.lastUpdate > 100) {
        onResize({
          x: newX,
          y: newY,
          width: newWidth,
          height: newHeight
        });
        handleMouseMove.lastUpdate = Date.now();
      }
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      // Restore transitions
      if (elementNode) {
        elementNode.style.transition = originalTransition;
      }
      
      // Get final position from DOM and update state
      let finalX = startLeft;
      let finalY = startTop;
      let finalWidth = startWidth;
      let finalHeight = startHeight;
      
      if (elementNode) {
        const computedStyle = window.getComputedStyle(elementNode);
        finalX = parseInt(computedStyle.left) || startLeft;
        finalY = parseInt(computedStyle.top) || startTop;
        finalWidth = parseInt(computedStyle.width) || startWidth;
        finalHeight = parseInt(computedStyle.height) || startHeight;
      }
      
      // Final update to state
      onResize({
        x: finalX,
        y: finalY,
        width: finalWidth,
        height: finalHeight
      });
      
      if (onResizeEnd) onResizeEnd();
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleStyle = {
    position: 'absolute',
    width: '16px',
    height: '16px',
    backgroundColor: '#3b82f6',
    border: '2px solid white',
    borderRadius: '50%',
    cursor: 'pointer',
    zIndex: 1000,
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
    transition: 'all 0.2s ease',
    transform: 'translate(-50%, -50%)'
  };

  const edgeHandleStyle = {
    position: 'absolute',
    backgroundColor: '#3b82f6',
    border: '3px solid white',
    zIndex: 1001,
    boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
    transition: 'all 0.2s ease',
    borderRadius: '6px'
  };

  return (
    <>
      {/* Corner handles - much larger and easier to grab */}
      <div
        style={{
          ...handleStyle,
          top: '0%',
          left: '0%',
          cursor: 'nw-resize'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'nw')}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translate(-50%, -50%) scale(1.3)';
          e.target.style.backgroundColor = '#2563eb';
          e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translate(-50%, -50%) scale(1)';
          e.target.style.backgroundColor = '#3b82f6';
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        }}
        title="Resize from top-left"
      />
      <div
        style={{
          ...handleStyle,
          top: '0%',
          right: '0%',
          left: 'auto',
          cursor: 'ne-resize'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'ne')}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translate(50%, -50%) scale(1.3)';
          e.target.style.backgroundColor = '#2563eb';
          e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translate(50%, -50%) scale(1)';
          e.target.style.backgroundColor = '#3b82f6';
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        }}
        title="Resize from top-right"
      />
      <div
        style={{
          ...handleStyle,
          bottom: '0%',
          left: '0%',
          top: 'auto',
          cursor: 'sw-resize'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'sw')}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translate(-50%, 50%) scale(1.3)';
          e.target.style.backgroundColor = '#2563eb';
          e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translate(-50%, 50%) scale(1)';
          e.target.style.backgroundColor = '#3b82f6';
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        }}
        title="Resize from bottom-left"
      />
      <div
        style={{
          ...handleStyle,
          bottom: '0%',
          right: '0%',
          top: 'auto',
          left: 'auto',
          cursor: 'se-resize'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'se')}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translate(50%, 50%) scale(1.3)';
          e.target.style.backgroundColor = '#2563eb';
          e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translate(50%, 50%) scale(1)';
          e.target.style.backgroundColor = '#3b82f6';
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        }}
        title="Resize from bottom-right"
      />
      
      {/* Edge handles - much larger and more visible */}
      <div
        style={{
          ...edgeHandleStyle,
          top: '-15px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60px',
          height: '16px',
          cursor: 'n-resize'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'n')}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateX(-50%) scaleY(1.3)';
          e.target.style.backgroundColor = '#2563eb';
          e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateX(-50%) scaleY(1)';
          e.target.style.backgroundColor = '#3b82f6';
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        }}
        title="Resize from top"
      />
      <div
        style={{
          ...edgeHandleStyle,
          bottom: '-15px',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '60px',
          height: '16px',
          cursor: 's-resize'
        }}
        onMouseDown={(e) => handleMouseDown(e, 's')}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateX(-50%) scaleY(1.3)';
          e.target.style.backgroundColor = '#2563eb';
          e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateX(-50%) scaleY(1)';
          e.target.style.backgroundColor = '#3b82f6';
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        }}
        title="Resize from bottom"
      />
      <div
        style={{
          ...edgeHandleStyle,
          left: '-15px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '16px',
          height: '60px',
          cursor: 'w-resize'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'w')}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-50%) scaleX(1.3)';
          e.target.style.backgroundColor = '#2563eb';
          e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(-50%) scaleX(1)';
          e.target.style.backgroundColor = '#3b82f6';
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        }}
        title="Resize from left"
      />
      <div
        style={{
          ...edgeHandleStyle,
          right: '-15px',
          top: '50%',
          transform: 'translateY(-50%)',
          width: '16px',
          height: '60px',
          cursor: 'e-resize'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'e')}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translateY(-50%) scaleX(1.3)';
          e.target.style.backgroundColor = '#2563eb';
          e.target.style.boxShadow = '0 6px 12px rgba(0,0,0,0.4)';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translateY(-50%) scaleX(1)';
          e.target.style.backgroundColor = '#3b82f6';
          e.target.style.boxShadow = '0 4px 8px rgba(0,0,0,0.3)';
        }}
        title="Resize from right"
      />
    </>
  );
};

export default ResizeHandles; 