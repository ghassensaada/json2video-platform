import React from 'react';

const TextResizeHandles = ({ 
  element, 
  onResize, 
  onResizeStart, 
  onResizeEnd, 
  gridSize,
  updateElement 
}) => {
  const handleMouseDown = (e, handle) => {
    e.stopPropagation();
    
    if (onResizeStart) onResizeStart();
    
    const startX = e.clientX;
    const startY = e.clientY;
    const startFontSize = element.font_size || 24;
    
    const handleMouseMove = (e) => {
      const deltaX = e.clientX - startX;
      const deltaY = e.clientY - startY;
      
      // Calculate font size change based on diagonal movement
      const delta = Math.max(Math.abs(deltaX), Math.abs(deltaY));
      const scaleFactor = 0.5; // Adjust sensitivity
      
      let newFontSize = startFontSize + (delta * scaleFactor);
      
      // Apply grid snapping to font size
      const gridSnap = Math.round(newFontSize / 2) * 2;
      newFontSize = Math.max(8, Math.min(200, gridSnap)); // Min 8px, Max 200px
      
      // Update font size directly
      updateElement(element.id, { font_size: newFontSize });
    };
    
    const handleMouseUp = () => {
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
      
      if (onResizeEnd) onResizeEnd();
    };
    
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleStyle = {
    position: 'absolute',
    width: '12px',
    height: '12px',
    backgroundColor: '#10b981',
    border: '2px solid white',
    borderRadius: '50%',
    cursor: 'pointer',
    zIndex: 1000,
    boxShadow: '0 2px 4px rgba(0,0,0,0.3)',
    transition: 'all 0.2s ease',
    transform: 'translate(-50%, -50%)'
  };

  return (
    <>
      {/* Corner handles for text resizing */}
      <div
        style={{
          ...handleStyle,
          top: '0%',
          left: '0%',
          cursor: 'nw-resize'
        }}
        onMouseDown={(e) => handleMouseDown(e, 'nw')}
        onMouseEnter={(e) => {
          e.target.style.transform = 'translate(-50%, -50%) scale(1.2)';
          e.target.style.backgroundColor = '#059669';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translate(-50%, -50%) scale(1)';
          e.target.style.backgroundColor = '#10b981';
        }}
        title="Resize text (drag to change font size)"
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
          e.target.style.transform = 'translate(50%, -50%) scale(1.2)';
          e.target.style.backgroundColor = '#059669';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translate(50%, -50%) scale(1)';
          e.target.style.backgroundColor = '#10b981';
        }}
        title="Resize text (drag to change font size)"
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
          e.target.style.transform = 'translate(-50%, 50%) scale(1.2)';
          e.target.style.backgroundColor = '#059669';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translate(-50%, 50%) scale(1)';
          e.target.style.backgroundColor = '#10b981';
        }}
        title="Resize text (drag to change font size)"
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
          e.target.style.transform = 'translate(50%, 50%) scale(1.2)';
          e.target.style.backgroundColor = '#059669';
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = 'translate(50%, 50%) scale(1)';
          e.target.style.backgroundColor = '#10b981';
        }}
        title="Resize text (drag to change font size)"
      />
    </>
  );
};

export default TextResizeHandles; 