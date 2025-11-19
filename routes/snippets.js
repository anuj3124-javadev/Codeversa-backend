const express = require('express');
const { body, validationResult } = require('express-validator');
const { Snippet } = require('../models');
const ZipService = require('../services/zipService');
const auth = require('../middleware/auth');

const router = express.Router();
const zipService = new ZipService();

// Get user snippets
router.get('/', auth, async (req, res) => {
  try {
    const snippets = await Snippet.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']]
    });

    res.json(snippets);
  } catch (error) {
    console.error('Get snippets error:', error);
    res.status(500).json({ error: 'Failed to fetch snippets' });
  }
});

// Save snippet
router.post('/', [
  body('language').isLength({ min: 1 }).withMessage('Language is required'),
  body('title').isLength({ min: 1 }).withMessage('Title is required'),
  body('content').isLength({ min: 1 }).withMessage('Content cannot be empty')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { language, title, content } = req.body;

    const snippet = await Snippet.create({
      user_id: req.user.id,
      language,
      title,
      content
    });

    res.status(201).json({
      message: 'Snippet saved successfully',
      snippet
    });
  } catch (error) {
    console.error('Save snippet error:', error);
    res.status(500).json({ error: 'Failed to save snippet' });
  }
});

// Download snippet with custom filename
router.get('/:id/download', auth, async (req, res) => {
  try {
    const { filename } = req.query; // Get custom filename from query
    const snippet = await Snippet.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    // Use custom filename or generate one
    const downloadFilename = filename || `${snippet.title}_${snippet.language}.txt`;
    
    // Set headers for download
    res.set({
      'Content-Type': 'text/plain',
      'Content-Disposition': `attachment; filename="${downloadFilename}"`,
      'Content-Length': snippet.content.length,
      'Access-Control-Expose-Headers': 'Content-Disposition'
    });

    res.send(snippet.content);
  } catch (error) {
    console.error('Download snippet error:', error);
    res.status(500).json({ error: 'Failed to download snippet' });
  }
});

// New endpoint: Download project as ZIP with custom name
router.post('/:id/download-zip', auth, async (req, res) => {
  try {
    const { filename } = req.body;
    const snippet = await Snippet.findOne({
      where: {
        id: req.params.id,
        user_id: req.user.id
      }
    });

    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }

    const zipBuffer = await zipService.createProjectZip(snippet.content, snippet.language);
    const zipFilename = filename || `${snippet.title}.zip`;
    
    res.set({
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${zipFilename}"`,
      'Content-Length': zipBuffer.length
    });

    res.send(zipBuffer);
  } catch (error) {
    console.error('Download ZIP error:', error);
    res.status(500).json({ error: 'Failed to download ZIP' });
  }
});

module.exports = router;