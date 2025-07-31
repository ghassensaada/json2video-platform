const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { run, get, all } = require('../database/database');
const { authenticateToken } = require('../middleware/auth');
const videoGenerator = require('../services/videoGenerator');

// Function to generate short random filename
function generateShortFilename() {
  const timestamp = Date.now().toString().slice(-6); // Last 6 digits of timestamp
  const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0'); // 4-digit random number
  return `quran_${timestamp}_${random}`;
}

const router = express.Router();

// Get all renders for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const renders = await all(
      `SELECT r.id, r.project_id, r.status, r.resolution, r.output_url, r.error_message, 
       r.created_at, r.updated_at, t.name as template_name
       FROM renders r
       LEFT JOIN templates t ON r.template_id = t.id
       WHERE r.user_id = ? 
       ORDER BY r.created_at DESC`,
      [req.user.id]
    );

    res.json({ renders });
  } catch (error) {
    console.error('Get renders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single render
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const render = await get(
      `SELECT r.*, t.name as template_name
       FROM renders r
       LEFT JOIN templates t ON r.template_id = t.id
       WHERE r.id = ? AND r.user_id = ?`,
      [req.params.id, req.user.id]
    );

    if (!render) {
      return res.status(404).json({ error: 'Render not found' });
    }

    res.json({ render });
  } catch (error) {
    console.error('Get render error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new render job
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { template_id, render_data, resolution = '1920x1080' } = req.body;

    if (!template_id || !render_data) {
      return res.status(400).json({ error: 'Template ID and render data are required' });
    }

    // Check if template exists and belongs to user
    const template = await get(
      'SELECT id FROM templates WHERE id = ? AND user_id = ?',
      [template_id, req.user.id]
    );

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const projectId = generateShortFilename();

    const result = await run(
      'INSERT INTO renders (user_id, template_id, project_id, status, resolution, render_data) VALUES (?, ?, ?, ?, ?, ?)',
      [req.user.id, template_id, projectId, 'processing', resolution, JSON.stringify(render_data)]
    );

    const newRender = await get(
      'SELECT * FROM renders WHERE id = ?',
      [result.id]
    );

    // Generate actual video using FFmpeg
    setTimeout(async () => {
      try {
        console.log('Starting video generation for project:', projectId);
        
        // Generate the video
        await videoGenerator.generateVideo(render_data, projectId, resolution);
        
        // Update status to done
        await run(
          'UPDATE renders SET status = ?, output_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['done', `/json2video/uploads/videos/${projectId}.mp4`, result.id]
        );
        
        console.log('Video generation completed for project:', projectId);
        
      } catch (error) {
        console.error('Video generation error:', error);
        
        // Update status to error
        await run(
          'UPDATE renders SET status = ?, error_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['error', `Video generation failed: ${error.message}`, result.id]
        );
      }
    }, 3000); // Reduced to 3 seconds for faster feedback

    res.status(201).json({
      message: 'Render job created successfully',
      render: newRender
    });
  } catch (error) {
    console.error('Create render error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete render
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if render exists and belongs to user
    const existingRender = await get(
      'SELECT id FROM renders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!existingRender) {
      return res.status(404).json({ error: 'Render not found' });
    }

    await run(
      'DELETE FROM renders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    res.json({ message: 'Render deleted successfully' });
  } catch (error) {
    console.error('Delete render error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Retry failed render
router.post('/:id/retry', authenticateToken, async (req, res) => {
  try {
    // Get render
    const render = await get(
      'SELECT * FROM renders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!render) {
      return res.status(404).json({ error: 'Render not found' });
    }

    if (render.status !== 'error') {
      return res.status(400).json({ error: 'Only failed renders can be retried' });
    }

    // Update status to processing
    await run(
      'UPDATE renders SET status = ?, error_message = NULL, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
      ['processing', req.params.id]
    );

    // Retry video generation
    setTimeout(async () => {
      try {
        console.log('Retrying video generation for project:', render.project_id);
        
        // Parse the render data
        const renderData = JSON.parse(render.render_data);
        
        // Generate the video
        await videoGenerator.generateVideo(renderData, render.project_id, render.resolution);
        
        // Update status to done
        await run(
          'UPDATE renders SET status = ?, output_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['done', `/json2video/uploads/videos/${render.project_id}.mp4`, req.params.id]
        );
        
        console.log('Video generation retry completed for project:', render.project_id);
        
      } catch (error) {
        console.error('Video generation retry error:', error);
        
        // Update status to error
        await run(
          'UPDATE renders SET status = ?, error_message = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?',
          ['error', `Retry failed: ${error.message}`, req.params.id]
        );
      }
    }, 3000);

    res.json({ message: 'Render retry initiated' });
  } catch (error) {
    console.error('Retry render error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get render statistics
router.get('/stats/summary', authenticateToken, async (req, res) => {
  try {
    const stats = await get(
      `SELECT 
        COUNT(*) as total_renders,
        SUM(CASE WHEN status = 'done' THEN 1 ELSE 0 END) as successful_renders,
        SUM(CASE WHEN status = 'processing' THEN 1 ELSE 0 END) as processing_renders,
        SUM(CASE WHEN status = 'error' THEN 1 ELSE 0 END) as failed_renders
       FROM renders 
       WHERE user_id = ?`,
      [req.user.id]
    );

    res.json({ stats });
  } catch (error) {
    console.error('Get render stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// View video (stream video file)
router.get('/:id/view', authenticateToken, async (req, res) => {
  try {
    console.log(`View video request for render ID: ${req.params.id}`);
    
    const render = await get(
      'SELECT * FROM renders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!render) {
      console.log('Render not found');
      return res.status(404).json({ error: 'Render not found' });
    }

    console.log(`Render found: ${render.project_id}, status: ${render.status}`);

    if (render.status !== 'done') {
      console.log('Render not ready for viewing');
      return res.status(400).json({ error: 'Video is not ready for viewing' });
    }

    // Check if video file exists
    const videoExists = await videoGenerator.videoExists(render.project_id);
    console.log(`Video file exists: ${videoExists}`);
    
    if (!videoExists) {
      console.log('Video file not found on disk');
      return res.status(404).json({ error: 'Video file not found' });
    }

    // Stream the video file
    const videoPath = require('path').join(__dirname, '../../uploads/videos', `${render.project_id}.mp4`);
    console.log(`Serving video from: ${videoPath}`);
    
    // Set proper headers for video streaming
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Accept-Ranges', 'bytes');
    
    res.sendFile(videoPath, (err) => {
      if (err) {
        console.error('Error sending video file:', err);
        res.status(500).json({ error: 'Failed to serve video file' });
      }
    });
    
  } catch (error) {
    console.error('View video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Download video (force download)
router.get('/:id/download', authenticateToken, async (req, res) => {
  try {
    console.log(`Download video request for render ID: ${req.params.id}`);
    
    const render = await get(
      'SELECT * FROM renders WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!render) {
      console.log('Render not found');
      return res.status(404).json({ error: 'Render not found' });
    }

    console.log(`Render found: ${render.project_id}, status: ${render.status}`);

    if (render.status !== 'done') {
      console.log('Render not ready for download');
      return res.status(400).json({ error: 'Video is not ready for download' });
    }

    // Check if video file exists
    const videoExists = await videoGenerator.videoExists(render.project_id);
    console.log(`Video file exists: ${videoExists}`);
    
    if (!videoExists) {
      console.log('Video file not found on disk');
      return res.status(404).json({ error: 'Video file not found' });
    }

    // Download the video file
    const videoPath = require('path').join(__dirname, '../../uploads/videos', `${render.project_id}.mp4`);
    console.log(`Downloading video from: ${videoPath}`);
    
    // Set proper headers for download
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Content-Disposition', `attachment; filename="${render.project_id}.mp4"`);
    
    res.sendFile(videoPath, (err) => {
      if (err) {
        console.error('Error downloading video file:', err);
        res.status(500).json({ error: 'Failed to download video file' });
      }
    });
    
  } catch (error) {
    console.error('Download video error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 