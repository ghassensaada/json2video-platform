import React, { useState } from 'react';
import { X, Link as LinkIcon, Image, Video } from 'lucide-react';

const MediaModal = ({ isOpen, onClose, onConfirm, elementType, canvasDimensions }) => {
  const [url, setUrl] = useState('');
  const [sizeMode, setSizeMode] = useState('cover');
  const [variableName, setVariableName] = useState('');
  const [mediaDimensions, setMediaDimensions] = useState({ width: 0, height: 0 });
  const [calculatedDimensions, setCalculatedDimensions] = useState({ width: 150, height: 150 });

  // Calculate dimensions based on media size and fit mode
  const calculateDimensions = (mediaWidth, mediaHeight, fitMode) => {
    console.log('Calculating dimensions:', { mediaWidth, mediaHeight, fitMode }); // Debug log
    console.log('Canvas dimensions:', canvasDimensions); // Debug log
    
    // Use canvas dimensions instead of fixed maximums
    const maxWidth = canvasDimensions?.width || 400;
    const maxHeight = canvasDimensions?.height || 600;
    const minWidth = 50;   // Minimum element width
    const minHeight = 50;  // Minimum element height

    let width, height;
    const mediaAspectRatio = mediaWidth / mediaHeight;

    switch (fitMode) {
      case 'cover':
        // Fill the entire canvas, maintaining aspect ratio
        console.log('Cover mode - aspect ratio:', mediaAspectRatio); // Debug log
        
        if (mediaAspectRatio > 1) {
          // Landscape - fill width, crop height
          width = maxWidth;
          height = maxWidth / mediaAspectRatio;
          console.log('Landscape - calculated:', { width, height }); // Debug log
        } else {
          // Portrait - fill height, crop width
          height = maxHeight;
          width = maxHeight * mediaAspectRatio;
          console.log('Portrait - calculated:', { width, height }); // Debug log
        }
        break;
      
      case 'contain':
        // Fit within canvas, maintaining aspect ratio
        const containerAspect = maxWidth / maxHeight;
        if (mediaAspectRatio > containerAspect) {
          width = maxWidth;
          height = maxWidth / mediaAspectRatio;
        } else {
          height = maxHeight;
          width = maxHeight * mediaAspectRatio;
        }
        break;
      
      case 'fill':
        // Stretch to fill entire canvas
        width = maxWidth;
        height = maxHeight;
        break;
      
      case 'none':
        // Original size, but capped to canvas
        width = Math.min(maxWidth, mediaWidth);
        height = Math.min(maxHeight, mediaHeight);
        break;
      
      default:
        width = 150;
        height = 150;
    }

    // Ensure minimum dimensions
    width = Math.max(minWidth, Math.round(width));
    height = Math.max(minHeight, Math.round(height));

    return { width, height };
  };

  // Load media metadata to get dimensions
  const loadMediaMetadata = (mediaUrl) => {
    return new Promise((resolve, reject) => {
      if (mediaUrl) {
        const img = new Image();
        img.onload = () => {
          const dimensions = { width: img.naturalWidth, height: img.naturalHeight };
          setMediaDimensions(dimensions);
          const calculated = calculateDimensions(dimensions.width, dimensions.height, sizeMode);
          setCalculatedDimensions(calculated);
          resolve(dimensions);
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.crossOrigin = 'anonymous';
        img.src = mediaUrl;
      } else {
        reject(new Error('No media source provided'));
      }
    });
  };

  // Handle size mode change
  const handleSizeModeChange = (newSizeMode) => {
    console.log('Size mode changed to:', newSizeMode); // Debug log
    setSizeMode(newSizeMode);
    if (mediaDimensions.width > 0 && mediaDimensions.height > 0) {
      const calculated = calculateDimensions(mediaDimensions.width, mediaDimensions.height, newSizeMode);
      setCalculatedDimensions(calculated);
      console.log('Updated calculated dimensions:', calculated); // Debug log
    } else {
      console.log('No media dimensions available for recalculation'); // Debug log
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    console.log('Form submitted with:', { url, sizeMode, variableName }); // Debug log
    console.log('Current calculated dimensions:', calculatedDimensions); // Debug log
    console.log('Media dimensions:', mediaDimensions); // Debug log
    
    if (!url.trim()) {
      alert('Please enter a URL');
      return;
    }

    // If we don't have media dimensions, use default calculation
    let finalWidth = calculatedDimensions.width;
    let finalHeight = calculatedDimensions.height;
    
    if (mediaDimensions.width === 0 && mediaDimensions.height === 0) {
      // Use default dimensions based on size mode and canvas
      const canvasWidth = canvasDimensions?.width || 400;
      const canvasHeight = canvasDimensions?.height || 600;
      const defaultCalc = calculateDimensions(canvasWidth, canvasHeight, sizeMode);
      finalWidth = defaultCalc.width;
      finalHeight = defaultCalc.height;
      console.log('Using default dimensions based on canvas:', defaultCalc); // Debug log
    }

    const mediaData = {
      url: url.trim(),
      sizeMode,
      variableName: variableName.trim(),
      width: finalWidth,
      height: finalHeight
    };
    
    console.log('Calling onConfirm with:', mediaData); // Debug log
    onConfirm(mediaData);
    
    // Reset form
    setUrl('');
    setVariableName('');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">
            Add {elementType === 'image' ? 'Image' : elementType === 'video' ? 'Video' : 'Audio'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* URL Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {elementType === 'image' ? 'Image' : elementType === 'video' ? 'Video' : 'Audio'} URL
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => {
                console.log('URL input changed:', e.target.value); // Debug log
                setUrl(e.target.value);
              }}
              onBlur={() => {
                if (url.trim() && elementType !== 'audio') {
                  loadMediaMetadata(url.trim()).catch(err => {
                    console.log('Could not load metadata:', err.message);
                  });
                }
              }}
              className="w-full input text-sm"
              placeholder={`https://example.com/${elementType}.${elementType === 'image' ? 'jpg' : elementType === 'video' ? 'mp4' : 'mp3'}`}
              required
            />
          </div>

          {/* Size Mode Selection - Only for images and videos */}
          {elementType !== 'audio' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Size Mode
              </label>
              <select
                value={sizeMode}
                onChange={(e) => {
                  console.log('Size mode changed:', e.target.value); // Debug log
                  handleSizeModeChange(e.target.value);
                }}
                className="w-full input text-sm"
              >
                <option value="cover">Cover (Fill container)</option>
                <option value="contain">Scale to Fit</option>
                <option value="fill">Stretch</option>
                <option value="none">Original Size</option>
              </select>
            </div>
          )}

          {/* Dimensions Display - Only for images and videos */}
          {elementType !== 'audio' && mediaDimensions.width > 0 && mediaDimensions.height > 0 && (
            <div className="space-y-2">
              <div className="text-xs text-gray-600">
                Original: {mediaDimensions.width} × {mediaDimensions.height}
              </div>
              <div className="text-xs text-gray-600">
                Calculated: {calculatedDimensions.width} × {calculatedDimensions.height}
              </div>
            </div>
          )}

          {/* Variable Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Variable Name (Optional)
            </label>
            <input
              type="text"
              value={variableName}
              onChange={(e) => {
                console.log('Variable name changed:', e.target.value); // Debug log
                setVariableName(e.target.value);
              }}
              className="w-full input text-sm"
              placeholder={`e.g., hero_${elementType}, background_${elementType}`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Use this to make the {elementType} dynamic in your templates
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 btn btn-outline"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 btn btn-primary"
            >
              Add {elementType === 'image' ? 'Image' : elementType === 'video' ? 'Video' : 'Audio'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MediaModal; 