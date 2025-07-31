import React, { useState } from 'react';
import FontInput from './FontInput';
import { ChevronDown, ChevronRight, Settings, Type, Palette, Layout, Zap, Image, Video, Music, Square, Lock, Unlock } from 'lucide-react';

const ElementProperties = ({ selectedElement, updateElement }) => {
  const [expandedSections, setExpandedSections] = useState({
    basic: false,
    text: false,
    styling: false,
    layout: false,
    effects: false,
    media: false,
    audio: false,
    shape: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  if (!selectedElement) return null;

  const SectionHeader = ({ title, icon: Icon, section, children }) => (
    <div className="border-b border-gray-300 pb-4 mb-4 bg-gray-50 rounded-lg p-2">
      <button
        onClick={() => toggleSection(section)}
        className="flex items-center justify-between w-full text-left hover:bg-gray-100 p-3 rounded-md transition-colors"
      >
        <div className="flex items-center space-x-3">
          <Icon className="w-5 h-5 text-gray-700" />
          <h3 className="text-sm font-semibold text-gray-900">{title}</h3>
        </div>
        {expandedSections[section] ? (
          <ChevronDown className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        )}
      </button>
      {expandedSections[section] && (
        <div className="mt-4 space-y-4 p-3 bg-white rounded-md border border-gray-200">
          {children}
        </div>
      )}
    </div>
  );

  const InputField = ({ label, type = "text", value, onChange, placeholder, step, min, max, className = "" }) => (
    <div className={`${className} p-2 bg-gray-50 rounded-md border border-gray-200`}>
      <label className="block text-xs font-medium text-gray-700 mb-2">{label}</label>
      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        placeholder={placeholder}
        step={step}
        min={min}
        max={max}
        className="w-full px-3 py-2.5 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
      />
    </div>
  );

  const ColorField = ({ label, value, onChange, className = "" }) => (
    <div className={`${className} p-2 bg-gray-50 rounded-md border border-gray-200`}>
      <label className="block text-xs font-medium text-gray-700 mb-2">{label}</label>
      <div className="flex items-center space-x-2">
        <input
          type="color"
          value={value || '#000000'}
          onChange={onChange}
          className="w-12 h-8 border-2 border-gray-300 rounded cursor-pointer shadow-sm flex-shrink-0"
        />
        <input
          type="text"
          value={value || '#000000'}
          onChange={onChange}
          className="min-w-0 flex-1 px-2 py-1.5 text-xs border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
        />
      </div>
    </div>
  );

  const ButtonGroup = ({ label, options, value, onChange, className = "" }) => (
    <div className={`${className} p-2 bg-gray-50 rounded-md border border-gray-200`}>
      <label className="block text-xs font-medium text-gray-700 mb-2">{label}</label>
      <div className="grid grid-cols-3 gap-1">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => onChange(option.value)}
            className={`px-3 py-2 text-xs rounded-md transition-colors ${
              value === option.value
                ? 'bg-indigo-100 text-indigo-700 border border-indigo-300 shadow-sm'
                : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
            }`}
          >
            {option.label}
          </button>
        ))}
      </div>
    </div>
  );

  const ToggleButton = ({ label, value, onChange, className = "" }) => (
    <button
      onClick={onChange}
      className={`px-3 py-2 text-xs rounded-md transition-colors ${
        value
          ? 'bg-indigo-100 text-indigo-700 border border-indigo-300 shadow-sm'
          : 'bg-white text-gray-600 hover:bg-gray-100 border border-gray-300'
      } ${className}`}
    >
      {label}
    </button>
  );

  return (
    <div className="h-full bg-gray-100 border-l border-gray-300 overflow-hidden">
      <div className="h-full overflow-y-auto p-4 space-y-6">
      {/* Basic Properties */}
      <SectionHeader title="Basic Properties" icon={Settings} section="basic">
        <InputField
          label="Name"
          value={selectedElement.name || ''}
          onChange={(e) => updateElement(selectedElement.id, { name: e.target.value })}
          placeholder="Element name"
        />
        
        <InputField
          label="Variable Name"
          value={selectedElement.variable_name || ''}
          onChange={(e) => updateElement(selectedElement.id, { variable_name: e.target.value })}
          placeholder="e.g., hero_text, background_image"
        />
        <p className="text-xs text-gray-500 -mt-2">
          Use this to make the element dynamic
        </p>
      
      {selectedElement.type !== 'audio' && (
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="X Position"
                type="number"
                value={selectedElement.x || 0}
                onChange={(e) => updateElement(selectedElement.id, { x: parseInt(e.target.value) || 0 })}
            />
            <InputField
              label="Y Position"
                type="number"
                value={selectedElement.y || 0}
                onChange={(e) => updateElement(selectedElement.id, { y: parseInt(e.target.value) || 0 })}
              />
          </div>
        )}

        {selectedElement.type !== 'audio' && (
          <div className="grid grid-cols-2 gap-3">
            <InputField
              label="Width"
                type="number"
                value={selectedElement.width || 0}
                onChange={(e) => updateElement(selectedElement.id, { width: parseInt(e.target.value) || 0 })}
            />
            <InputField
              label="Height"
                type="number"
                value={selectedElement.height || 0}
                onChange={(e) => updateElement(selectedElement.id, { height: parseInt(e.target.value) || 0 })}
              />
          </div>
      )}

        <div className="grid grid-cols-2 gap-3">
          <InputField
            label="Layer (Z-Index)"
            type="number"
            value={selectedElement.zIndex || 0}
            onChange={(e) => updateElement(selectedElement.id, { zIndex: parseInt(e.target.value) || 0 })}
            placeholder="0"
          />
        {selectedElement.type !== 'audio' && (
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Opacity</label>
              <input
                type="range"
                min="0"
                max="1"
                step="0.1"
                value={selectedElement.opacity || 1.0}
                onChange={(e) => updateElement(selectedElement.id, { opacity: parseFloat(e.target.value) })}
                className="w-full"
              />
              <div className="text-xs text-gray-500 mt-1">
                {Math.round((selectedElement.opacity || 1.0) * 100)}%
              </div>
          </div>
        )}
        </div>

        {/* Lock Element */}
        <div className="flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-gray-100 rounded-lg border-2 border-gray-300 shadow-sm">
          <div className="flex items-center space-x-3">
            {selectedElement.locked ? (
              <Lock className="w-5 h-5 text-red-500" />
            ) : (
              <Unlock className="w-5 h-5 text-gray-500" />
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700">Lock Element</label>
              <p className="text-xs text-gray-500">Prevent accidental changes</p>
            </div>
          </div>
          <ToggleButton
            label={selectedElement.locked ? "Locked" : "Unlocked"}
            value={selectedElement.locked || false}
            onChange={() => updateElement(selectedElement.id, { locked: !selectedElement.locked })}
            className={selectedElement.locked ? "bg-red-100 text-red-700 border-red-300" : ""}
          />
        </div>
      </SectionHeader>

      {/* Text-specific properties */}
      {selectedElement.type === 'text' && (
        <>
          <SectionHeader title="Text Content" icon={Type} section="text">
          <div className="p-2 bg-gray-50 rounded-md border border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-2">Text Content</label>
            <textarea
              value={selectedElement.text || ''}
              onChange={(e) => updateElement(selectedElement.id, { text: e.target.value })}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 bg-white"
                rows="3"
                placeholder="Enter your text here..."
            />
          </div>
          </SectionHeader>

          <SectionHeader title="Text Styling" icon={Palette} section="styling">
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Font Size"
                  type="number"
                  value={selectedElement.font_size || 24}
                  onChange={(e) => updateElement(selectedElement.id, { font_size: parseInt(e.target.value) || 24 })}
              />
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Font Family</label>
                <FontInput
                  value={selectedElement.font_family || 'Inter'}
                  onChange={(fontFamily) => updateElement(selectedElement.id, { font_family: fontFamily })}
                  className="text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <ColorField
                label="Text Color"
                value={selectedElement.color || '#000000'}
                onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
              />
              <ColorField
                label="Background Color"
                  value={selectedElement.background_color || '#ffffff'}
                  onChange={(e) => updateElement(selectedElement.id, { background_color: e.target.value })}
                />
            </div>
            
            <div className="p-2 bg-gray-50 rounded-md border border-gray-200">
              <label className="block text-xs font-medium text-gray-700 mb-2">Text Formatting</label>
              <div className="grid grid-cols-3 gap-2">
                <ToggleButton
                  label="Bold"
                  value={selectedElement.bold}
                  onChange={() => updateElement(selectedElement.id, { bold: !selectedElement.bold })}
                />
                <ToggleButton
                  label="Italic"
                  value={selectedElement.italic}
                  onChange={() => updateElement(selectedElement.id, { italic: !selectedElement.italic })}
                />
                <ToggleButton
                  label="Underline"
                  value={selectedElement.underline}
                  onChange={() => updateElement(selectedElement.id, { underline: !selectedElement.underline })}
                />
              </div>
            </div>
          
            <ButtonGroup
              label="Horizontal Alignment"
              options={[
                { value: 'left', label: 'Left' },
                { value: 'center', label: 'Center' },
                { value: 'right', label: 'Right' }
              ]}
              value={selectedElement.alignment || 'left'}
              onChange={(value) => updateElement(selectedElement.id, { alignment: value })}
            />

            <ButtonGroup
              label="Vertical Alignment"
              options={[
                { value: 'top', label: 'Top' },
                { value: 'middle', label: 'Middle' },
                { value: 'bottom', label: 'Bottom' }
              ]}
              value={selectedElement.verticalAlignment || 'middle'}
              onChange={(value) => {
                console.log('Vertical alignment changed to:', value);
                updateElement(selectedElement.id, { verticalAlignment: value });
              }}
            />

            {/* Text Shadow */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Text Shadow</label>
              <div className="grid grid-cols-2 gap-2">
                <ToggleButton
                  label="Enable Shadow"
                  value={!!selectedElement.text_shadow}
                  onChange={() => {
                    if (selectedElement.text_shadow) {
                      updateElement(selectedElement.id, { text_shadow: null });
                    } else {
                      updateElement(selectedElement.id, { 
                        text_shadow: { 
                          color: '#000000', 
                          x: 2, 
                          y: 2, 
                          blur: 3 
                        } 
                      });
                    }
                  }}
                />
                {selectedElement.text_shadow && (
                  <>
                    <ColorField
                      label="Shadow Color"
                      value={selectedElement.text_shadow.color || '#000000'}
                      onChange={(e) => updateElement(selectedElement.id, { 
                        text_shadow: { 
                          ...selectedElement.text_shadow, 
                          color: e.target.value 
                        } 
                      })}
                    />
                    <InputField
                      label="X Offset"
                      type="number"
                      value={selectedElement.text_shadow.x || 2}
                      onChange={(e) => updateElement(selectedElement.id, { 
                        text_shadow: { 
                          ...selectedElement.text_shadow, 
                          x: parseInt(e.target.value) || 0 
                        } 
                      })}
                    />
                    <InputField
                      label="Y Offset"
                      type="number"
                      value={selectedElement.text_shadow.y || 2}
                      onChange={(e) => updateElement(selectedElement.id, { 
                        text_shadow: { 
                          ...selectedElement.text_shadow, 
                          y: parseInt(e.target.value) || 0 
                        } 
                      })}
                    />
                    <InputField
                      label="Blur"
                      type="number"
                      value={selectedElement.text_shadow.blur || 3}
                      onChange={(e) => updateElement(selectedElement.id, { 
                        text_shadow: { 
                          ...selectedElement.text_shadow, 
                          blur: parseInt(e.target.value) || 0 
                        } 
                      })}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Text Stroke */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-2">Text Stroke</label>
              <div className="grid grid-cols-2 gap-2">
                <ToggleButton
                  label="Enable Stroke"
                  value={!!selectedElement.text_stroke}
                  onChange={() => {
                    if (selectedElement.text_stroke) {
                      updateElement(selectedElement.id, { text_stroke: null });
                    } else {
                      updateElement(selectedElement.id, { 
                        text_stroke: { 
                          color: '#000000', 
                          width: 2 
                        } 
                      });
                    }
                  }}
                />
                {selectedElement.text_stroke && (
                  <>
                    <ColorField
                      label="Stroke Color"
                      value={selectedElement.text_stroke.color || '#000000'}
                      onChange={(e) => updateElement(selectedElement.id, { 
                        text_stroke: { 
                          ...selectedElement.text_stroke, 
                          color: e.target.value 
                        } 
                      })}
                    />
                    <InputField
                      label="Stroke Width"
                      type="number"
                      value={selectedElement.text_stroke.width || 2}
                      onChange={(e) => updateElement(selectedElement.id, { 
                        text_stroke: { 
                          ...selectedElement.text_stroke, 
                          width: parseInt(e.target.value) || 1 
                        } 
                      })}
                    />
                  </>
                )}
              </div>
            </div>

          </SectionHeader>


        </>
      )}

      {/* Media-specific properties */}
      {(selectedElement.type === 'image' || selectedElement.type === 'video') && (
        <SectionHeader 
          title={selectedElement.type === 'image' ? 'Image Properties' : 'Video Properties'} 
          icon={selectedElement.type === 'image' ? Image : Video} 
          section="media"
        >
          <InputField
            label="Source URL"
              type="url"
              value={selectedElement.url || ''}
              onChange={(e) => updateElement(selectedElement.id, { url: e.target.value, src: e.target.value })}
            placeholder={`https://example.com/${selectedElement.type}.${selectedElement.type === 'image' ? 'jpg' : 'mp4'}`}
            />
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Size Mode</label>
            <select
              value={selectedElement.objectFit || 'cover'}
              onChange={(e) => updateElement(selectedElement.id, { objectFit: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="cover">Cover (Fill container)</option>
              <option value="contain">Scale to Fit</option>
              <option value="fill">Stretch</option>
              <option value="none">Original Size</option>
            </select>
          </div>

          {selectedElement.type === 'video' && (
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="autoplay"
                  checked={selectedElement.autoplay || false}
                  onChange={(e) => updateElement(selectedElement.id, { autoplay: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="autoplay" className="text-xs text-gray-700">Autoplay</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="loop"
                  checked={selectedElement.loop || false}
                  onChange={(e) => updateElement(selectedElement.id, { loop: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="loop" className="text-xs text-gray-700">Loop</label>
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="muted"
                  checked={selectedElement.muted || true}
                  onChange={(e) => updateElement(selectedElement.id, { muted: e.target.checked })}
                  className="rounded"
                />
                <label htmlFor="muted" className="text-xs text-gray-700">Muted</label>
              </div>
            </div>
          )}
        </SectionHeader>
      )}

      {/* Audio-specific properties */}
      {selectedElement.type === 'audio' && (
        <SectionHeader title="Audio Properties" icon={Music} section="audio">
          <InputField
            label="Audio URL"
              type="url"
              value={selectedElement.url || ''}
              onChange={(e) => updateElement(selectedElement.id, { url: e.target.value, src: e.target.value })}
              placeholder="https://example.com/audio.mp3"
            />
          
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Volume</label>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={selectedElement.volume || 1}
              onChange={(e) => updateElement(selectedElement.id, { volume: parseFloat(e.target.value) })}
              className="w-full"
            />
            <div className="text-xs text-gray-500 mt-1">
              {Math.round((selectedElement.volume || 1) * 100)}%
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="loop-audio"
              checked={selectedElement.loop || false}
              onChange={(e) => updateElement(selectedElement.id, { loop: e.target.checked })}
              className="rounded"
            />
            <label htmlFor="loop-audio" className="text-xs text-gray-700">Loop Audio</label>
          </div>
        </SectionHeader>
      )}

      {/* Shape-specific properties */}
      {selectedElement.type === 'shape' && (
        <SectionHeader title="Shape Properties" icon={Square} section="shape">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Shape Type</label>
            <select
              value={selectedElement.shape_type}
              onChange={(e) => updateElement(selectedElement.id, { shape_type: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
            >
              <option value="rectangle">Rectangle</option>
              <option value="circle">Circle</option>
              <option value="triangle">Triangle</option>
            </select>
          </div>
          
          <ColorField
            label="Color"
              value={selectedElement.color}
              onChange={(e) => updateElement(selectedElement.id, { color: e.target.value })}
          />
        </SectionHeader>
      )}

      {/* Layout & Effects (for non-audio elements) */}
      {selectedElement.type !== 'audio' && (
        <>
          <SectionHeader title="Layout & Borders" icon={Layout} section="layout">
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Margin"
                type="number"
                value={selectedElement.margin || 0}
                onChange={(e) => updateElement(selectedElement.id, { margin: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              <InputField
                label="Padding"
                type="number"
                value={selectedElement.padding || 0}
                onChange={(e) => updateElement(selectedElement.id, { padding: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Border Width"
                type="number"
                value={selectedElement.border_width || 0}
                onChange={(e) => updateElement(selectedElement.id, { border_width: parseInt(e.target.value) || 0 })}
                placeholder="0"
              />
              <ColorField
                label="Border Color"
                value={selectedElement.border_color || '#000000'}
                onChange={(e) => updateElement(selectedElement.id, { border_color: e.target.value })}
              />
            </div>
            
            <InputField
              label="Border Radius"
              type="number"
              value={selectedElement.border_radius || 0}
              onChange={(e) => updateElement(selectedElement.id, { border_radius: parseInt(e.target.value) || 0 })}
              placeholder="0"
            />
          </SectionHeader>

          <SectionHeader title="Effects & Animation" icon={Zap} section="effects">
            <InputField
              label="Shadow"
              value={selectedElement.shadow || ''}
              onChange={(e) => updateElement(selectedElement.id, { shadow: e.target.value })}
              placeholder="0 2px 4px rgba(0,0,0,0.1)"
            />
            
            <div className="grid grid-cols-2 gap-3">
              <InputField
                label="Fade In (s)"
                type="number"
                value={selectedElement.fade_in || 0}
                onChange={(e) => updateElement(selectedElement.id, { fade_in: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                step="0.1"
              />
              <InputField
                label="Fade Out (s)"
                type="number"
                value={selectedElement.fade_out || 0}
                onChange={(e) => updateElement(selectedElement.id, { fade_out: parseFloat(e.target.value) || 0 })}
                placeholder="0"
                step="0.1"
            />
          </div>
          </SectionHeader>
        </>
      )}
      </div>
    </div>
  );
};

export default ElementProperties; 