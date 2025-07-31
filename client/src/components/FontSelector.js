import React, { useState } from 'react';
import { ChevronDown, Check } from 'lucide-react';

const FontSelector = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);

  // Google Fonts list with categories
  const googleFonts = {
    'Sans Serif': [
      { name: 'Inter', value: 'Inter' },
      { name: 'Roboto', value: 'Roboto' },
      { name: 'Open Sans', value: 'Open Sans' },
      { name: 'Lato', value: 'Lato' },
      { name: 'Poppins', value: 'Poppins' },
      { name: 'Montserrat', value: 'Montserrat' },
      { name: 'Source Sans Pro', value: 'Source Sans Pro' },
      { name: 'Ubuntu', value: 'Ubuntu' },
      { name: 'Arial', value: 'Arial' },
      { name: 'Helvetica', value: 'Helvetica' },
      { name: 'Verdana', value: 'Verdana' }
    ],
    'Serif': [
      { name: 'Playfair Display', value: 'Playfair Display' },
      { name: 'Merriweather', value: 'Merriweather' },
      { name: 'Times New Roman', value: 'Times New Roman' },
      { name: 'Georgia', value: 'Georgia' }
    ],
    'Monospace': [
      { name: 'Courier New', value: 'Courier New' },
      { name: 'Monaco', value: 'Monaco' },
      { name: 'Consolas', value: 'Consolas' }
    ]
  };

  const currentFont = Object.values(googleFonts)
    .flat()
    .find(font => font.value === value) || { name: 'Inter', value: 'Inter' };

  const handleFontSelect = (fontValue) => {
    onChange(fontValue);
    setIsOpen(false);
  };

  return (
    <div className={`relative ${className}`}>
      {/* Selected Font Display */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-2 border border-gray-300 rounded-md bg-white text-sm hover:border-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
        style={{ fontFamily: currentFont.value }}
      >
        <span>{currentFont.name}</span>
        <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          {Object.entries(googleFonts).map(([category, fonts]) => (
            <div key={category}>
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50 border-b border-gray-200">
                {category}
              </div>
              {fonts.map(font => (
                <button
                  key={font.value}
                  type="button"
                  onClick={() => handleFontSelect(font.value)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                    value === font.value ? 'bg-indigo-50 text-indigo-700' : ''
                  }`}
                  style={{ fontFamily: font.value }}
                >
                  <span>{font.name}</span>
                  {value === font.value && <Check className="w-4 h-4" />}
                </button>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Backdrop to close dropdown */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  );
};

export default FontSelector; 