const express = require('express');
const { v4: uuidv4 } = require('uuid');
const crypto = require('crypto');
const { run, get, all } = require('../database/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all API keys for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const apiKeys = await all(
      'SELECT id, key_name, api_key, is_active, last_used, created_at FROM api_keys WHERE user_id = ? ORDER BY created_at DESC',
      [req.user.id]
    );

    // Mask API keys for security (show only first 8 characters)
    const maskedKeys = apiKeys.map(key => ({
      ...key,
      api_key: key.api_key.substring(0, 8) + '...'
    }));

    res.json({ apiKeys: maskedKeys });
  } catch (error) {
    console.error('Get API keys error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Generate new API key
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { key_name } = req.body;

    if (!key_name) {
      return res.status(400).json({ error: 'Key name is required' });
    }

    // Generate unique API key
    const apiKey = 'j2v_' + crypto.randomBytes(32).toString('hex');

    const result = await run(
      'INSERT INTO api_keys (user_id, key_name, api_key) VALUES (?, ?, ?)',
      [req.user.id, key_name, apiKey]
    );

    const newApiKey = await get(
      'SELECT * FROM api_keys WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      message: 'API key generated successfully',
      apiKey: {
        ...newApiKey,
        api_key: apiKey // Return full key only on creation
      }
    });
  } catch (error) {
    console.error('Generate API key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete API key
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if API key exists and belongs to user
    const existingKey = await get(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!existingKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    await run(
      'DELETE FROM api_keys WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    res.json({ message: 'API key deleted successfully' });
  } catch (error) {
    console.error('Delete API key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Toggle API key status
router.put('/:id/toggle', authenticateToken, async (req, res) => {
  try {
    // Get current API key
    const apiKey = await get(
      'SELECT id, is_active FROM api_keys WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!apiKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    const newStatus = !apiKey.is_active;

    await run(
      'UPDATE api_keys SET is_active = ? WHERE id = ? AND user_id = ?',
      [newStatus, req.params.id, req.user.id]
    );

    res.json({
      message: `API key ${newStatus ? 'activated' : 'deactivated'} successfully`,
      is_active: newStatus
    });
  } catch (error) {
    console.error('Toggle API key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Regenerate API key
router.post('/:id/regenerate', authenticateToken, async (req, res) => {
  try {
    // Check if API key exists and belongs to user
    const existingKey = await get(
      'SELECT id FROM api_keys WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!existingKey) {
      return res.status(404).json({ error: 'API key not found' });
    }

    // Generate new API key
    const newApiKey = 'j2v_' + crypto.randomBytes(32).toString('hex');

    await run(
      'UPDATE api_keys SET api_key = ? WHERE id = ? AND user_id = ?',
      [newApiKey, req.params.id, req.user.id]
    );

    const updatedKey = await get(
      'SELECT * FROM api_keys WHERE id = ?',
      [req.params.id]
    );

    res.json({
      message: 'API key regenerated successfully',
      apiKey: {
        ...updatedKey,
        api_key: newApiKey // Return full key only on regeneration
      }
    });
  } catch (error) {
    console.error('Regenerate API key error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Middleware to validate API key (for external API access)
const validateApiKey = async (req, res, next) => {
  try {
    const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

    if (!apiKey) {
      return res.status(401).json({ error: 'API key required' });
    }

    const keyData = await get(
      'SELECT user_id, is_active FROM api_keys WHERE api_key = ?',
      [apiKey]
    );

    if (!keyData || !keyData.is_active) {
      return res.status(401).json({ error: 'Invalid or inactive API key' });
    }

    // Update last used timestamp
    await run(
      'UPDATE api_keys SET last_used = CURRENT_TIMESTAMP WHERE api_key = ?',
      [apiKey]
    );

    req.apiUser = { id: keyData.user_id };
    next();
  } catch (error) {
    console.error('API key validation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Example external API endpoint using API key authentication
router.post('/render', validateApiKey, async (req, res) => {
  try {
    const { template_id, render_data, resolution = '1920x1080' } = req.body;

    if (!template_id || !render_data) {
      return res.status(400).json({ error: 'Template ID and render data are required' });
    }

    // Check if template exists and belongs to API user
    const template = await get(
      'SELECT id FROM templates WHERE id = ? AND user_id = ?',
      [template_id, req.apiUser.id]
    );

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const projectId = uuidv4();

    const result = await run(
      'INSERT INTO renders (user_id, template_id, project_id, status, resolution, render_data) VALUES (?, ?, ?, ?, ?, ?)',
      [req.apiUser.id, template_id, projectId, 'processing', resolution, JSON.stringify(render_data)]
    );

    res.status(201).json({
      message: 'Render job created successfully',
      project_id: projectId,
      status: 'processing'
    });
  } catch (error) {
    console.error('API render error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 