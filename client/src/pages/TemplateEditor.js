import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import MediaModal from '../components/MediaModal';
import ResizeHandles from '../components/ResizeHandles';
import TextResizeHandles from '../components/TextResizeHandles';
import ResizableSidebar from '../components/ResizableSidebar';

import InlineTextEditor from '../components/InlineTextEditor';
import ContextMenu from '../components/ContextMenu';
import DraggableElementList from '../components/DraggableElementList';
import ElementProperties from '../components/ElementProperties';

import { applySnapping } from '../utils/snapping';
import {
  Save,
  Play,
  Pause,
  Eye,
  Code,
  Plus,
  Trash2,
  Image,
  Type,
  Music,
  Square,
  Layers,
  Edit,
  LogIn,
  Video,
  Settings,
  Grid,
  Upload,
  Link as LinkIcon,
  Volume2,
  Palette,
  Move,
  RotateCcw,
  Copy,
  Scissors,
  Clock,
  Variable,
  Film,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronDown,
  Maximize,
  Minimize,
  Download,
  Share2,
  Lock
} from 'lucide-react';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { tomorrow } from 'react-syntax-highlighter/dist/esm/styles/prism';

const TemplateEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const canvasRef = useRef(null);
  const [activeTab, setActiveTab] = useState('preview');
  const [selectedElement, setSelectedElement] = useState(null);
  const [activeScene, setActiveScene] = useState(0);
  const [showGrid, setShowGrid] = useState(true);
  const [gridSize, setGridSize] = useState(20);
  const [fineGrid, setFineGrid] = useState(false);
  const [aspectRatio, setAspectRatio] = useState('9:16');
  const [template, setTemplate] = useState({
    name: 'New Template',
    description: '',
    template_data: {
        aspect_ratio: '9:16',
      variables: [],
      scenes: [{
        id: 'scene_1',
        name: 'Scene 1',
        duration: 5,
        elements: []
      }],
      elements: []
    }
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [draggedElement, setDraggedElement] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [mediaModal, setMediaModal] = useState({ isOpen: false, type: null });
  const [isResizing, setIsResizing] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [totalDuration, setTotalDuration] = useState(0);
  const [leftSidebarWidth, setLeftSidebarWidth] = useState(500);
  const [rightSidebarWidth, setRightSidebarWidth] = useState(500);
  const [activeAudioInstances, setActiveAudioInstances] = useState([]);
  const [isRendering, setIsRendering] = useState(false);

  const [showShortcuts, setShowShortcuts] = useState(false);
  
  // Memoize other elements for performance
  const otherElements = useMemo(() => {
    if (!draggedElement || !template?.template_data?.scenes || !template.template_data.scenes[activeScene]) return [];
    const currentScene = template.template_data.scenes[activeScene];
    return currentScene.elements.filter(el => el.id !== draggedElement.id);
  }, [draggedElement?.id, template?.template_data?.scenes, activeScene]);
  

  const [editingText, setEditingText] = useState(null);
  const [contextMenu, setContextMenu] = useState({ isVisible: false, position: { x: 0, y: 0 }, element: null });
  const [clipboard, setClipboard] = useState(null);

  const videoRef = useRef(null);

  const { isAuthenticated, loading: authLoading } = useAuth();

  // Aspect ratio presets
  const aspectRatios = [
    { value: '16:9', label: '16:9 (HD)', width: 1920, height: 1080 },
    { value: '9:16', label: '9:16 (Mobile)', width: 1080, height: 1920 },
    { value: '1:1', label: '1:1 (Square)', width: 1080, height: 1080 },
    { value: '4:3', label: '4:3 (Standard)', width: 1440, height: 1080 },
    { value: '21:9', label: '21:9 (Ultrawide)', width: 2560, height: 1080 }
  ];

  const getCanvasDimensions = () => {
    const ratio = aspectRatios.find(r => r.value === aspectRatio);
    return {
      width: ratio.width,
      height: ratio.height,
      scale: 1
    };
  };

  const snapToGrid = (value) => {
    const currentGridSize = fineGrid ? 5 : gridSize;
    return Math.round(value / currentGridSize) * currentGridSize;
  };

  const snapToCenter = (value, isHorizontal) => {
    const { width, height } = getCanvasDimensions();
    const center = isHorizontal ? width / 2 : height / 2;
    const snapThreshold = 20; // pixels
    
    if (Math.abs(value - center) < snapThreshold) {
      return center;
    }
    return value;
  };

  // Function to load all fonts used in the template
  const loadTemplateFonts = useCallback((templateData) => {
    const fontsToLoad = new Set();
    
    // Extract fonts from all scenes and elements
    if (templateData.scenes) {
      templateData.scenes.forEach(scene => {
        if (scene.elements) {
          scene.elements.forEach(element => {
            if (element.type === 'text' && element.font_family) {
              fontsToLoad.add(element.font_family);
            }
          });
        }
      });
    }
    
    // Load each font
    fontsToLoad.forEach(fontName => {
      if (fontName && fontName !== 'Inter') { // Skip default font
        console.log(`Loading font for template: ${fontName}`);
        
        // Check if font is already loaded
        const existingLink = document.querySelector(`link[href*="${fontName.replace(/\s+/g, '+')}"]`);
        if (!existingLink) {
          const link = document.createElement('link');
          link.href = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@300;400;500;600;700&display=swap`;
          link.rel = 'stylesheet';
          document.head.appendChild(link);
          console.log(`Font loaded: ${fontName}`);
        }
      }
    });
  }, []);

  const fetchTemplate = useCallback(async () => {
    if (!id || id === 'undefined') {
      console.log('Template ID is undefined, skipping fetch');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(`/api/templates/${id}`);
      const templateData = response.data.template;
      const parsedData = JSON.parse(templateData.template_data);
      
      const updatedTemplate = {
        ...templateData,
        template_data: {
          ...parsedData,
          scenes: parsedData.scenes || [{
            id: 'scene_1',
            name: 'Scene 1',
            duration: 5,
            elements: []
          }]
        }
      };
      
      setTemplate(updatedTemplate);
      setAspectRatio(parsedData.aspect_ratio || '16:9');
      
      // Load all fonts used in the template
      loadTemplateFonts(updatedTemplate.template_data);
    } catch (error) {
      console.error('Error fetching template:', error);
      if (error.response?.status === 401) {
        toast.error('Please log in to edit templates');
        navigate('/login');
      } else if (error.response?.status === 404) {
        toast.error('Template not found');
        navigate('/templates');
      } else {
      toast.error('Failed to load template');
      }
    } finally {
      setLoading(false);
    }
  }, [id, navigate, loadTemplateFonts]);

  useEffect(() => {
    if (!authLoading) {
      if (isAuthenticated) {
        if (id === 'new') {
          const newTemplate = {
            name: 'New Template',
            description: '',
            template_data: {
              aspect_ratio: aspectRatio,
              variables: [],
              scenes: [{
                id: 'scene_1',
                name: 'Scene 1',
                duration: 5,
                elements: []
              }]
            }
          };
          setTemplate(newTemplate);
          setLoading(false);
        } else if (id && id !== 'undefined') {
          fetchTemplate();
        } else {
          console.log('Template ID not available yet:', id);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    }
  }, [id, isAuthenticated, authLoading, fetchTemplate, aspectRatio]);

  // Load fonts when template changes
  useEffect(() => {
    if (template && template.template_data && !loading) {
      loadTemplateFonts(template.template_data);
    }
  }, [template, loadTemplateFonts, loading]);

  // Cleanup playback interval on unmount
  useEffect(() => {
    return () => {
      if (window.playbackInterval) {
        clearInterval(window.playbackInterval);
        window.playbackInterval = null;
      }
    };
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      
      // Validate template data before saving
      if (!template || !template.template_data) {
        throw new Error('Template data is missing');
      }
      
      if (!template.name || template.name.trim() === '') {
        toast.error('Template name is required');
        return;
      }
      
      // Ensure template_data has required structure
      const validatedTemplateData = {
        aspect_ratio: aspectRatio,
        variables: template.template_data.variables || [],
        scenes: template.template_data.scenes || [{
          id: 'scene_1',
          name: 'Scene 1',
          duration: 5,
          elements: []
        }]
      };
      
      // Remove any extra elements array at root level
      delete validatedTemplateData.elements;
      
      const templateData = {
        name: template.name.trim(),
        description: template.description || '',
        template_data: validatedTemplateData
      };

      // Debug: Log the template data being sent
      console.log('Saving template data:', templateData);
      console.log('Template structure:', JSON.stringify(templateData, null, 2));
      console.log('Template ID:', id);
      console.log('User authenticated:', isAuthenticated);

      if (id === 'new' || !id || id === 'undefined') {
        console.log('Creating new template...');
        const response = await axios.post('/api/templates', templateData);
        console.log('Create response:', response.data);
        toast.success('Template created successfully');
        navigate(`/templates/${response.data.template.id}`);
      } else {
        console.log('Updating existing template...');
        const response = await axios.put(`/api/templates/${id}`, templateData);
        console.log('Update response:', response.data);
        toast.success('Template saved successfully');
      }
    } catch (error) {
      console.error('Error saving template:', error);
      console.error('Error response:', error.response?.data);
      console.error('Error status:', error.response?.status);
      console.error('Error message:', error.message);
      console.error('Full error object:', error);
      
      if (error.response?.status === 401) {
        toast.error('Please log in to save templates');
        navigate('/login');
      } else if (error.response?.status === 400) {
        const errorMsg = error.response.data.error || 'Invalid template data';
        console.error('Validation error:', errorMsg);
        toast.error(errorMsg);
      } else if (error.response?.status === 404) {
        toast.error('Template not found');
      } else if (error.response?.status === 500) {
        toast.error('Server error. Please try again later.');
      } else if (error.message) {
        toast.error(`Error: ${error.message}`);
      } else {
        toast.error('Failed to save template. Please check your data and try again.');
      }
    } finally {
      setSaving(false);
    }
  };

  const addScene = () => {
    const newScene = {
      id: `scene_${Date.now()}`,
      name: `Scene ${template.template_data.scenes.length + 1}`,
      duration: 5,
      elements: []
    };
    setTemplate(prev => ({
      ...prev,
      template_data: {
        ...prev.template_data,
        scenes: [...prev.template_data.scenes, newScene]
      }
    }));
    setActiveScene(template.template_data.scenes.length);
  };

  const deleteScene = (sceneIndex) => {
    if (template.template_data.scenes.length <= 1) {
      toast.error('Cannot delete the last scene');
      return;
    }
    
    setTemplate(prev => ({
      ...prev,
      template_data: {
        ...prev.template_data,
        scenes: prev.template_data.scenes.filter((_, index) => index !== sceneIndex)
      }
    }));
    
    if (activeScene >= sceneIndex) {
      setActiveScene(Math.max(0, activeScene - 1));
    }
  };

  const updateSceneDuration = (sceneIndex, duration) => {
    setTemplate(prev => ({
      ...prev,
      template_data: {
        ...prev.template_data,
        scenes: prev.template_data.scenes.map((scene, index) =>
          index === sceneIndex ? { ...scene, duration: Math.max(1, Math.min(60, duration)) } : scene
        )
      }
    }));
  };

  const addVariable = () => {
    const newVariable = {
      id: `var_${Date.now()}`,
      name: 'New Variable',
      type: 'text',
      default_value: '',
      description: ''
    };
    setTemplate(prev => ({
      ...prev,
      template_data: {
        ...prev.template_data,
        variables: [...prev.template_data.variables, newVariable]
      }
    }));
  };



  const getDefaultElementProperties = (type) => {
    const { width, height } = getCanvasDimensions();
    const centerX = snapToGrid(width / 2 - 100);
    const centerY = snapToGrid(height / 2 - 50);
    
    switch (type) {
      case 'text':
        return {
          text: 'Sample Text',
          font_size: 24,
          font_family: 'Inter',
          color: '#000000',
          background_color: 'transparent',
          alignment: 'center',
          verticalAlignment: 'middle',
          bold: false,
          italic: false,
          underline: false,
          text_shadow: null,
          text_stroke: null,
          margin: 0,
          padding: 0,
          border_width: 0,
          border_color: '#000000',
          border_radius: 0,
          shadow: '',
          fade_in: 0,
          fade_out: 0,
          opacity: 1.0,
          zIndex: 0,
          // Text wrapping properties
          text_wrap: true,
          text_wrap_width: 400,
          text_wrap_height: 200,
          text_padding: 20,
          locked: false
        };
              case 'image':
        return {
          src: '',
          alt: 'Image',
          fit: 'cover',
          url: '',
          uploaded: false,
          objectFit: 'cover',
          opacity: 1.0,
          zIndex: 0,
          locked: false
        };
              case 'video':
        return {
          src: '',
          alt: 'Video',
          fit: 'cover',
          url: '',
          uploaded: false,
          autoplay: true,
          loop: false,
          muted: true,
          objectFit: 'cover',
          opacity: 1.0,
          zIndex: 0,
          locked: false
        };
              case 'shape':
        return {
          shape_type: 'rectangle',
          color: '#ff0000',
          border_width: 0,
          border_color: '#000000',
          border_radius: 0,
          opacity: 1.0,
          zIndex: 0,
          locked: false
        };
              case 'audio':
        return {
          src: '',
          volume: 1,
          loop: false,
          url: '',
          uploaded: false,
          zIndex: 0,
          locked: false
        };
      default:
        return {};
    }
  };

  const addElement = (type) => {
    // For media elements, show modal first
    if (type === 'image' || type === 'video') {
      setMediaModal({ isOpen: true, type });
      return;
    }

    const { width, height } = getCanvasDimensions();
    const centerX = snapToGrid(width / 2 - 100);
    const centerY = snapToGrid(height / 2 - 50);
    
    const newElement = {
      id: `element_${Date.now()}`,
      type,
      name: `${type.charAt(0).toUpperCase() + type.slice(1)} Element`,
      x: centerX,
      y: centerY,
      width: type === 'text' ? Math.max(200, 50) : 150,
      height: type === 'text' ? Math.max(100, 50) : 150,
      duration: 3,
      start: 0,
      scene_id: template.template_data.scenes[activeScene].id,
      variable_name: '',
      ...getDefaultElementProperties(type)
    };
    
    setTemplate(prev => ({
      ...prev,
      template_data: {
        ...prev.template_data,
        scenes: prev.template_data.scenes.map((scene, index) => 
          index === activeScene 
            ? { ...scene, elements: [...scene.elements, newElement] }
            : scene
        )
      }
    }));
    setSelectedElement(newElement);
  };

  const handleMediaConfirm = async (mediaData) => {
    try {
      console.log('Media data received:', mediaData); // Debug log
      
      if (!mediaData.url || !mediaData.url.trim()) {
        toast.error('Please provide a valid URL');
        return;
      }
      
      const src = mediaData.url.trim();
      const url = mediaData.url.trim();
      console.log('Using URL:', url); // Debug log

      const { width, height } = getCanvasDimensions();
      const elementWidth = mediaData.width || 150;
      const elementHeight = mediaData.height || 150;
      const centerX = snapToGrid(width / 2 - elementWidth / 2);
      const centerY = snapToGrid(height / 2 - elementHeight / 2);
      
      const newElement = {
        ...getDefaultElementProperties(mediaModal.type),
        id: `element_${Date.now()}`,
        type: mediaModal.type,
        name: `${mediaModal.type.charAt(0).toUpperCase() + mediaModal.type.slice(1)} Element`,
        x: centerX,
        y: centerY,
        width: elementWidth,
        height: elementHeight,
        duration: 3,
        start: 0,
        scene_id: template.template_data.scenes[activeScene].id,
        src: src,
        url: url,
        objectFit: mediaData.sizeMode || 'cover',
        variable_name: mediaData.variableName || ''
      };
      
      console.log('Creating new element:', newElement); // Debug log
      console.log('Element src value:', newElement.src); // Debug log
      console.log('Element url value:', newElement.url); // Debug log
      
      setTemplate(prev => ({
        ...prev,
        template_data: {
          ...prev.template_data,
          scenes: prev.template_data.scenes.map((scene, index) => 
            index === activeScene 
              ? { ...scene, elements: [...scene.elements, newElement] }
              : scene
          )
        }
      }));
      setSelectedElement(newElement);
      toast.success(`${mediaModal.type.charAt(0).toUpperCase() + mediaModal.type.slice(1)} added successfully`);
    } catch (error) {
      console.error('Error adding media element:', error);
      toast.error('Failed to add media element');
    }
  };

  const handleResize = (newDimensions) => {
    if (selectedElement) {
      updateElement(selectedElement.id, newDimensions);
    }
  };

  const handleResizeStart = () => {
    setIsResizing(true);
  };

  const handleResizeEnd = () => {
    setIsResizing(false);
  };

  // Preview and Play functions
  const togglePreview = () => {
    setPreviewMode(!previewMode);
    if (previewMode) {
      // Exiting preview mode
      setSelectedElement(null);
    }
  };

  const togglePlay = () => {
    if (isPlaying) {
      // Pause playing
      setIsPlaying(false);
      
      // Pause all tracked audio instances
      activeAudioInstances.forEach(audio => {
        audio.pause();
      });
      
      // Clear the interval but keep current time
      if (window.playbackInterval) {
        clearInterval(window.playbackInterval);
        window.playbackInterval = null;
      }
    } else {
      // Start/resume playing
      setIsPlaying(true);
      
      // Get scene duration
      const duration = template.template_data.scenes[activeScene]?.duration || 5;
      setTotalDuration(duration);
      
      // If we're at the end, restart from beginning
      if (currentTime >= duration) {
        setCurrentTime(0);
      }
      
      // Stop any existing audio instances first
      activeAudioInstances.forEach(audio => {
        audio.pause();
        audio.currentTime = 0;
      });
      
      // Create new audio instances for current scene
      const newAudioInstances = [];
      const audioElements = currentScene.elements.filter(el => el.type === 'audio' && el.src);
      audioElements.forEach(audioElement => {
        const audio = new Audio(audioElement.src);
        audio.volume = audioElement.volume || 1;
        audio.loop = audioElement.loop || false;
        audio.currentTime = currentTime; // Resume from current time
        audio.play().catch(err => {
          console.log('Audio playback failed:', err);
        });
        newAudioInstances.push(audio);
      });
      
      // Track the new audio instances
      setActiveAudioInstances(newAudioInstances);
      
      // Create a timer to simulate video progress
      const interval = setInterval(() => {
        setCurrentTime(prev => {
          if (prev >= duration) {
            clearInterval(interval);
            setIsPlaying(false);
            setCurrentTime(0);
            
            // Stop all tracked audio instances when video ends
            newAudioInstances.forEach(audio => {
              audio.pause();
              audio.currentTime = 0;
            });
            setActiveAudioInstances([]);
            
            return 0;
          }
          return prev + 0.1;
        });
      }, 100);
      
      // Store interval ID to clear it when stopping
      if (window.playbackInterval) {
        clearInterval(window.playbackInterval);
      }
      window.playbackInterval = interval;
    }
  };

  const handleVideoTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleVideoLoadedMetadata = () => {
    if (videoRef.current) {
      setTotalDuration(videoRef.current.duration);
    }
  };

  const handleVideoEnded = () => {
    setIsPlaying(false);
    setCurrentTime(0);
  };

  const resetPlayback = () => {
    setIsPlaying(false);
    setCurrentTime(0);
    
    // Stop and reset all tracked audio instances
    activeAudioInstances.forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    setActiveAudioInstances([]);
    
    // Clear the interval
    if (window.playbackInterval) {
      clearInterval(window.playbackInterval);
      window.playbackInterval = null;
    }
  };

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleRender = async () => {
    console.log('Render button clicked');
    console.log('Template ID:', template.id);
    console.log('Template:', template);
    
    if (!template.id) {
      toast.error('Please save the template first before rendering');
      return;
    }

    setIsRendering(true);
    
    try {
      const renderData = {
        template: template,
        scenes: template.template_data.scenes,
        variables: template.template_data.variables || [],
        aspect_ratio: aspectRatio,
        resolution: getCanvasDimensions()
      };

      console.log('Render data:', renderData);
      console.log('Resolution:', `${getCanvasDimensions().width}x${getCanvasDimensions().height}`);

      const response = await axios.post('/api/renders', {
        template_id: template.id,
        render_data: renderData,
        resolution: `${getCanvasDimensions().width}x${getCanvasDimensions().height}`
      });

      console.log('Render response:', response.data);
      toast.success('Render job created successfully! Check your renders page for progress.');
      
      // Optionally navigate to renders page
      // navigate('/renders');
      
    } catch (error) {
      console.error('Render error:', error);
      console.error('Error response:', error.response?.data);
      toast.error(error.response?.data?.error || 'Failed to start render job');
    } finally {
      setIsRendering(false);
    }
  };

  // Generate preview video data URL
  const generatePreviewVideo = () => {
    // For now, we'll create a simple canvas-based preview
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const { width, height } = getCanvasDimensions();
    
    canvas.width = width;
    canvas.height = height;
    
    // Draw background
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, width, height);
    
    // Draw elements
    currentScene.elements
      .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
      .forEach(element => {
        if (element.type === 'text') {
          ctx.font = `${element.font_size || 24}px ${element.font_family || 'Inter'}`;
          ctx.fillStyle = element.color || '#000000';
          ctx.textAlign = element.alignment || 'center';
          ctx.fillText(element.text || 'Sample Text', element.x + element.width / 2, element.y + element.height / 2);
        } else if (element.type === 'shape') {
          ctx.fillStyle = element.color || '#000000';
          if (element.shape_type === 'circle') {
            ctx.beginPath();
            ctx.arc(element.x + element.width / 2, element.y + element.height / 2, Math.min(element.width, element.height) / 2, 0, 2 * Math.PI);
            ctx.fill();
          } else {
            ctx.fillRect(element.x, element.y, element.width, element.height);
          }
        } else if (element.type === 'image' && element.src) {
          // For images, we'll draw a placeholder with the image URL
          ctx.fillStyle = '#f3f4f6';
          ctx.fillRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = '#6b7280';
          ctx.font = '12px Inter';
          ctx.textAlign = 'center';
          ctx.fillText('Image', element.x + element.width / 2, element.y + element.height / 2);
        } else if (element.type === 'video' && element.src) {
          // For videos, we'll draw a placeholder
          ctx.fillStyle = '#1f2937';
          ctx.fillRect(element.x, element.y, element.width, element.height);
          ctx.fillStyle = '#ffffff';
          ctx.font = '12px Inter';
          ctx.textAlign = 'center';
          ctx.fillText('Video', element.x + element.width / 2, element.y + element.height / 2);
        }
      });
    
    return canvas.toDataURL('image/png');
  };

  const updateElement = useCallback((elementId, updates) => {
    setTemplate(prev => ({
      ...prev,
      template_data: {
        ...prev.template_data,
        scenes: prev.template_data.scenes.map(scene => ({
          ...scene,
          elements: scene.elements.map(element =>
            element.id === elementId ? { ...element, ...updates } : element
          )
        }))
      }
    }));
    
    // Update selectedElement state if it's the element being updated
    if (selectedElement?.id === elementId) {
      setSelectedElement(prev => ({ ...prev, ...updates }));
    }
  }, [selectedElement]);

  const moveElementLayer = (elementId, direction) => {
    const currentScene = template.template_data.scenes[activeScene];
    const currentElement = currentScene.elements.find(el => el.id === elementId);
    if (!currentElement) return;

    const currentZIndex = currentElement.zIndex || 0;
    const newZIndex = direction === 'forward' ? currentZIndex + 1 : Math.max(0, currentZIndex - 1);
    
    updateElement(elementId, { zIndex: newZIndex });
  };

  const deleteElement = (elementId) => {
    setTemplate(prev => ({
      ...prev,
      template_data: {
        ...prev.template_data,
        scenes: prev.template_data.scenes.map(scene => ({
          ...scene,
          elements: scene.elements.filter(element => element.id !== elementId)
        }))
      }
    }));
    if (selectedElement?.id === elementId) {
      setSelectedElement(null);
    }
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const sourceIndex = result.source.index;
    const destinationIndex = result.destination.index;

    if (sourceIndex === destinationIndex) return;

    setTemplate(prev => {
      const currentScene = prev.template_data.scenes[activeScene];
      const elements = [...currentScene.elements];
      const [movedElement] = elements.splice(sourceIndex, 1);
      elements.splice(destinationIndex, 0, movedElement);

      // Update z-index values based on new order
      const updatedElements = elements.map((element, index) => ({
        ...element,
        zIndex: index
      }));

      return {
        ...prev,
        template_data: {
          ...prev.template_data,
          scenes: prev.template_data.scenes.map((scene, index) => 
            index === activeScene 
              ? { ...scene, elements: updatedElements }
              : scene
          )
        }
      };
    });

    // Update selectedElement if it was the moved element
    if (selectedElement) {
      const currentScene = template.template_data.scenes[activeScene];
      const updatedElement = currentScene.elements.find(el => el.id === selectedElement.id);
      if (updatedElement) {
        setSelectedElement(updatedElement);
      }
    }
  };

  const handleMouseDown = (e, element) => {
    if (previewMode) return;
    
    // Check if element is locked
    if (element.locked) {
      console.log('Element is locked, cannot be moved');
      return;
    }
    
    const rect = canvasRef.current.getBoundingClientRect();
    const scale = Math.min(0.8, 800 / canvasDimensions.width, 600 / canvasDimensions.height);
    const x = (e.clientX - rect.left) / scale;
    const y = (e.clientY - rect.top) / scale;
    
    // Store original position for axis locking
    const elementWithOriginal = {
      ...element,
      originalX: element.x,
      originalY: element.y
    };
    
    console.log('Mouse down on element:', element.id, 'at position:', { x: element.x, y: element.y });
    console.log('Canvas dimensions:', canvasDimensions);
    console.log('Center position:', { x: canvasDimensions.width / 2, y: canvasDimensions.height / 2 });
    
    setDraggedElement(elementWithOriginal);
    setDragOffset({
      x: x - element.x,
      y: y - element.y
    });
    setSelectedElement(element);
  };

  const handleMouseMove = useCallback((e) => {
    if (!draggedElement || previewMode) return;
    
    const rect = canvasRef.current.getBoundingClientRect();
    const dimensions = getCanvasDimensions();
    const scale = Math.min(0.8, 800 / dimensions.width, 600 / dimensions.height);
    let x = (e.clientX - rect.left) / scale - dragOffset.x;
    let y = (e.clientY - rect.top) / scale - dragOffset.y;
    
    // Apply center snapping
    const originalX = x;
    const originalY = y;
    x = snapToCenter(x, true);
    y = snapToCenter(y, false);
    
    // Debug center snapping
    if (x !== originalX || y !== originalY) {
      console.log('Center snapping applied:', { originalX, originalY, newX: x, newY: y });
    }
    
    // Apply Shift+drag constraint (lock to X or Y axis based on initial movement)
    if (e.shiftKey && draggedElement.originalX !== undefined && draggedElement.originalY !== undefined) {
      const deltaX = Math.abs(x - draggedElement.originalX);
      const deltaY = Math.abs(y - draggedElement.originalY);
      
      if (deltaX > deltaY) {
        // Lock to X axis (horizontal movement)
        y = draggedElement.originalY;
      } else {
        // Lock to Y axis (vertical movement)
        x = draggedElement.originalX;
      }
    }
    
    // Apply grid snapping
    x = snapToGrid(x);
    y = snapToGrid(y);
    
    // Update draggedElement state for grid lines
    setDraggedElement(prev => ({
      ...prev,
      x: x,
      y: y
    }));
    
    // Simple direct DOM manipulation - no complex logic
    const elementNode = document.querySelector(`[data-element-id="${draggedElement.id}"]`);
    if (elementNode) {
      elementNode.style.transform = `translate(${x}px, ${y}px)`;
    }
  }, [draggedElement, dragOffset, previewMode]);

  const handleMouseUp = useCallback(() => {
    if (draggedElement) {
      // Get final position from DOM transform
      const elementNode = document.querySelector(`[data-element-id="${draggedElement.id}"]`);
      if (elementNode) {
        const transform = elementNode.style.transform;
        const match = transform.match(/translate\(([^,]+)px,\s*([^)]+)px\)/);
        if (match) {
          const finalX = parseFloat(match[1]);
          const finalY = parseFloat(match[2]);
          // Commit final position to React state
          updateElement(draggedElement.id, { x: finalX, y: finalY });
        }
      }
    }
    
    setDraggedElement(null);
  }, [draggedElement, updateElement]);

  // Reset transform after React state update
  useEffect(() => {
    if (!draggedElement) {
      // Don't reset transforms - let React handle positioning naturally
      // The transform will be overridden by React's style prop anyway
    }
  }, [draggedElement]);

  // Inline text editing functions
  const handleTextDoubleClick = (element) => {
    if (element.type === 'text' && !previewMode) {
      setEditingText(element);
    }
  };

  const handleTextSave = (newText) => {
    if (editingText) {
      updateElement(editingText.id, { text: newText });
      setEditingText(null);
    }
  };

  const handleTextCancel = () => {
    setEditingText(null);
  };

  // Copy, Paste, Duplicate functions
  const handleCopy = (element) => {
    const elementToCopy = element || selectedElement;
    if (elementToCopy) {
      setClipboard({
        ...elementToCopy,
        id: `temp_${Date.now()}`,
        x: elementToCopy.x + 20,
        y: elementToCopy.y + 20
      });
    }
  };

  const handlePaste = () => {
    if (clipboard && currentScene) {
      const newElement = {
        ...clipboard,
        id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        x: clipboard.x + 20,
        y: clipboard.y + 20
      };
      
      const updatedElements = [...currentScene.elements, newElement];
      setTemplate(prev => ({
        ...prev,
        template_data: {
          ...prev.template_data,
          scenes: prev.template_data.scenes.map((scene, index) => 
            index === activeScene ? { ...scene, elements: updatedElements } : scene
          )
        }
      }));
      setSelectedElement(newElement);
    }
  };

  const handleDuplicate = (element) => {
    const elementToDuplicate = element || selectedElement;
    if (elementToDuplicate && currentScene) {
      const duplicatedElement = {
        ...elementToDuplicate,
        id: `element_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        x: elementToDuplicate.x + 20,
        y: elementToDuplicate.y + 20,
        name: elementToDuplicate.name ? `${elementToDuplicate.name} (Copy)` : elementToDuplicate.name
      };
      
      const updatedElements = [...currentScene.elements, duplicatedElement];
      setTemplate(prev => ({
        ...prev,
        template_data: {
          ...prev.template_data,
          scenes: prev.template_data.scenes.map((scene, index) => 
            index === activeScene ? { ...scene, elements: updatedElements } : scene
          )
        }
      }));
      setSelectedElement(duplicatedElement);
    }
  };

  // Context menu functions
  const handleContextMenu = (e, element) => {
    e.preventDefault();
    setContextMenu({
      isVisible: true,
      position: { x: e.clientX, y: e.clientY },
      element: element
    });
  };

  const handleContextMenuClose = () => {
    setContextMenu({ isVisible: false, position: { x: 0, y: 0 }, element: null });
  };

  const handleElementReorder = (sourceIndex, destinationIndex) => {
    if (currentScene) {
      const updatedElements = [...currentScene.elements];
      const [movedElement] = updatedElements.splice(sourceIndex, 1);
      updatedElements.splice(destinationIndex, 0, movedElement);
      
      // Update z-index based on new order
      const elementsWithZIndex = updatedElements.map((element, index) => ({
        ...element,
        zIndex: index
      }));
      
      setTemplate(prev => ({
        ...prev,
        template_data: {
          ...prev.template_data,
          scenes: prev.template_data.scenes.map((scene, index) => 
            index === activeScene ? { ...scene, elements: elementsWithZIndex } : scene
          )
        }
      }));
    }
  };

  useEffect(() => {
    if (draggedElement) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggedElement, handleMouseMove, handleMouseUp]);

  // Keep selectedElement in sync with template data
  useEffect(() => {
    if (selectedElement) {
      const currentScene = template.template_data.scenes[activeScene];
      const updatedElement = currentScene.elements.find(el => el.id === selectedElement.id);
      if (updatedElement && JSON.stringify(updatedElement) !== JSON.stringify(selectedElement)) {
        setSelectedElement(updatedElement);
      }
    }
  }, [template.template_data.scenes, activeScene, selectedElement]);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Prevent shortcuts when typing in input fields
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
        return;
      }

      switch (e.key) {
        case 'Shift':
          setFineGrid(true);
          break;
        case ' ':
          e.preventDefault();
          togglePlay();
          break;
        case 'Delete':
        case 'Backspace':
          e.preventDefault();
          if (selectedElement && !selectedElement.locked) {
            deleteElement(selectedElement.id);
            setSelectedElement(null);
            toast.success('Element deleted');
          } else if (selectedElement && selectedElement.locked) {
            toast.error('Cannot delete locked element');
          }
          break;
        case 'Escape':
          e.preventDefault();
          setSelectedElement(null);
          setPreviewMode(false);
          break;
        case 'Enter':
          e.preventDefault();
          if (selectedElement) {
            if (selectedElement.type === 'text') {
              // Start inline text editing
              setEditingText(selectedElement);
            } else {
              // Focus on the first editable property
              const firstInput = document.querySelector('[data-element-property]');
              if (firstInput) {
                firstInput.focus();
              }
            }
          }
          break;
        case 's':
        case 'S':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handleSave();
          }
          break;
        case 'p':
        case 'P':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            togglePreview();
          }
          break;
        case 'g':
        case 'G':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowGrid(!showGrid);
          }
          break;
        case 'ArrowUp':
          if (selectedElement && !selectedElement.locked) {
            e.preventDefault();
            if (e.ctrlKey || e.metaKey) {
              moveElementLayer(selectedElement.id, 'forward');
            } else {
              // Move element up
              const newY = snapToGrid(selectedElement.y - (e.shiftKey ? 10 : 1));
              updateElement(selectedElement.id, { y: newY });
            }
          }
          break;
        case 'ArrowDown':
          if (selectedElement && !selectedElement.locked) {
            e.preventDefault();
            if (e.ctrlKey || e.metaKey) {
              moveElementLayer(selectedElement.id, 'back');
            } else {
              // Move element down
              const newY = snapToGrid(selectedElement.y + (e.shiftKey ? 10 : 1));
              updateElement(selectedElement.id, { y: newY });
            }
          }
          break;
        case 'ArrowLeft':
          if (selectedElement && !selectedElement.locked) {
            e.preventDefault();
            // Move element left
            const newX = snapToGrid(selectedElement.x - (e.shiftKey ? 10 : 1));
            updateElement(selectedElement.id, { x: newX });
          }
          break;
        case 'ArrowRight':
          if (selectedElement && !selectedElement.locked) {
            e.preventDefault();
            // Move element right
            const newX = snapToGrid(selectedElement.x + (e.shiftKey ? 10 : 1));
            updateElement(selectedElement.id, { x: newX });
          }
          break;
        case 'c':
        case 'C':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (selectedElement && !selectedElement.locked) {
              handleCopy();
            } else if (selectedElement && selectedElement.locked) {
              toast.error('Cannot copy locked element');
            }
          }
          break;
        case 'v':
        case 'V':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            handlePaste();
          }
          break;
        case 'd':
        case 'D':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            if (selectedElement && !selectedElement.locked) {
              handleDuplicate();
            } else if (selectedElement && selectedElement.locked) {
              toast.error('Cannot duplicate locked element');
            }
          }
          break;
      }
    };

    const handleKeyUp = (e) => {
      if (e.key === 'Shift') {
        setFineGrid(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [selectedElement, showGrid, previewMode]);



  // Show loading while checking authentication
  if (authLoading) {
      return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" style={{ animationDelay: '0.2s' }}></div>
        </div>
        </div>
      );
    }

  // Show login prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="space-y-8 animate-fade-in-up pb-8">
        <div className="flex items-center justify-between pt-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <h1 className="text-3xl font-bold bg-gradient-to-r from-gray-900 via-indigo-800 to-purple-800 bg-clip-text text-transparent">
                Template Editor
              </h1>
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-full flex items-center justify-center">
                <Edit className="w-4 h-4 text-white" />
          </div>
              </div>
            <p className="text-lg text-gray-600 max-w-2xl">
              Please log in to create and edit video templates.
            </p>
              </div>
          <Link
            to="/login"
            className="btn btn-primary btn-lg group hover-lift px-8 py-4"
          >
            <LogIn className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
            Sign In
          </Link>
            </div>

        <div className="card hover-lift animate-fade-in-up">
          <div className="card-content p-12 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-3xl flex items-center justify-center mx-auto mb-8">
              <Edit className="w-12 h-12 text-indigo-600" />
              </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Sign in to Edit Templates</h2>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Create, edit, and manage your video templates with our powerful visual editor.
            </p>
            <div className="space-y-4">
              <Link
                to="/login"
                className="btn btn-primary btn-lg group hover-lift px-10 py-4"
              >
                <LogIn className="w-5 h-5 mr-3 group-hover:scale-110 transition-transform duration-300" />
                Sign In to Editor
              </Link>
              <div className="text-sm text-gray-500">
                Don't have an account?{' '}
                <Link to="/login" className="text-indigo-600 hover:text-indigo-700 font-medium">
                  Create one here
                </Link>
                          </div>
          </div>
        </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card hover-lift text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Layers className="w-8 h-8 text-white" />
              </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Visual Editor</h3>
            <p className="text-gray-600 text-sm">Drag and drop interface for creating video templates</p>
              </div>
          <div className="card hover-lift text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Plus className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Add Elements</h3>
            <p className="text-gray-600 text-sm">Add text, images, shapes, and audio to your templates</p>
              </div>
          <div className="card hover-lift text-center p-6">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <Save className="w-8 h-8 text-white" />
              </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Save & Export</h3>
            <p className="text-gray-600 text-sm">Save your templates and export them for rendering</p>
            </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin"></div>
          <div className="absolute inset-0 w-16 h-16 border-4 border-purple-200 border-t-purple-600 rounded-full animate-spin" style={{ animationDelay: '0.2s' }}></div>
        </div>
      </div>
    );
  }

  const currentScene = template.template_data.scenes[activeScene];
  const canvasDimensions = getCanvasDimensions();

  return (
    <div className="h-full flex flex-col overflow-hidden">
      {/* Enhanced Header */}
      <div className="bg-white border-b border-gray-200 px-6 py-4 flex-shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button
              onClick={() => navigate('/templates')}
              className="text-gray-500 hover:text-gray-700 flex items-center"
            >
              <ChevronLeft className="w-4 h-4 mr-1" />
              Back to Templates
            </button>
            <div className="flex items-center space-x-3">
            <input
              type="text"
              value={template.name}
              onChange={(e) => setTemplate(prev => ({ ...prev, name: e.target.value }))}
                className="text-xl font-semibold bg-transparent border-none focus:outline-none focus:ring-0"
                placeholder="Template Name"
              />
              <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Aspect Ratio:</label>
                <select
                  value={aspectRatio}
                  onChange={(e) => setAspectRatio(e.target.value)}
                  className="text-sm border border-gray-300 rounded px-2 py-1"
                >
                  {aspectRatios.map(ratio => (
                    <option key={ratio.value} value={ratio.value}>
                      {ratio.label}
                    </option>
                  ))}
                </select>
          </div>
          <div className="flex items-center space-x-2">
                <label className="text-sm text-gray-600">Total Duration:</label>
                <span className="text-sm font-medium text-indigo-600">
                  {template.template_data.scenes.reduce((total, scene) => total + (scene.duration || 5), 0)}s
                </span>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowShortcuts(!showShortcuts)}
              className={`p-2 rounded ${showShortcuts ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-600'}`}
              title="Keyboard Shortcuts"
            >
              <Settings className="w-4 h-4" />
            </button>
            <button
              onClick={() => setShowGrid(!showGrid)}
              className={`p-2 rounded ${showGrid ? 'bg-indigo-100 text-indigo-600' : 'bg-gray-100 text-gray-600'}`}
              title="Toggle Grid"
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setPreviewMode(!previewMode)}
              className={`p-2 rounded ${previewMode ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'}`}
              title="Preview Mode"
            >
              <Eye className="w-4 h-4" />
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="btn btn-primary px-6 py-2"
            >
              {saving ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
              <Save className="w-4 h-4 mr-2" />
                  Save
                </>
              )}
            </button>
            <button 
              onClick={togglePreview}
              className={`btn px-6 py-2 ${previewMode ? 'btn-success' : 'btn-outline'}`}
            >
              <Eye className="w-4 h-4 mr-2" />
              {previewMode ? 'Exit Preview' : 'Preview'}
            </button>

          </div>
          </div>
        </div>

      {/* Keyboard Shortcuts Help Panel */}
      {showShortcuts && (
        <div className="bg-blue-50 border-b border-blue-200 px-6 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Playback</h4>
              <div className="space-y-1 text-blue-700">
                <div><kbd className="bg-blue-200 px-1 rounded">Space</kbd> Play/Pause</div>
                <div><kbd className="bg-blue-200 px-1 rounded">Esc</kbd> Exit Preview</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Elements</h4>
              <div className="space-y-1 text-blue-700">
                <div><kbd className="bg-blue-200 px-1 rounded">Delete</kbd> Delete Element</div>
                <div><kbd className="bg-blue-200 px-1 rounded">Enter</kbd> Edit Text Inline</div>
                <div><kbd className="bg-blue-200 px-1 rounded">Double Click</kbd> Edit Text</div>
                <div><kbd className="bg-blue-200 px-1 rounded">Ctrl+↑/↓</kbd> Move Layer</div>
                <div><kbd className="bg-blue-200 px-1 rounded">Ctrl+C</kbd> Copy Element</div>
                <div><kbd className="bg-blue-200 px-1 rounded">Ctrl+V</kbd> Paste Element</div>
                <div><kbd className="bg-blue-200 px-1 rounded">Ctrl+D</kbd> Duplicate Element</div>
                <div><kbd className="bg-blue-200 px-1 rounded">Right Click</kbd> Context Menu</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">Grid & Snap</h4>
              <div className="space-y-1 text-blue-700">
                <div><kbd className="bg-blue-200 px-1 rounded">Shift</kbd> Fine Grid</div>
                <div><kbd className="bg-blue-200 px-1 rounded">Ctrl+G</kbd> Toggle Grid</div>
              </div>
            </div>
            <div>
              <h4 className="font-semibold text-blue-900 mb-2">File</h4>
              <div className="space-y-1 text-blue-700">
                <div><kbd className="bg-blue-200 px-1 rounded">Ctrl+S</kbd> Save</div>
                <div><kbd className="bg-blue-200 px-1 rounded">Ctrl+P</kbd> Preview</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
        <div className="flex-1 flex overflow-hidden" style={{ minWidth: 0, maxWidth: '100vw', overflowX: 'hidden' }}>
        {/* Left Sidebar - Scenes, Variables, Elements */}
        <ResizableSidebar
          side="left"
          minWidth={250}
          maxWidth={500}
          defaultWidth={500}
          onResize={setLeftSidebarWidth}
          className="bg-gray-50 border-r border-gray-200 flex flex-col flex-shrink-0 max-h-screen"
          data-side="left"
        >
          {/* Tabs */}
          <div className="flex border-b border-gray-200 flex-shrink-0">
            <button
              onClick={() => setActiveTab('preview')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'preview'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                activeTab === 'code'
                  ? 'text-indigo-600 border-b-2 border-indigo-600 bg-white'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <Code className="w-4 h-4 mr-2" />
              Code
            </button>
          </div>

          {/* Tab Content */}
          <div className="flex-1 overflow-y-auto">
            {activeTab === 'preview' ? (
              <div className="p-4 space-y-6">
                {/* Scenes Panel */}
            <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Scenes</h3>
                    <button
                      onClick={addScene}
                      className="p-1 text-indigo-600 hover:text-indigo-700"
                      title="Add Scene"
                    >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
                  <div className="space-y-2">
                    {template.template_data.scenes.map((scene, index) => (
                      <div
                        key={scene.id}
                        onClick={() => setActiveScene(index)}
                        className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                          activeScene === index
                            ? 'border-indigo-300 bg-indigo-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <Film className="w-4 h-4 text-gray-600 mr-2" />
                            <span className="text-sm font-medium">{scene.name}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <div className="flex items-center space-x-1">
                              <input
                                type="number"
                                min="1"
                                max="60"
                                value={scene.duration || 5}
                                onChange={(e) => {
                                  e.stopPropagation();
                                  updateSceneDuration(index, parseInt(e.target.value) || 5);
                                }}
                                onClick={(e) => e.stopPropagation()}
                                className="w-12 text-xs text-center border border-gray-300 rounded px-1 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                              />
                              <span className="text-xs text-gray-500">s</span>
                            </div>
                            {template.template_data.scenes.length > 1 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  deleteScene(index);
                                }}
                                className="text-red-500 hover:text-red-700"
                                title="Delete Scene"
                              >
                      <Trash2 className="w-3 h-3" />
                    </button>
                            )}
                          </div>
                        </div>
                  </div>
                ))}
              </div>
            </div>

                {/* Variables Panel */}
            <div>
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-sm font-semibold text-gray-900">Variables</h3>
                    <button
                      onClick={addVariable}
                      className="p-1 text-indigo-600 hover:text-indigo-700"
                      title="Add Variable"
                    >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
                  <div className="space-y-2">
                    {template.template_data.variables.map((variable) => (
                      <div
                        key={variable.id}
                        className="p-3 rounded-lg border border-gray-200"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center">
                            <Variable className="w-4 h-4 text-gray-600 mr-2" />
                            <span className="text-sm font-medium">{variable.name}</span>
                    </div>
                          <span className="text-xs text-gray-500">{variable.type}</span>
                        </div>
                        <input
                          type="text"
                          value={variable.default_value}
                          onChange={(e) => {
                            setTemplate(prev => ({
                              ...prev,
                              template_data: {
                                ...prev.template_data,
                                variables: prev.template_data.variables.map(v =>
                                  v.id === variable.id ? { ...v, default_value: e.target.value } : v
                                )
                              }
                            }));
                          }}
                          className="input text-xs"
                          placeholder="Default value"
                        />
                  </div>
                ))}
              </div>
            </div>

                {/* Elements Panel */}
            <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Add Elements</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => addElement('text')}
                      className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <Type className="w-5 h-5 text-gray-600 mr-2" />
                      <span className="text-sm">Text</span>
                  </button>
                    <button
                      onClick={() => addElement('image')}
                      className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <Image className="w-5 h-5 text-gray-600 mr-2" />
                      <span className="text-sm">Image</span>
                    </button>
                    <button
                      onClick={() => addElement('video')}
                      className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <Video className="w-5 h-5 text-gray-600 mr-2" />
                      <span className="text-sm">Video</span>
                    </button>
                    <button
                      onClick={() => addElement('shape')}
                      className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <Square className="w-5 h-5 text-gray-600 mr-2" />
                      <span className="text-sm">Shape</span>
                    </button>
                    <button
                      onClick={() => addElement('audio')}
                      className="flex items-center p-3 rounded-lg border border-gray-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors"
                    >
                      <Music className="w-5 h-5 text-gray-600 mr-2" />
                      <span className="text-sm">Audio</span>
                    </button>
                </div>
              </div>

                {/* Elements List */}
                <div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Elements</h3>
                  {currentScene && currentScene.elements && (
                    <DraggableElementList
                      elements={currentScene.elements}
                      onReorder={handleElementReorder}
                      onSelect={setSelectedElement}
                      selectedElement={selectedElement}
                      onDuplicate={handleDuplicate}
                      onDelete={deleteElement}
                      onBringToFront={(element) => moveElementLayer(element.id, 'forward')}
                      onSendToBack={(element) => moveElementLayer(element.id, 'back')}
                    />
                  )}
                  {(!currentScene || !currentScene.elements || currentScene.elements.length === 0) && (
                    <div className="text-center py-8 text-gray-500">
                      <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                        <Plus className="w-6 h-6 text-gray-400" />
            </div>
                      <p className="text-sm">No elements yet</p>
                      <p className="text-xs text-gray-400 mt-1">Add elements using the buttons above</p>
          </div>
                  )}
        </div>


              </div>
            ) : (
              <div className="p-4">
              <SyntaxHighlighter
                language="json"
                style={tomorrow}
                  customStyle={{ margin: 0, fontSize: '12px' }}
              >
                {JSON.stringify(template.template_data, null, 2)}
              </SyntaxHighlighter>
            </div>
          )}
            </div>
        </ResizableSidebar>

        {/* Center Canvas Area */}
        <div className="flex-1 flex flex-col overflow-hidden" style={{ minWidth: 0 }}>
          {/* Enhanced Canvas */}
          <div className="flex-1 bg-gray-100 flex items-center justify-center overflow-auto relative">

          
          {/* Center Grid Lines - Only show when elements are near center */}
          {draggedElement && (
            <div className="absolute inset-0 pointer-events-none z-10">
              {/* Vertical center line - show when element is near vertical center */}
              {Math.abs(draggedElement.x - canvasDimensions.width / 2) < 30 && (
                <div 
                  className="absolute top-0 bottom-0 w-1 bg-blue-500 opacity-75"
                  style={{ left: '50%', transform: 'translateX(-50%)' }}
                />
              )}
              {/* Horizontal center line - show when element is near horizontal center */}
              {Math.abs(draggedElement.y - canvasDimensions.height / 2) < 30 && (
                <div 
                  className="absolute left-0 right-0 h-1 bg-blue-500 opacity-75"
                  style={{ top: '50%', transform: 'translateY(-50%)' }}
                />
              )}
            </div>
          )}
          {/* Grid Overlay */}
          {showGrid && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(0,0,0,0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(0,0,0,0.1) 1px, transparent 1px)
                `,
                backgroundSize: `${fineGrid ? 5 : gridSize}px ${fineGrid ? 5 : gridSize}px`
              }}
            />
          )}
          
          {/* Canvas Container with Scaling */}
          <div
            className="relative"
            style={{
              transform: `scale(${Math.min(0.8, 800 / canvasDimensions.width, 600 / canvasDimensions.height)})`,
              transformOrigin: 'center center',
              margin: '20px'
            }}
          >

            

            
            {/* Inline Text Editor */}
            {editingText && (
              <InlineTextEditor
                element={editingText}
                onSave={handleTextSave}
                onCancel={handleTextCancel}
                isVisible={true}
              />
            )}
            
            {/* Context Menu */}
            <ContextMenu
              isVisible={contextMenu.isVisible}
              position={contextMenu.position}
              onClose={handleContextMenuClose}
              onCopy={() => handleCopy(contextMenu.element)}
              onPaste={handlePaste}
              onDuplicate={() => handleDuplicate(contextMenu.element)}
              onDelete={() => {
                if (contextMenu.element) {
                  deleteElement(contextMenu.element.id);
                  setSelectedElement(null);
                }
              }}
              onBringToFront={() => {
                if (contextMenu.element) {
                  moveElementLayer(contextMenu.element.id, 'forward');
                }
              }}
              onSendToBack={() => {
                if (contextMenu.element) {
                  moveElementLayer(contextMenu.element.id, 'back');
                }
              }}
              canPaste={!!clipboard}
              elementType={contextMenu.element?.type}
              locked={contextMenu.element?.locked || false}
            />
            <div
              ref={canvasRef}
              className="bg-white shadow-lg rounded-lg overflow-hidden relative"
              style={{
                width: canvasDimensions.width,
                height: canvasDimensions.height,
                cursor: previewMode ? 'default' : 'crosshair',
                userSelect: 'none',
                WebkitUserSelect: 'none',
                MozUserSelect: 'none',
                msUserSelect: 'none'
              }}
            >
            {/* Scene Elements - Sorted by Z-Index for proper layering */}
            {currentScene.elements
              .sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0))
              .map((element) => (
              <div
                key={element.id}
                data-element-id={element.id}
                onMouseDown={(e) => handleMouseDown(e, element)}
                onContextMenu={(e) => handleContextMenu(e, element)}
                className={`absolute ${
                  element.locked 
                    ? 'cursor-not-allowed' 
                    : previewMode 
                      ? 'cursor-default' 
                      : 'cursor-move hover:ring-2 hover:ring-gray-300'
                }`}
                style={{
                  left: 0,
                  top: 0,
                  width: element.width,
                  height: element.height,
                  position: 'absolute',
                  zIndex: element.zIndex || 0,
                  opacity: element.opacity || 1.0,
                  transform: `translate(${element.x}px, ${element.y}px)`,
                  userSelect: 'none',
                  WebkitUserSelect: 'none',
                  MozUserSelect: 'none',
                  msUserSelect: 'none'
                }}
              >
                {/* Resize Handles for selected elements */}
                {selectedElement?.id === element.id && !previewMode && element.type !== 'audio' && (
                  <>
                    {/* Text elements get both font size handles (green) and box size handles (blue) */}
                    {element.type === 'text' && (
                      <>
                        <TextResizeHandles
                          element={element}
                          onResize={handleResize}
                          onResizeStart={handleResizeStart}
                          onResizeEnd={handleResizeEnd}
                          gridSize={gridSize}
                          updateElement={updateElement}
                        />
                        <ResizeHandles
                          element={element}
                          onResize={handleResize}
                          onResizeStart={handleResizeStart}
                          onResizeEnd={handleResizeEnd}
                          gridSize={gridSize}
                        />
                      </>
                    )}
                    {/* Other elements get only box size handles */}
                    {element.type !== 'text' && (
                      <ResizeHandles
                        element={element}
                        onResize={handleResize}
                        onResizeStart={handleResizeStart}
                        onResizeEnd={handleResizeEnd}
                        gridSize={gridSize}
                      />
                    )}
                  </>
                )}

                {/* Lock Icon Overlay */}
                {element.locked && (
                  <div
                    className="absolute top-2 right-2 bg-red-500 text-white p-1 rounded-full shadow-lg z-50"
                    title="Element is locked"
                  >
                    <Lock className="w-4 h-4" />
                  </div>
                )}

                {element.type === 'text' && (
                  <div
                    className="w-full h-full relative"
                    onDoubleClick={() => handleTextDoubleClick(element)}
                    style={{
                      outline: selectedElement?.id === element.id ? '4px solid #3b82f6' : 'none',
                      outlineOffset: '2px',
                      userSelect: 'none',
                      WebkitUserSelect: 'none',
                      MozUserSelect: 'none',
                      msUserSelect: 'none',
                      border: element.border_width && element.border_width > 0 ? `${element.border_width}px solid ${element.border_color || '#000000'}` : 'none',
                      borderRadius: element.border_radius || 0,
                      boxShadow: element.shadow && element.shadow.trim() !== '' ? element.shadow : 'none',
                      display: 'flex',
                      alignItems: 'stretch',
                      justifyContent: element.alignment === 'left' ? 'flex-start' : 
                                     element.alignment === 'right' ? 'flex-end' : 'center',
                      padding: element.padding || 0
                    }}
                    title={`Vertical: ${element.verticalAlignment || 'default'}, Horizontal: ${element.alignment || 'default'}`}
                  >
                    {/* Cursor zones for resize areas */}
                    {selectedElement?.id === element.id && !previewMode && (
                      <>
                        {/* Top edge cursor zone */}
                        <div
                          style={{
                            position: 'absolute',
                            top: '-15px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '60px',
                            height: '16px',
                            cursor: 'n-resize',
                            zIndex: 999
                          }}
                          title="Resize from top"
                        />
                        {/* Bottom edge cursor zone */}
                        <div
                          style={{
                            position: 'absolute',
                            bottom: '-15px',
                            left: '50%',
                            transform: 'translateX(-50%)',
                            width: '60px',
                            height: '16px',
                            cursor: 's-resize',
                            zIndex: 999
                          }}
                          title="Resize from bottom"
                        />
                        {/* Left edge cursor zone */}
                        <div
                          style={{
                            position: 'absolute',
                            left: '-15px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '16px',
                            height: '60px',
                            cursor: 'w-resize',
                            zIndex: 999
                          }}
                          title="Resize from left"
                        />
                        {/* Right edge cursor zone */}
                        <div
                          style={{
                            position: 'absolute',
                            right: '-15px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            width: '16px',
                            height: '60px',
                            cursor: 'e-resize',
                            zIndex: 999
                          }}
                          title="Resize from right"
                        />
                      </>
                    )}
                    <div
                      style={{
                        fontSize: element.font_size || 24,
                        fontFamily: element.font_family || 'Inter',
                        color: element.color || '#000000',
                        backgroundColor: element.background_color || 'transparent',
                        fontWeight: element.bold ? 'bold' : 'normal',
                        fontStyle: element.italic ? 'italic' : 'normal',
                        textDecoration: element.underline ? 'underline' : 'none',
                        textAlign: element.alignment || 'center',
                        padding: 0,
                        margin: 0,
                        width: '100%',
                        height: '100%',
                        wordWrap: 'break-word',
                        overflowWrap: 'break-word',
                        whiteSpace: 'pre-wrap',
                        userSelect: 'none',
                        WebkitUserSelect: 'none',
                        MozUserSelect: 'none',
                        msUserSelect: 'none',
                        textShadow: element.text_shadow ? 
                          `${element.text_shadow.x || 0}px ${element.text_shadow.y || 0}px ${element.text_shadow.blur || 0}px ${element.text_shadow.color || '#000000'}` : 
                          'none',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: (() => {
                          const alignment = element.verticalAlignment || 'middle';
                          console.log(`Element ${element.id} vertical alignment:`, alignment);
                          return alignment === 'top' ? 'flex-start' : 
                                 alignment === 'bottom' ? 'flex-end' : 'center';
                        })()
                      }}
                    >
                      <div style={{ width: '100%' }}>
                        {element.text || 'Sample Text'}
                      </div>
                    </div>
                  </div>
                )}
                {element.type === 'image' && (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    {element.src ? (
                      <img
                        src={element.src}
                        alt={element.alt}
                        className="w-full h-full"
                        style={{ objectFit: element.objectFit || 'cover' }}
                        onError={(e) => {
                          console.error('Image failed to load:', element.src);
                          e.target.style.display = 'none';
                        }}
                        onLoad={() => {
                          console.log('Image loaded successfully:', element.src);
                        }}
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <Image className="w-8 h-8 mx-auto mb-2" />
                        <span className="text-xs">No image (src: {element.src || 'undefined'})</span>
                      </div>
                    )}
                  </div>
                )}
                {element.type === 'video' && (
                  <div className="w-full h-full bg-gray-200 flex items-center justify-center">
                    {element.src ? (
                      <video
                        src={element.src}
                        className="w-full h-full"
                        style={{ objectFit: element.objectFit || 'cover' }}
                        autoPlay={element.autoplay}
                        loop={element.loop}
                        muted={element.muted}
                        controls
                      />
                    ) : (
                      <div className="text-center text-gray-500">
                        <Video className="w-8 h-8 mx-auto mb-2" />
                        <span className="text-xs">No video</span>
                      </div>
                    )}
                  </div>
                )}
                {element.type === 'shape' && (
                  <div
                    className="w-full h-full"
                    style={{
                      backgroundColor: element.color,
                      border: `${element.border_width}px solid ${element.border_color}`,
                      borderRadius: element.shape_type === 'circle' ? '50%' : element.border_radius,
                      clipPath: element.shape_type === 'triangle' ? 'polygon(50% 0%, 0% 100%, 100% 100%)' : 'none'
                    }}
                  />
                )}
                {element.type === 'audio' && (
                  <div className="w-full h-full bg-transparent flex items-center justify-center">
                    {element.src ? (
                      <div className="text-center text-gray-400 opacity-50">
                        <Volume2 className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-xs">Audio (Background)</span>
                      </div>
                    ) : (
                      <div className="text-center text-gray-400 opacity-50">
                        <Music className="w-4 h-4 mx-auto mb-1" />
                        <span className="text-xs">No audio</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
            </div>
          </div>

          {/* Canvas Info */}
          <div className="absolute bottom-4 left-4 bg-white bg-opacity-90 rounded-lg px-3 py-2 text-sm text-gray-600">
            {canvasDimensions.width} × {canvasDimensions.height} ({aspectRatio})
          </div>

          {/* Resize Info */}
          {isResizing && selectedElement && (
            <div className="absolute top-4 left-4 bg-indigo-600 text-white rounded-lg px-3 py-2 text-sm font-medium">
              {selectedElement.width} × {selectedElement.height}
            </div>
          )}

          {/* Fine Grid Indicator */}
          {fineGrid && (
            <div className="absolute top-4 right-4 bg-yellow-500 text-white rounded-lg px-3 py-2 text-sm font-medium">
              Fine Grid (5px) - Hold Shift
            </div>
          )}
        </div>
        
        {/* Playback Controls and Render Button - Directly under canvas */}
        <div className="w-full bg-gray-100 border-t border-gray-300 p-4">
          <div className="flex items-center justify-between">
            {/* Left side - Play controls */}
            <div className="flex items-center space-x-4">
              <button
                onClick={togglePlay}
                className="flex items-center justify-center w-10 h-10 bg-black hover:bg-gray-800 rounded-full text-white transition-colors"
              >
                {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
              </button>
              
              <button
                onClick={resetPlayback}
                className="flex items-center justify-center w-8 h-8 bg-gray-500 hover:bg-gray-600 rounded text-white transition-colors"
                title="Reset to beginning"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              
              {/* Timeline */}
              <div className="flex items-center space-x-2">
                <div className="w-32 bg-gray-300 rounded-full h-1 relative">
                  <div 
                    className="bg-blue-500 h-1 rounded-full transition-all duration-100 absolute top-0 left-0"
                    style={{ width: `${(currentTime / totalDuration) * 100}%` }}
                  ></div>
                  <div 
                    className="w-3 h-3 bg-blue-500 rounded-full absolute top-0 transform -translate-y-1 -translate-x-1.5"
                    style={{ left: `${(currentTime / totalDuration) * 100}%` }}
                  ></div>
                </div>
                <span className="text-sm text-gray-600">
                  Timecode: {formatTime(currentTime)} | Movie duration: {formatTime(totalDuration)}
                </span>
              </div>
            </div>
            
            {/* Right side - Render button */}
            <button
              onClick={handleRender}
              disabled={isRendering}
              className={`flex items-center space-x-2 px-6 py-3 border rounded-lg transition-colors ${
                isRendering 
                  ? 'bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white border-blue-600'
              }`}
            >
              {isRendering ? (
                <>
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                  <span className="font-medium">RENDERING...</span>
                </>
              ) : (
                <>
                  <Film className="w-5 h-5" />
                  <span className="font-medium">RENDER MOVIE</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Right Sidebar - Element Properties */}
      <ResizableSidebar
        side="right"
        minWidth={300}
        maxWidth={500}
        defaultWidth={500}
        onResize={setRightSidebarWidth}
        className="bg-white border-l border-gray-200 flex flex-col flex-shrink-0 max-h-screen"
        data-side="right"
      >
        <div className="p-4 border-b border-gray-200">
          <h3 className="text-sm font-semibold text-gray-900">Properties</h3>
          {selectedElement ? (
            <p className="text-xs text-gray-500 mt-1">{selectedElement.type} element</p>
          ) : (
            <p className="text-xs text-gray-500 mt-1">No element selected</p>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4" style={{ overflowX: 'hidden' }}>
          {selectedElement ? (
            <ElementProperties 
              selectedElement={selectedElement} 
              updateElement={updateElement} 
            />
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-gray-500">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Settings className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-700 mb-2">No Element Selected</h3>
              <p className="text-sm text-gray-500 max-w-xs">
                Select an element on the canvas to view and edit its properties
              </p>
            </div>
          )}
        </div>
      </ResizableSidebar>
    </div>

    {/* Media Modal */}
    <MediaModal
      isOpen={mediaModal.isOpen}
      onClose={() => setMediaModal({ isOpen: false, type: null })}
      onConfirm={handleMediaConfirm}
      elementType={mediaModal.type}
      canvasDimensions={getCanvasDimensions()}
    />
  </div>
);
};

export default TemplateEditor; 