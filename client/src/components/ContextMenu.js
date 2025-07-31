import React from 'react';

const ContextMenu = ({ 
  isVisible, 
  position, 
  onClose, 
  onCopy, 
  onPaste, 
  onDuplicate, 
  onDelete, 
  onBringToFront, 
  onSendToBack,
  canPaste,
  elementType,
  locked = false
}) => {
  if (!isVisible) return null;

  const menuStyle = {
    position: 'fixed',
    left: position.x,
    top: position.y,
    backgroundColor: 'white',
    border: '1px solid #d1d5db',
    borderRadius: '6px',
    boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
    zIndex: 10000,
    minWidth: '160px',
    padding: '4px 0'
  };

  const menuItemStyle = {
    padding: '8px 16px',
    fontSize: '14px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s'
  };

  const handleItemClick = (action) => {
    action();
    onClose();
  };

  const handleBackgroundClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <>
      {/* Backdrop */}
      <div
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 9999
        }}
        onClick={handleBackgroundClick}
      />
      
      {/* Menu */}
      <div style={menuStyle}>
        <div
          style={{
            ...menuItemStyle,
            color: (canPaste && !locked) ? '#374151' : '#9ca3af',
            cursor: (canPaste && !locked) ? 'pointer' : 'not-allowed'
          }}
          onClick={() => canPaste && !locked && handleItemClick(onCopy)}
          className={(canPaste && !locked) ? 'hover:bg-gray-100' : ''}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Copy
        </div>
        
        <div
          style={{
            ...menuItemStyle,
            color: canPaste ? '#374151' : '#9ca3af',
            cursor: canPaste ? 'pointer' : 'not-allowed'
          }}
          onClick={() => canPaste && handleItemClick(onPaste)}
          className={canPaste ? 'hover:bg-gray-100' : ''}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Paste
        </div>
        
        <div
          style={{
            ...menuItemStyle,
            color: !locked ? '#374151' : '#9ca3af',
            cursor: !locked ? 'pointer' : 'not-allowed'
          }}
          onClick={() => !locked && handleItemClick(onDuplicate)}
          className={!locked ? 'hover:bg-gray-100' : ''}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
          </svg>
          Duplicate
        </div>
        
        <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '4px 0' }} />
        
        <div
          style={menuItemStyle}
          onClick={() => handleItemClick(onBringToFront)}
          className="hover:bg-gray-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
          </svg>
          Bring to Front
        </div>
        
        <div
          style={menuItemStyle}
          onClick={() => handleItemClick(onSendToBack)}
          className="hover:bg-gray-100"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
          Send to Back
        </div>
        
        <div style={{ height: '1px', backgroundColor: '#e5e7eb', margin: '4px 0' }} />
        
        <div
          style={{
            ...menuItemStyle,
            color: !locked ? '#dc2626' : '#9ca3af',
            cursor: !locked ? 'pointer' : 'not-allowed'
          }}
          onClick={() => !locked && handleItemClick(onDelete)}
          className={!locked ? 'hover:bg-red-50' : ''}
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
          </svg>
          Delete
        </div>
      </div>
    </>
  );
};

export default ContextMenu; 