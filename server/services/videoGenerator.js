const { spawn } = require('child_process');
const fs = require('fs').promises;
const path = require('path');
const https = require('https');

class VideoGenerator {
  constructor() {
    this.uploadsDir = path.join(__dirname, '../../uploads/videos');
    this.fontsDir = path.join(__dirname, '../../uploads/fonts');
    this.ensureUploadsDir();
    this.ensureFontsDir();
  }

  async ensureUploadsDir() {
    try {
      await fs.mkdir(this.uploadsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating uploads directory:', error);
    }
  }

  async ensureFontsDir() {
    try {
      await fs.mkdir(this.fontsDir, { recursive: true });
    } catch (error) {
      console.error('Error creating fonts directory:', error);
    }
  }

  async downloadGoogleFont(fontName) {
    const fontPath = path.join(this.fontsDir, `${fontName.replace(/\s+/g, '_')}.ttf`);
    
    // Check if font already exists
    try {
      await fs.access(fontPath);
      console.log(`Font already exists: ${fontPath}`);
      return fontPath;
    } catch (error) {
      // Font doesn't exist, download it
    }

    try {
      console.log(`Downloading Google Font: ${fontName}`);
      
      // Use Google Fonts CSS API to get the font URL
      const cssUrl = `https://fonts.googleapis.com/css2?family=${fontName.replace(/\s+/g, '+')}:wght@400&display=swap`;
      
      const cssResponse = await this.fetchUrl(cssUrl);
      const cssContent = cssResponse.toString();
      
      // Extract font URL from CSS
      const fontUrlMatch = cssContent.match(/src:\s*url\(([^)]+)\)/);
      if (!fontUrlMatch) {
        throw new Error('Could not extract font URL from CSS');
      }
      
      const fontUrl = fontUrlMatch[1].replace(/['"]/g, '');
      console.log(`Font URL: ${fontUrl}`);
      
      // Download the font file
      const fontData = await this.fetchUrl(fontUrl);
      await fs.writeFile(fontPath, fontData);
      
      console.log(`Font downloaded successfully: ${fontPath}`);
      return fontPath;
      
    } catch (error) {
      console.error(`Failed to download font ${fontName}:`, error);
      // Return default font path as fallback
      return '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
    }
  }

  async fetchUrl(url) {
    return new Promise((resolve, reject) => {
      https.get(url, (res) => {
        if (res.statusCode !== 200) {
          reject(new Error(`HTTP ${res.statusCode}: ${res.statusMessage}`));
          return;
        }
        
        const chunks = [];
        res.on('data', (chunk) => chunks.push(chunk));
        res.on('end', () => resolve(Buffer.concat(chunks)));
        res.on('error', reject);
      }).on('error', reject);
    });
  }

  async generateVideo(renderData, projectId, resolution = '1920x1080') {
    const outputPath = path.join(this.uploadsDir, `${projectId}.mp4`);
    
    try {
      console.log(`Starting video generation for project: ${projectId}`);
      console.log(`Output path: ${outputPath}`);
      console.log(`Resolution: ${resolution}`);
      
      // Parse resolution
      const [width, height] = resolution.split('x').map(Number);
      
      // Get scenes and calculate total duration
      const scenes = renderData.scenes || [];
      
      // Set default scene durations and log them
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        scene.duration = scene.duration || 5;
        console.log(`Scene ${i + 1} duration: ${scene.duration}s`);
      }
      
      const totalDuration = scenes.reduce((sum, scene) => sum + (scene.duration || 5), 0);
      
      console.log(`Total duration: ${totalDuration} seconds`);
      console.log(`Number of scenes: ${scenes.length}`);
      
      // If we have multiple scenes, we need to generate them separately and concatenate
      if (scenes.length > 1) {
        console.log('Multiple scenes detected - generating separate scene files and concatenating');
        return await this.generateMultiSceneVideo(renderData, projectId, resolution, outputPath);
      } else {
        // Single scene - use existing method
        console.log('Single scene detected - using standard generation method');
        return await this.generateSingleSceneVideo(renderData, projectId, resolution, outputPath);
      }
      
    } catch (error) {
      console.error('Video generation error:', error);
      throw error;
    }
  }

  async generateSingleSceneVideo(renderData, projectId, resolution, outputPath) {
    const [width, height] = resolution.split('x').map(Number);
    const scenes = renderData.scenes || [];
    
    // Build complex filter with multiple inputs
    const { filterComplex, inputs } = await this.buildComplexFilter(renderData, width, height, projectId);
    console.log(`Filter complex: ${filterComplex}`);
    console.log(`Number of inputs: ${inputs.length}`);
    
    // Build FFmpeg command with multiple inputs
    const ffmpegArgs = [];
    
    // Add all inputs
    inputs.forEach(input => {
      ffmpegArgs.push('-i', input);
    });
    
    // Add filter complex
    if (filterComplex) {
      ffmpegArgs.push('-filter_complex', filterComplex);
    }
    
    // Add output options
    ffmpegArgs.push(
      '-c:v', 'libx264',
      '-preset', 'fast',
      '-crf', '23',
      '-c:a', 'aac',
      '-b:a', '128k',
      '-shortest'
    );
    
    // Add output mappings
    if (filterComplex.includes('[outv]')) {
      ffmpegArgs.push('-map', '[outv]');
    }
    if (filterComplex.includes('[outa]')) {
      ffmpegArgs.push('-map', '[outa]');
    }
    
    ffmpegArgs.push('-y', outputPath); // Overwrite output file

    console.log(`FFmpeg command: ffmpeg ${ffmpegArgs.join(' ')}`);

    return new Promise((resolve, reject) => {
      const ffmpeg = spawn('ffmpeg', ffmpegArgs);
      
      let stderr = '';
      let stdout = '';
      
      ffmpeg.stdout.on('data', (data) => {
        stdout += data.toString();
      });
      
      ffmpeg.stderr.on('data', (data) => {
        stderr += data.toString();
      });
      
      ffmpeg.on('close', (code) => {
        console.log(`FFmpeg process exited with code: ${code}`);
        
        if (code === 0) {
          // Check if file was actually created
          const fs = require('fs');
          if (fs.existsSync(outputPath)) {
            const stats = fs.statSync(outputPath);
            console.log(`Video generated successfully: ${outputPath} (${stats.size} bytes)`);
            resolve(outputPath);
          } else {
            console.error('FFmpeg completed but file was not created');
            reject(new Error('Video file was not created'));
          }
        } else {
          console.error('FFmpeg error:', stderr);
          reject(new Error(`FFmpeg failed with code ${code}: ${stderr}`));
        }
      });
      
      ffmpeg.on('error', (error) => {
        console.error('FFmpeg spawn error:', error);
        reject(error);
      });
    });
  }

  async generateMultiSceneVideo(renderData, projectId, resolution, outputPath) {
    const [width, height] = resolution.split('x').map(Number);
    const scenes = renderData.scenes || [];
    const fs = require('fs');
    const path = require('path');
    
    try {
      // Generate individual scene files
      const sceneFiles = [];
      
      for (let i = 0; i < scenes.length; i++) {
        const scene = scenes[i];
        const sceneProjectId = `${projectId}_scene_${i}`;
        const sceneOutputPath = path.join(this.uploadsDir, `${sceneProjectId}.mp4`);
        
        console.log(`Generating scene ${i + 1}/${scenes.length} with duration: ${scene.duration}s`);
        
        // Create single scene render data
        const singleSceneRenderData = {
          ...renderData,
          scenes: [scene] // Only include this scene
        };
        
        // Generate the scene
        await this.generateSingleSceneVideo(singleSceneRenderData, sceneProjectId, resolution, sceneOutputPath);
        sceneFiles.push(sceneOutputPath);
      }
      
      // Create concat file for FFmpeg
      const concatFilePath = path.join(this.uploadsDir, `${projectId}_concat.txt`);
      const concatContent = sceneFiles.map(file => `file '${file}'`).join('\n');
      fs.writeFileSync(concatFilePath, concatContent);
      
      console.log('Concatenating scene files...');
      
      // Concatenate all scene files
      const ffmpegArgs = [
        '-f', 'concat',
        '-safe', '0',
        '-i', concatFilePath,
        '-c', 'copy',
        '-y', outputPath
      ];
      
      console.log(`FFmpeg concat command: ffmpeg ${ffmpegArgs.join(' ')}`);
      
      return new Promise((resolve, reject) => {
        const ffmpeg = spawn('ffmpeg', ffmpegArgs);
        
        let stderr = '';
        let stdout = '';
        
        ffmpeg.stdout.on('data', (data) => {
          stdout += data.toString();
        });
        
        ffmpeg.stderr.on('data', (data) => {
          stderr += data.toString();
        });
        
        ffmpeg.on('close', (code) => {
          console.log(`FFmpeg concat process exited with code: ${code}`);
          
          // Clean up temporary files
          sceneFiles.forEach(file => {
            if (fs.existsSync(file)) {
              fs.unlinkSync(file);
              console.log(`Cleaned up: ${file}`);
            }
          });
          
          if (fs.existsSync(concatFilePath)) {
            fs.unlinkSync(concatFilePath);
            console.log(`Cleaned up: ${concatFilePath}`);
          }
          
          if (code === 0) {
            if (fs.existsSync(outputPath)) {
              const stats = fs.statSync(outputPath);
              console.log(`Multi-scene video generated successfully: ${outputPath} (${stats.size} bytes)`);
              resolve(outputPath);
            } else {
              console.error('FFmpeg concat completed but file was not created');
              reject(new Error('Multi-scene video file was not created'));
            }
          } else {
            console.error('FFmpeg concat error:', stderr);
            reject(new Error(`FFmpeg concat failed with code ${code}: ${stderr}`));
          }
        });
        
        ffmpeg.on('error', (error) => {
          console.error('FFmpeg concat spawn error:', error);
          reject(error);
        });
      });
      
    } catch (error) {
      console.error('Multi-scene video generation error:', error);
      throw error;
    }
  }

  async buildComplexFilter(renderData, width, height, projectId) {
    const scenes = renderData.scenes || [];
    const videoInputs = [];
    const audioInputs = [];
    const textElements = [];
    
    console.log(`Building complex filter for ${scenes.length} scenes`);
    
    // Process each scene
    scenes.forEach((scene, sceneIndex) => {
      const sceneDuration = scene.duration || 5;
      const elements = scene.elements || [];
      
      console.log(`Scene ${sceneIndex + 1}: ${elements.length} elements, duration: ${sceneDuration}s`);
      console.log(`Scene ${sceneIndex + 1} duration from template: ${scene.duration}s (using: ${sceneDuration}s)`);
      
      // Sort elements by zIndex to ensure proper layering
      const sortedElements = elements.sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      
      sortedElements.forEach((element, elementIndex) => {
        console.log(`Processing element ${elementIndex + 1}: ${element.type}`);
        
        switch (element.type) {
          case 'video':
            // Add background video input
            if (element.src) {
              videoInputs.push(element.src);
            }
            break;
            
          case 'audio':
            // Add audio input
            if (element.src) {
              audioInputs.push(element.src);
            }
            break;
            
          case 'text':
            // Collect text elements for later processing
            if (element.text) {
              textElements.push({
                text: element.text,
                fontSize: element.font_size || 24,
                color: element.color || '#000000',
                x: element.x,
                y: element.y,
                width: element.width,
                height: element.height,
                alignment: element.alignment,
                verticalAlignment: element.verticalAlignment,
                text_wrap_width: element.text_wrap_width,
                text_wrap_height: element.text_wrap_height,
                text_padding: element.text_padding,
                padding: element.padding,
                font_family: element.font_family,
                bold: element.bold,
                text_shadow: element.text_shadow,
                text_stroke: element.text_stroke,
                background_color: element.background_color,
                fade_in: element.fade_in || 0,
                fade_out: element.fade_out || 0,
                sceneIndex,
                elementIndex
              });


            }
            break;
        }
      });
    });


    
    // Build the main filter
    let mainFilter = '';
    
    // Start with background video if available, otherwise white background
    if (videoInputs.length > 0) {
      // Use the first video input as background
      // Scale to fit the target dimensions, then crop if needed
      mainFilter = `[0:v]scale=${width}:${height}:force_original_aspect_ratio=decrease:force_divisible_by=2,pad=${width}:${height}:(ow-iw)/2:(oh-ih)/2:color=black,setpts=PTS-STARTPTS`;
      

    } else {
      // Create white background
      const totalDuration = scenes.reduce((sum, scene) => sum + (scene.duration || 5), 0);
      console.log(`Creating background with total duration: ${totalDuration}s`);
      mainFilter = `color=color=white:size=${width}x${height}:duration=${totalDuration}`;
    }
    
    // Add text overlays
    for (let index = 0; index < textElements.length; index++) {
      const textElement = textElements[index];
      const fontSize = textElement.fontSize || 24;
      let finalColor = textElement.color || '#ffffff';
      
      // Keep original color - don't force white to black
      console.log(`Text element: "${textElement.text}" at (${textElement.x}, ${textElement.y}), size: ${fontSize}, color: ${finalColor}`);
      console.log(`Text shadow data:`, textElement.text_shadow);
      
      // Calculate position based on alignment and explicit coordinates
      let x, y;
      
      // Use text element's text wrapping properties for positioning
      const textBoxWidth = textElement.text_wrap_width || textElement.width || 400;
      const textBoxHeight = textElement.text_wrap_height || textElement.height || 200;
      const padding = textElement.text_padding || textElement.padding || 20;
      
      // Horizontal positioning within the text box
      if (textElement.alignment === 'center') {
        x = textElement.x + (textBoxWidth / 2); // Center within text box
      } else if (textElement.alignment === 'left') {
        x = textElement.x + padding; // Left with padding
      } else if (textElement.alignment === 'right') {
        x = textElement.x + textBoxWidth - padding; // Right with padding
      } else {
        x = textElement.x + padding; // Default to left with padding
      }
      
      // Vertical positioning within the text box
      if (textElement.verticalAlignment === 'middle') {
        y = textElement.y + (textBoxHeight / 2); // Center within text box
      } else if (textElement.verticalAlignment === 'top') {
        y = textElement.y + padding; // Top with padding
      } else if (textElement.verticalAlignment === 'bottom') {
        y = textElement.y + textBoxHeight - padding; // Bottom with padding
      } else {
        y = textElement.y + padding; // Default to top with padding
      }
      

      
      // Choose appropriate font based on text content and font family
      let fontFile = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'; // Default
      
      console.log(`Font family requested: "${textElement.font_family}"`);
      
      // Check if text contains Arabic characters
      const arabicRegex = /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF\uFB50-\uFDFF\uFE70-\uFEFF]/;
      if (arabicRegex.test(textElement.text)) {
        fontFile = '/usr/share/fonts/truetype/noto/NotoSansArabic-Regular.ttf';
        console.log(`Using Arabic font for text: "${textElement.text}"`);
      } else if (textElement.font_family && textElement.font_family !== 'Inter') {
        // Try to download and use the specified font
        try {
          fontFile = await this.downloadGoogleFont(textElement.font_family);
          console.log(`Using custom font: ${textElement.font_family} -> ${fontFile}`);
        } catch (error) {
          console.warn(`Failed to load custom font ${textElement.font_family}, using default:`, error);
          fontFile = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
        }
      } else {
        // For Inter or any other font, use a good default
        console.log(`Using default font for: ${textElement.font_family || 'no font specified'}`);
        fontFile = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf';
      }
      
      console.log(`Final font file: ${fontFile}`);
      
      // Calculate available width within the text box (account for padding)
      const availableWidth = textBoxWidth - (padding * 2);
      
      // Better character width calculation for more accurate wrapping
      const charWidth = fontSize * 0.6; // Slightly more accurate estimate
      const maxCharsPerLine = Math.floor(availableWidth / charWidth);
      
      console.log(`Text box: ${textBoxWidth}x${textBoxHeight}, available width: ${availableWidth}px, max chars per line: ${maxCharsPerLine}`);
      console.log(`Text wrapping: "${textElement.text}" (${textElement.text.length} chars)`);
      console.log(`Text element properties:`, {
        width: textElement.width,
        height: textElement.height,
        text_wrap_width: textElement.text_wrap_width,
        text_wrap_height: textElement.text_wrap_height,
        text_padding: textElement.text_padding,
        padding: textElement.padding
      });
      
      // Always auto-wrap text to fit within the text box
      if (textElement.text.length > 0) {
        let finalText = textElement.text;
        
        // Manual text wrapping with line breaks
        const words = textElement.text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
          const testLine = currentLine ? currentLine + ' ' + word : word;
          if (testLine.length <= maxCharsPerLine) {
            currentLine = testLine;
          } else {
            if (currentLine) {
              lines.push(currentLine);
              currentLine = word;
            } else {
              // If a single word is too long, split it
              if (word.length > maxCharsPerLine) {
                const chunks = [];
                for (let i = 0; i < word.length; i += maxCharsPerLine) {
                  chunks.push(word.slice(i, i + maxCharsPerLine));
                }
                lines.push(...chunks);
                currentLine = '';
              } else {
                currentLine = word;
              }
            }
          }
        }
        if (currentLine) lines.push(currentLine);
        
        // Join lines with \N (FFmpeg line break)
        finalText = lines.join('\\N');
        console.log(`Auto-wrapped text into ${lines.length} lines:`, lines);
        
        // Escape the text - but preserve \N line breaks
        const escapedText = finalText
          .replace(/\\N/g, '___LINEBREAK___') // Temporarily replace \N
          .replace(/\\/g, '\\\\')
          .replace(/'/g, "\\'")
          .replace(/:/g, '\\:')
          .replace(/=/g, '\\=')
          .replace(/\[/g, '\\[')
          .replace(/\]/g, '\\]')
          .replace(/,/g, '\\,')
          .replace(/___LINEBREAK___/g, '\\N'); // Restore \N line breaks
        
        // Calculate text position within the text box
        const textX = x;
        const textY = y;
        
        // Build text styling options
        let textStyle = `fontsize=${fontSize}:fontcolor=${finalColor}:fontfile=${fontFile}`;
        
        // Add font weight (bold)
        if (textElement.bold) {
          textStyle += ':fontweight=bold';
        }
        
        // Add text shadow
        if (textElement.text_shadow) {
          const shadow = textElement.text_shadow;
          // FFmpeg drawtext doesn't support shadow directly, so we'll create a shadow effect
          // by drawing the text twice - once for shadow, once for main text
          const shadowColor = shadow.color || '#000000';
          const shadowX = shadow.x || 2;
          const shadowY = shadow.y || 2;
          const shadowBlur = shadow.blur || 3;
          
          // Create shadow text filter
          const shadowFilter = `drawtext=text='${escapedText}':fontsize=${fontSize}:fontcolor=${shadowColor}:fontfile=${fontFile}:x=${textX + shadowX}:y=${textY + shadowY}:line_spacing=${fontSize * 0.2}`;
          
          // Add shadow filter first (so it appears behind the main text)
          mainFilter += `,${shadowFilter}`;
          
          console.log(`Added text shadow: color=${shadowColor}, x=${shadowX}, y=${shadowY}, blur=${shadowBlur}`);
        }
        
        // Add text stroke (outline)
        if (textElement.text_stroke) {
          const stroke = textElement.text_stroke;
          textStyle += `:bordercolor=${stroke.color || '#000000'}:borderw=${stroke.width || 2}`;
        }
        
        // Calculate fade effects
        const fadeIn = textElement.fade_in || 0;
        const fadeOut = textElement.fade_out || 0;
        const sceneDuration = scenes[textElement.sceneIndex].duration || 5;
        
        // Create text overlay with fade effects
        let textFilter = `drawtext=text='${escapedText}':${textStyle}:x=${textX}:y=${textY}:line_spacing=${fontSize * 0.2}`;
        
        // Apply fade effects using enable parameter with smooth transitions
        if (fadeIn > 0 || fadeOut > 0) {
          let enableExpression = '1';
          
          if (fadeIn > 0 && fadeOut > 0) {
            const fadeOutStart = sceneDuration - fadeOut;
            enableExpression = `if(lt(t,${fadeIn}),0,if(gt(t,${fadeOutStart}),0,1))`;
          } else if (fadeIn > 0) {
            enableExpression = `if(lt(t,${fadeIn}),0,1)`;
          } else if (fadeOut > 0) {
            const fadeOutStart = sceneDuration - fadeOut;
            enableExpression = `if(gt(t,${fadeOutStart}),0,1)`;
          }
          
          textFilter += `:enable='${enableExpression}'`;
        }
        
        // Add text overlay
        mainFilter += `,${textFilter}`;
        
        // Add background color if specified
        if (textElement.background_color && textElement.background_color !== 'transparent') {
          const bgColor = textElement.background_color;
          const bgWidth = textBoxWidth;
          const bgHeight = textBoxHeight;
          const bgX = textElement.x;
          const bgY = textElement.y;
          
          // Apply fade effects to background as well
          let bgFilter = `drawbox=x=${bgX}:y=${bgY}:w=${bgWidth}:h=${bgHeight}:color=${bgColor}:t=fill`;
          
          if (fadeIn > 0 || fadeOut > 0) {
            let enableExpression = '1';
            
            if (fadeIn > 0 && fadeOut > 0) {
              const fadeOutStart = sceneDuration - fadeOut;
              enableExpression = `if(lt(t,${fadeIn}),0,if(gt(t,${fadeOutStart}),0,1))`;
            } else if (fadeIn > 0) {
              enableExpression = `if(lt(t,${fadeIn}),0,1)`;
            } else if (fadeOut > 0) {
              const fadeOutStart = sceneDuration - fadeOut;
              enableExpression = `if(gt(t,${fadeOutStart}),0,1)`;
            }
            
            bgFilter += `:enable='${enableExpression}'`;
          }
          
          mainFilter += `,${bgFilter}`;
        }
      }
    }
    
    // Add output label
    mainFilter += '[outv]';
    
    // Handle audio
    let audioFilter = '';
    
    if (audioInputs.length > 0 || videoInputs.length > 0) {
      if (videoInputs.length > 0) {
        // Just video audio
        audioFilter = `[0:a]volume=1[outa]`;
      }
    }
    
    const filterComplex = audioFilter ? `${mainFilter};${audioFilter}` : mainFilter;
    console.log(`Final filter complex: ${filterComplex}`);
    console.log(`Filter complex length: ${filterComplex.length} characters`);
    
    // Combine inputs: video first, then audio
    const inputs = [...videoInputs, ...audioInputs];
    
    return { filterComplex, inputs };
  }
  


  async deleteVideo(projectId) {
    try {
      const videoPath = path.join(this.uploadsDir, `${projectId}.mp4`);
      await fs.unlink(videoPath);
      console.log(`Video deleted: ${videoPath}`);
    } catch (error) {
      console.error('Error deleting video:', error);
    }
  }

  async videoExists(projectId) {
    try {
      const videoPath = path.join(this.uploadsDir, `${projectId}.mp4`);
      await fs.access(videoPath);
      return true;
    } catch (error) {
      console.log(`Video file not found: ${videoPath}`);
      return false;
    }
  }
}

module.exports = new VideoGenerator(); 