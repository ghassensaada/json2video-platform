import React, { useState, useEffect, useRef } from 'react';
import { ChevronDown, Check, Search, Globe, Link, AlertCircle } from 'lucide-react';

const FontInput = ({ value, onChange, className = '' }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [googleFonts, setGoogleFonts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loadedFonts, setLoadedFonts] = useState(new Set());
  const [showUrlInput, setShowUrlInput] = useState(false);
  const [urlInput, setUrlInput] = useState('');
  const [urlError, setUrlError] = useState('');
  const [urlLoading, setUrlLoading] = useState(false);
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Popular fonts including Arabic fonts
  const popularFonts = {
    'Sans Serif': [
      { name: 'Inter', value: 'Inter', category: 'sans-serif' },
      { name: 'Roboto', value: 'Roboto', category: 'sans-serif' },
      { name: 'Open Sans', value: 'Open Sans', category: 'sans-serif' },
      { name: 'Lato', value: 'Lato', category: 'sans-serif' },
      { name: 'Poppins', value: 'Poppins', category: 'sans-serif' },
      { name: 'Montserrat', value: 'Montserrat', category: 'sans-serif' },
      { name: 'Source Sans Pro', value: 'Source Sans Pro', category: 'sans-serif' },
      { name: 'Ubuntu', value: 'Ubuntu', category: 'sans-serif' },
      { name: 'Nunito', value: 'Nunito', category: 'sans-serif' },
      { name: 'Work Sans', value: 'Work Sans', category: 'sans-serif' },
      { name: 'Arial', value: 'Arial', category: 'sans-serif' },
      { name: 'Helvetica', value: 'Helvetica', category: 'sans-serif' },
      { name: 'Verdana', value: 'Verdana', category: 'sans-serif' }
    ],
    'Serif': [
      { name: 'Playfair Display', value: 'Playfair Display', category: 'serif' },
      { name: 'Merriweather', value: 'Merriweather', category: 'serif' },
      { name: 'Lora', value: 'Lora', category: 'serif' },
      { name: 'Source Serif Pro', value: 'Source Serif Pro', category: 'serif' },
      { name: 'Libre Baskerville', value: 'Libre Baskerville', category: 'serif' },
      { name: 'Crimson Text', value: 'Crimson Text', category: 'serif' },
      { name: 'Times New Roman', value: 'Times New Roman', category: 'serif' },
      { name: 'Georgia', value: 'Georgia', category: 'serif' }
    ],
    'Display': [
      { name: 'Oswald', value: 'Oswald', category: 'display' },
      { name: 'Bebas Neue', value: 'Bebas Neue', category: 'display' },
      { name: 'Anton', value: 'Anton', category: 'display' },
      { name: 'Righteous', value: 'Righteous', category: 'display' },
      { name: 'Bangers', value: 'Bangers', category: 'display' },
      { name: 'Fredoka One', value: 'Fredoka One', category: 'display' }
    ],
    'Arabic': [
      { name: 'Noto Sans Arabic', value: 'Noto Sans Arabic', category: 'sans-serif', arabic: true },
      { name: 'Noto Serif Arabic', value: 'Noto Serif Arabic', category: 'serif', arabic: true },
      { name: 'Amiri', value: 'Amiri', category: 'serif', arabic: true },
      { name: 'Scheherazade New', value: 'Scheherazade New', category: 'serif', arabic: true },
      { name: 'Readex Pro', value: 'Readex Pro', category: 'sans-serif', arabic: true },
      { name: 'IBM Plex Sans Arabic', value: 'IBM Plex Sans Arabic', category: 'sans-serif', arabic: true },
      { name: 'Cairo', value: 'Cairo', category: 'sans-serif', arabic: true },
      { name: 'Tajawal', value: 'Tajawal', category: 'sans-serif', arabic: true },
      { name: 'Almarai', value: 'Almarai', category: 'sans-serif', arabic: true },
      { name: 'Changa', value: 'Changa', category: 'sans-serif', arabic: true },
      { name: 'Lateef', value: 'Lateef', category: 'serif', arabic: true },
      { name: 'Harmattan', value: 'Harmattan', category: 'sans-serif', arabic: true },
      { name: 'Aref Ruqaa', value: 'Aref Ruqaa', category: 'serif', arabic: true },
      { name: 'Jomhuria', value: 'Jomhuria', category: 'display', arabic: true },
      { name: 'Rakkas', value: 'Rakkas', category: 'display', arabic: true }
    ],
    'Monospace': [
      { name: 'Courier New', value: 'Courier New', category: 'monospace' },
      { name: 'Monaco', value: 'Monaco', category: 'monospace' },
      { name: 'Consolas', value: 'Consolas', category: 'monospace' },
      { name: 'Source Code Pro', value: 'Source Code Pro', category: 'monospace' },
      { name: 'Fira Code', value: 'Fira Code', category: 'monospace' },
      { name: 'JetBrains Mono', value: 'JetBrains Mono', category: 'monospace' }
    ]
  };

  const allPopularFonts = Object.values(popularFonts).flat();

  // Extract font names from Google Font URL
  const extractFontsFromUrl = (url) => {
    try {
      const urlObj = new URL(url);
      if (urlObj.hostname === 'fonts.googleapis.com') {
        // Handle different Google Fonts URL formats
        if (urlObj.pathname === '/css2') {
          // Format: https://fonts.googleapis.com/css2?family=Inter:wght@400;700&family=Roboto:wght@300;400;500&display=swap
          const familyParam = urlObj.searchParams.get('family');
          if (familyParam) {
            return familyParam.split('&family=').map(font => {
              const fontName = font.split(':')[0];
              return fontName.replace(/\+/g, ' ');
            });
          }
        } else if (urlObj.pathname.startsWith('/css')) {
          // Format: https://fonts.googleapis.com/css?family=Inter:400,700|Roboto:300,400,500
          const familyParam = urlObj.searchParams.get('family');
          if (familyParam) {
            return familyParam.split('|').map(font => {
              const fontName = font.split(':')[0];
              return fontName.replace(/\+/g, ' ');
            });
          }
        }
      }
      return null;
    } catch (error) {
      console.error('Error parsing Google Font URL:', error);
      return null;
    }
  };

  // Use popular fonts instead of API call (more reliable)
  useEffect(() => {
    // Check if we already loaded fonts
    if (googleFonts.length > 0) return;
    
    // Use popular fonts directly - no API call needed
    setGoogleFonts(allPopularFonts);
    setLoading(false);
  }, []);

  // Load font dynamically
  const loadFont = (fontName) => {
    if (loadedFonts.has(fontName)) return;

    // Check if font is already in popular fonts (preloaded)
    const isPopularFont = allPopularFonts.some(font => 
      font.name.toLowerCase() === fontName.toLowerCase()
    );
    
    if (isPopularFont) {
      // Font is already preloaded, just mark as loaded
      setLoadedFonts(prev => new Set([...prev, fontName]));
      return;
    }

    // Load font dynamically from Google Fonts
    const link = document.createElement('link');
    link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
    link.rel = 'stylesheet';
    document.head.appendChild(link);
    setLoadedFonts(prev => new Set([...prev, fontName]));
  };

  // Filter suggestions based on search term (simplified)
  useEffect(() => {
    // Debounce search to prevent excessive filtering
    const timeoutId = setTimeout(() => {
      if (searchTerm.trim() === '') {
        // Show popular fonts when no search term
        setSuggestions(allPopularFonts.slice(0, 25));
      } else {
        const searchLower = searchTerm.toLowerCase();
        
        // Search in popular fonts
        const matches = allPopularFonts.filter(font =>
          font.name.toLowerCase().includes(searchLower)
        );
        
        // If no results found, try to suggest similar fonts
        if (matches.length === 0) {
          const similarFonts = allPopularFonts.filter(font =>
            font.name.toLowerCase().split(' ').some(word => 
              word.includes(searchLower) || searchLower.includes(word)
            )
          );
          setSuggestions(similarFonts.slice(0, 10));
        } else {
          setSuggestions(matches.slice(0, 30));
        }
      }
    }, 150); // 150ms debounce

    return () => clearTimeout(timeoutId);
  }, [searchTerm, allPopularFonts]);

  // Auto-load font when value changes
  useEffect(() => {
    if (value && !loadedFonts.has(value)) {
      loadFont(value);
    }
  }, [value, loadedFonts]);

  const handleFontSelect = (fontValue) => {
    onChange(fontValue);
    loadFont(fontValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleInputChange = (e) => {
    const newValue = e.target.value;
    onChange(newValue);
    setSearchTerm(newValue);
    setIsOpen(true);
    
    // Check if the input is a Google Font URL
    if (newValue.includes('fonts.googleapis.com')) {
      const fontNames = extractFontsFromUrl(newValue);
      if (fontNames && fontNames.length > 0) {
        // Auto-load the first font from the URL
        const firstFont = fontNames[0];
        
        // Create and append the link element
        const link = document.createElement('link');
        link.href = newValue;
        link.rel = 'stylesheet';
        document.head.appendChild(link);

        // Mark font as loaded and set as selected
        setLoadedFonts(prev => new Set([...prev, firstFont]));
        onChange(firstFont);
        
        console.log(`Auto-loaded font from URL: ${firstFont}`);
        return;
      }
    }
    
    // Auto-load font if it's a valid popular font
    if (newValue && allPopularFonts.some(font => font.name.toLowerCase() === newValue.toLowerCase())) {
      loadFont(newValue);
    }
  };

  const handleInputFocus = () => {
    setIsOpen(true);
    setSearchTerm(value);
  };

  const handleUrlSubmit = async () => {
    if (!urlInput.trim()) {
      setUrlError('Please enter a Google Font URL');
      return;
    }

    setUrlLoading(true);
    setUrlError('');

    try {
      const fontNames = extractFontsFromUrl(urlInput);
      
      if (!fontNames || fontNames.length === 0) {
        setUrlError('Invalid Google Font URL. Please check the URL format.');
        return;
      }

      // Load the first font from the URL
      const firstFont = fontNames[0];
      
      // Create and append the link element
      const link = document.createElement('link');
      link.href = urlInput;
      link.rel = 'stylesheet';
      document.head.appendChild(link);

      // Mark font as loaded
      setLoadedFonts(prev => new Set([...prev, firstFont]));
      
      // Set the font as selected
      onChange(firstFont);
      
      // Close URL input
      setShowUrlInput(false);
      setUrlInput('');
      
      console.log(`Loaded fonts from URL: ${fontNames.join(', ')}`);
      
    } catch (error) {
      console.error('Error loading font from URL:', error);
      setUrlError('Failed to load font from URL. Please check the URL and try again.');
    } finally {
      setUrlLoading(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setIsOpen(false);
        setSearchTerm('');
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Load current font on mount
  useEffect(() => {
    if (value) {
      loadFont(value);
    }
  }, [value]);

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Font Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          className="w-full p-2 border border-gray-300 rounded-md bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          placeholder="Enter font name (e.g., Inter, Cairo, Noto Sans Arabic)"
          style={{ fontFamily: value || 'Inter' }}
        />
        <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center space-x-1">
          {value && googleFonts.some(font => font.name.toLowerCase() === value.toLowerCase()) && (
            <Globe className="w-4 h-4 text-green-500" title="Google Font" />
          )}
          <ChevronDown className={`w-4 h-4 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
        </div>
      </div>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-80 overflow-y-auto">
          {/* Search Input */}
          <div className="sticky top-0 bg-white border-b border-gray-200 p-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-8 pr-2 py-1 text-sm border border-gray-200 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                placeholder="Search fonts (supports Arabic fonts)..."
                autoFocus
              />
            </div>
            
            {/* Google Font URL Input */}
            <div className="mt-2">
              <button
                type="button"
                onClick={() => setShowUrlInput(!showUrlInput)}
                className="w-full flex items-center justify-center space-x-2 px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded border border-indigo-200"
              >
                <Link className="w-3 h-3" />
                <span>Add Google Font URL</span>
              </button>
              
              {showUrlInput && (
                <div className="mt-2 space-y-2">
                  <input
                    type="url"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap"
                    className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-indigo-500"
                  />
                  
                  {urlError && (
                    <div className="flex items-center space-x-1 text-xs text-red-600">
                      <AlertCircle className="w-3 h-3" />
                      <span>{urlError}</span>
                    </div>
                  )}
                  
                  <div className="flex space-x-1">
                    <button
                      type="button"
                      onClick={handleUrlSubmit}
                      disabled={urlLoading}
                      className="flex-1 px-2 py-1 text-xs bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
                    >
                      {urlLoading ? 'Loading...' : 'Load Font'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowUrlInput(false);
                        setUrlInput('');
                        setUrlError('');
                      }}
                      className="px-2 py-1 text-xs bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="px-3 py-2 text-sm text-gray-500 flex items-center">
              <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mr-2"></div>
              Loading fonts...
            </div>
          )}

          {/* Font Suggestions */}
          <div className="max-h-60 overflow-y-auto">
            {suggestions.length > 0 ? (
              suggestions.map(font => (
                <button
                  key={font.value}
                  type="button"
                  onClick={() => handleFontSelect(font.value)}
                  className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                    value === font.value ? 'bg-indigo-50 text-indigo-700' : ''
                  }`}
                  style={{ fontFamily: font.value }}
                >
                  <div className="flex items-center space-x-2">
                    <span>{font.name}</span>
                    {font.arabic && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">عربي</span>
                    )}
                    {font.category && font.category !== 'monospace' && (
                      <Globe className="w-3 h-3 text-green-500" />
                    )}
                  </div>
                  {value === font.value && <Check className="w-4 h-4" />}
                </button>
              ))
            ) : (
              <div className="px-3 py-2 text-sm text-gray-500">
                <div>No fonts found for "{searchTerm}".</div>
                <div className="text-xs mt-1">Try searching for: Inter, Roboto, Cairo, Lateef, or browse popular fonts below.</div>
              </div>
            )}
          </div>

          {/* Popular Fonts Section */}
          {searchTerm === '' && (
            <div className="border-t border-gray-200">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 bg-gray-50">
                Popular Fonts
              </div>
              {Object.entries(popularFonts).map(([category, fonts]) => (
                <div key={category}>
                  <div className="px-3 py-1 text-xs font-semibold text-gray-500 bg-gray-50 flex items-center justify-between">
                    <span>{category}</span>
                    {category === 'Arabic' && (
                      <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">عربي</span>
                    )}
                  </div>
                  {fonts.slice(0, 4).map(font => (
                    <button
                      key={font.value}
                      type="button"
                      onClick={() => handleFontSelect(font.value)}
                      className={`w-full px-3 py-2 text-left text-sm hover:bg-gray-50 flex items-center justify-between ${
                        value === font.value ? 'bg-indigo-50 text-indigo-700' : ''
                      }`}
                      style={{ fontFamily: font.value }}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{font.name}</span>
                        {font.arabic && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-1 rounded">عربي</span>
                        )}
                        <Globe className="w-3 h-3 text-green-500" />
                      </div>
                      {value === font.value && <Check className="w-4 h-4" />}
                    </button>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default FontInput; 