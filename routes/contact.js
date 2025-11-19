const express = require('express');
const { body, validationResult } = require('express-validator');
const { Contact } = require('../models');

const router = express.Router();

// Submit contact form
router.post('/', [
  body('name').isLength({ min: 2 }).withMessage('Name must be at least 2 characters'),
  body('email').isEmail().withMessage('Valid email required'),
  body('message').isLength({ min: 10 }).withMessage('Message must be at least 10 characters')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, message } = req.body;

    const contact = await Contact.create({
      name,
      email,
      message
    });

    res.status(201).json({
      message: 'Thank you for your message! We will get back to you soon.',
      contact: {
        id: contact.id,
        name: contact.name,
        email: contact.email
      }
    });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to submit contact form' });
  }
});

module.exports = router;