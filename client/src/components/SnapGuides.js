import React from 'react';

const SnapGuides = ({ 
  isVisible, 
  snapType, 
  position, 
  canvasDimensions, 
  scale = 1 
}) => {
  if (!isVisible) return null;

  const guideStyle = {
    position: 'absolute',
    backgroundColor: '#3b82f6',
    zIndex: 1000,
    pointerEvents: 'none',
    boxShadow: '0 0 4px rgba(59, 130, 246, 0.5)',
    animation: 'snapGuidePulse 0.3s ease-out'
  };

  const getGuideStyles = () => {
    const scaledPosition = {
      x: position.x * scale,
      y: position.y * scale
    };

    switch (snapType) {
      case 'center-vertical':
        return {
          ...guideStyle,
          left: `${scaledPosition.x}px`,
          top: 0,
          width: '2px',
          height: `${canvasDimensions.height * scale}px`
        };
      
      case 'center-horizontal':
        return {
          ...guideStyle,
          top: `${scaledPosition.y}px`,
          left: 0,
          height: '2px',
          width: `${canvasDimensions.width * scale}px`
        };
      
      case 'element-vertical':
        return {
          ...guideStyle,
          left: `${scaledPosition.x}px`,
          top: 0,
          width: '2px',
          height: `${canvasDimensions.height * scale}px`,
          backgroundColor: '#10b981'
        };
      
      case 'element-horizontal':
        return {
          ...guideStyle,
          top: `${scaledPosition.y}px`,
          left: 0,
          height: '2px',
          width: `${canvasDimensions.width * scale}px`,
          backgroundColor: '#10b981'
        };
      
      default:
        return {};
    }
  };

  return (
    <>
      <style>
        {`
          @keyframes snapGuidePulse {
            0% { opacity: 0; transform: scale(0.8); }
            50% { opacity: 1; transform: scale(1.1); }
            100% { opacity: 0.8; transform: scale(1); }
          }
        `}
      </style>
      <div style={getGuideStyles()} />
    </>
  );
};

export default SnapGuides; 