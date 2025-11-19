const express = require('express');
const { body, validationResult } = require('express-validator');
const AIService = require('../services/aiService');
const auth = require('../middleware/auth');

const router = express.Router();
const aiService = new AIService();

// Explain code
router.post('/explain', [
  body('code').isLength({ min: 1 }).withMessage('Code cannot be empty'),
  body('language').isLength({ min: 1 }).withMessage('Language is required')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, language } = req.body;
    const result = await aiService.explainCode(code, language);

    res.json(result);
  } catch (error) {
    console.error('AI explain error:', error);
    res.status(500).json({ error: 'Failed to explain code' });
  }
});

// Fix code
router.post('/fix', [
  body('code').isLength({ min: 1 }).withMessage('Code cannot be empty'),
  body('language').isLength({ min: 1 }).withMessage('Language is required'),
  body('error').isLength({ min: 1 }).withMessage('Error description is required')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, language, error } = req.body;
    const result = await aiService.fixCode(code, language, error);

    res.json(result);
  } catch (error) {
    console.error('AI fix error:', error);
    res.status(500).json({ error: 'Failed to fix code' });
  }
});

// Optimize code
router.post('/optimize', [
  body('code').isLength({ min: 1 }).withMessage('Code cannot be empty'),
  body('language').isLength({ min: 1 }).withMessage('Language is required')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, language } = req.body;
    const result = await aiService.optimizeCode(code, language);

    res.json(result);
  } catch (error) {
    console.error('AI optimize error:', error);
    res.status(500).json({ error: 'Failed to optimize code' });
  }
});

// Convert code between languages
router.post('/convert', [
  body('code').isLength({ min: 1 }).withMessage('Code cannot be empty'),
  body('sourceLanguage').isLength({ min: 1 }).withMessage('Source language is required'),
  body('targetLanguage').isLength({ min: 1 }).withMessage('Target language is required')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { code, sourceLanguage, targetLanguage } = req.body;
    const result = await aiService.convertCode(code, sourceLanguage, targetLanguage);

    res.json(result);
  } catch (error) {
    console.error('AI convert error:', error);
    res.status(500).json({ error: 'Failed to convert code' });
  }
});

// General AI chat for coding questions
router.post('/chat', [
  body('message').isLength({ min: 1 }).withMessage('Message cannot be empty')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { message, context } = req.body;
    const result = await aiService.chat(message, context);

    res.json(result);
  } catch (error) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to process chat message' });
  }
});

module.exports = router;