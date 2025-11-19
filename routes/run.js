const express = require('express');
const { body, validationResult } = require('express-validator');
const JavaScriptRunner = require('../services/JavaScriptRunner');
const auth = require('../middleware/auth');
const { Run } = require('../models');

const router = express.Router();
const codeRunner = new JavaScriptRunner();

// Run code - Direct execution
router.post('/', [
  body('language').isIn(['python', 'java', 'c', 'cpp', 'javascript']).withMessage('Invalid language'),
  body('code').isLength({ min: 1 }).withMessage('Code cannot be empty')
], auth, async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { language, code, input } = req.body;
    const userId = req.user.id;

    console.log(`🚀 Executing ${language} code for user ${userId}`);
    console.log(`📝 Input provided: "${input}"`);

    // Create run record with "running" status
    const run = await Run.create({
      user_id: userId,
      language,
      code: code.substring(0, 10000), // Store first 10k chars
      input: input || '',
      status: 'running'
    });

    // Execute code using JavaScript runner (no Docker)
    const result = await codeRunner.runCode(language, code, input || '');

    console.log(`📊 Execution result - Status: ${result.status}`);
    console.log(`📤 Stdout length: ${result.stdout?.length || 0}`);
    console.log(`❌ Stderr length: ${result.stderr?.length || 0}`);

    // Update run record with results
    await Run.update({
      status: result.status,
      stdout: result.stdout,
      stderr: result.stderr,
      completed_at: new Date()
    }, { where: { id: run.id } });

    // Send response
    res.json({
      message: 'Code execution completed',
      runId: run.id,
      stdout: result.stdout || '',
      stderr: result.stderr || '',
      status: result.status
    });

  } catch (error) {
    console.error('💥 Route error:', error);
    res.status(500).json({ 
      error: 'Failed to run code',
      message: error.message 
    });
  }
});

// Get run status
router.get('/:runId', auth, async (req, res) => {
  try {
    const { runId } = req.params;
    const run = await Run.findByPk(runId);

    if (!run) {
      return res.status(404).json({ error: 'Run not found' });
    }

    // Check if user owns this run
    if (run.user_id !== req.user.id) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({
      runId: run.id,
      status: run.status,
      stdout: run.stdout,
      stderr: run.stderr,
      language: run.language,
      createdAt: run.created_at,
      completedAt: run.completed_at
    });
  } catch (error) {
    console.error('Get run status error:', error);
    res.status(500).json({ error: 'Failed to get run status' });
  }
});

// Get user's run history
router.get('/', auth, async (req, res) => {
  try {
    const runs = await Run.findAll({
      where: { user_id: req.user.id },
      order: [['created_at', 'DESC']],
      limit: 20
    });

    res.json({
      runs: runs.map(run => ({
        id: run.id,
        language: run.language,
        status: run.status,
        createdAt: run.created_at,
        completedAt: run.completed_at
      }))
    });
  } catch (error) {
    console.error('Get run history error:', error);
    res.status(500).json({ error: 'Failed to get run history' });
  }
});

module.exports = router;