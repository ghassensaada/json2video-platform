import React, { useState, useEffect, useRef } from 'react';

const InlineTextEditor = ({ 
  element, 
  onSave, 
  onCancel, 
  isVisible 
}) => {
  const [text, setText] = useState(element.text || 'Sample Text');
  const textareaRef = useRef(null);
  const [warning, setWarning] = useState('');

  useEffect(() => {
    if (isVisible && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.select();
    }
  }, [isVisible]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (text.length > 500) {
        setWarning('Text is too long (max 500 characters).');
        return;
      }
      onSave(text);
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  const handleBlur = () => {
    // Only save if text is not empty, otherwise cancel
    if (text.trim() === '') {
      onCancel();
    } else if (text.length > 500) {
      setWarning('Text is too long (max 500 characters).');
      return;
    } else {
      onSave(text);
    }
  };

  if (!isVisible) return null;

  return (
    <div
      style={{
        position: 'absolute',
        left: element.x,
        top: element.y,
        width: element.width,
        height: element.height,
        zIndex: 10000,
        backgroundColor: 'transparent',
        border: '2px solid #3b82f6',
        borderRadius: '4px',
        padding: '4px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
      }}
    >
      <textarea
        ref={textareaRef}
        value={text}
        onChange={(e) => {
          setText(e.target.value);
          if (e.target.value.length > 500) {
            setWarning('Text is too long (max 500 characters).');
          } else {
            setWarning('');
          }
        }}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        style={{
          width: '100%',
          height: '100%',
          border: 'none',
          outline: 'none',
          resize: 'none',
          fontSize: element.font_size || 24,
          fontFamily: element.font_family || 'Inter',
          color: element.color || '#000000',
          backgroundColor: element.background_color || 'transparent',
          fontWeight: element.bold ? 'bold' : 'normal',
          fontStyle: element.italic ? 'italic' : 'normal',
          textDecoration: element.underline ? 'underline' : 'none',
          textAlign: element.alignment || 'center',
          lineHeight: '1.2',
          padding: '0',
          margin: '0'
        }}
        placeholder=""
      />
      {warning && (
        <div
          style={{
            position: 'absolute',
            bottom: '-40px',
            left: '50%',
            transform: 'translateX(-50%)',
            fontSize: '12px',
            color: '#b91c1c',
            backgroundColor: '#fff0f0',
            padding: '2px 8px',
            borderRadius: '3px',
            border: '1px solid #fca5a5',
            zIndex: 10001
          }}
        >
          {warning}
        </div>
      )}
      <div
        style={{
          position: 'absolute',
          bottom: '-20px',
          left: '50%',
          transform: 'translateX(-50%)',
          fontSize: '10px',
          color: '#6b7280',
          backgroundColor: 'white',
          padding: '2px 6px',
          borderRadius: '3px',
          border: '1px solid #d1d5db'
        }}
      >
        Press Enter to save, Esc to cancel
      </div>
    </div>
  );
};

export default InlineTextEditor; 