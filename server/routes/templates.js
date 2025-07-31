const express = require('express');
const { run, get, all } = require('../database/database');
const { authenticateToken } = require('../middleware/auth');

const router = express.Router();

// Get all templates for user
router.get('/', authenticateToken, async (req, res) => {
  try {
    const templates = await all(
      'SELECT id, name, description, thumbnail_url, created_at, updated_at FROM templates WHERE user_id = ? ORDER BY updated_at DESC',
      [req.user.id]
    );

    res.json({ templates });
  } catch (error) {
    console.error('Get templates error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single template
router.get('/:id', authenticateToken, async (req, res) => {
  try {
    const template = await get(
      'SELECT * FROM templates WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!template) {
      return res.status(404).json({ error: 'Template not found' });
    }

    res.json({ template });
  } catch (error) {
    console.error('Get template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new template
router.post('/', authenticateToken, async (req, res) => {
  try {
    const { name, description, template_data, thumbnail_url } = req.body;

    if (!name || !template_data) {
      return res.status(400).json({ error: 'Name and template data are required' });
    }

    const result = await run(
      'INSERT INTO templates (user_id, name, description, template_data, thumbnail_url) VALUES (?, ?, ?, ?, ?)',
      [req.user.id, name, description || '', JSON.stringify(template_data), thumbnail_url || null]
    );

    const newTemplate = await get(
      'SELECT * FROM templates WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      message: 'Template created successfully',
      template: newTemplate
    });
  } catch (error) {
    console.error('Create template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update template
router.put('/:id', authenticateToken, async (req, res) => {
  try {
    const { name, description, template_data, thumbnail_url } = req.body;

    if (!name || !template_data) {
      return res.status(400).json({ error: 'Name and template data are required' });
    }

    // Check if template exists and belongs to user
    const existingTemplate = await get(
      'SELECT id FROM templates WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!existingTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }

    await run(
      'UPDATE templates SET name = ?, description = ?, template_data = ?, thumbnail_url = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ? AND user_id = ?',
      [name, description || '', JSON.stringify(template_data), thumbnail_url || null, req.params.id, req.user.id]
    );

    const updatedTemplate = await get(
      'SELECT * FROM templates WHERE id = ?',
      [req.params.id]
    );

    res.json({
      message: 'Template updated successfully',
      template: updatedTemplate
    });
  } catch (error) {
    console.error('Update template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete template
router.delete('/:id', authenticateToken, async (req, res) => {
  try {
    // Check if template exists and belongs to user
    const existingTemplate = await get(
      'SELECT id FROM templates WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!existingTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }

    await run(
      'DELETE FROM templates WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    res.json({ message: 'Template deleted successfully' });
  } catch (error) {
    console.error('Delete template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Duplicate template
router.post('/:id/duplicate', authenticateToken, async (req, res) => {
  try {
    const { name } = req.body;

    // Get original template
    const originalTemplate = await get(
      'SELECT * FROM templates WHERE id = ? AND user_id = ?',
      [req.params.id, req.user.id]
    );

    if (!originalTemplate) {
      return res.status(404).json({ error: 'Template not found' });
    }

    const newName = name || `${originalTemplate.name} (Copy)`;

    const result = await run(
      'INSERT INTO templates (user_id, name, description, template_data, thumbnail_url) VALUES (?, ?, ?, ?, ?)',
      [
        req.user.id,
        newName,
        originalTemplate.description,
        originalTemplate.template_data,
        originalTemplate.thumbnail_url
      ]
    );

    const newTemplate = await get(
      'SELECT * FROM templates WHERE id = ?',
      [result.id]
    );

    res.status(201).json({
      message: 'Template duplicated successfully',
      template: newTemplate
    });
  } catch (error) {
    console.error('Duplicate template error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 