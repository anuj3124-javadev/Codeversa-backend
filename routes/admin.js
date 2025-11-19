const express = require('express');
const { User, Snippet, Run, Contact } = require('../models');
const auth = require('../middleware/auth');
const { Op } = require('sequelize');

const router = express.Router();

// Admin middleware - Check if user is admin
const adminAuth = async (req, res, next) => {
  try {
    // For now, we'll consider first user as admin
    // In production, you should add an 'isAdmin' field to User model
    const isFirstUser = req.user.id === 1;
    
    if (!isFirstUser) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    next();
  } catch (error) {
    res.status(500).json({ error: 'Admin verification failed' });
  }
};

// Get dashboard statistics
router.get('/dashboard', auth, adminAuth, async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalSnippets = await Snippet.count();
    const totalRuns = await Run.count();
    const totalContacts = await Contact.count();
    
    // Recent activities
    const recentUsers = await User.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
      attributes: ['id', 'name', 'email', 'created_at']
    });
    
    const recentSnippets = await Snippet.findAll({
      order: [['created_at', 'DESC']],
      limit: 5,
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email']
      }]
    });
    
    const popularLanguages = await Snippet.findAll({
      attributes: [
        'language',
        [sequelize.fn('COUNT', sequelize.col('language')), 'count']
      ],
      group: ['language'],
      order: [[sequelize.fn('COUNT', sequelize.col('language')), 'DESC']],
      limit: 5
    });

    res.json({
      stats: {
        totalUsers,
        totalSnippets,
        totalRuns,
        totalContacts
      },
      recentUsers,
      recentSnippets,
      popularLanguages
    });
  } catch (error) {
    console.error('Admin dashboard error:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard data' });
  }
});

// Get all users
router.get('/users', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, search = '' } = req.query;
    const offset = (page - 1) * limit;
    
    const whereCondition = search ? {
      [Op.or]: [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ]
    } : {};
    
    const users = await User.findAndCountAll({
      where: whereCondition,
      attributes: { exclude: ['password_hash'] },
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      users: users.rows,
      totalPages: Math.ceil(users.count / limit),
      currentPage: parseInt(page),
      totalUsers: users.count
    });
  } catch (error) {
    console.error('Get users error:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
});

// Get all snippets
router.get('/snippets', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, language = '' } = req.query;
    const offset = (page - 1) * limit;
    
    const whereCondition = language ? { language } : {};
    
    const snippets = await Snippet.findAndCountAll({
      where: whereCondition,
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      snippets: snippets.rows,
      totalPages: Math.ceil(snippets.count / limit),
      currentPage: parseInt(page),
      totalSnippets: snippets.count
    });
  } catch (error) {
    console.error('Get snippets error:', error);
    res.status(500).json({ error: 'Failed to fetch snippets' });
  }
});

// Get all code executions
router.get('/executions', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10, status = '' } = req.query;
    const offset = (page - 1) * limit;
    
    const whereCondition = status ? { status } : {};
    
    const runs = await Run.findAndCountAll({
      where: whereCondition,
      include: [{
        model: User,
        as: 'user',
        attributes: ['name', 'email']
      }],
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      runs: runs.rows,
      totalPages: Math.ceil(runs.count / limit),
      currentPage: parseInt(page),
      totalRuns: runs.count
    });
  } catch (error) {
    console.error('Get executions error:', error);
    res.status(500).json({ error: 'Failed to fetch executions' });
  }
});

// Get contact messages
router.get('/contacts', auth, adminAuth, async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    const offset = (page - 1) * limit;
    
    const contacts = await Contact.findAndCountAll({
      limit: parseInt(limit),
      offset: parseInt(offset),
      order: [['created_at', 'DESC']]
    });
    
    res.json({
      contacts: contacts.rows,
      totalPages: Math.ceil(contacts.count / limit),
      currentPage: parseInt(page),
      totalContacts: contacts.count
    });
  } catch (error) {
    console.error('Get contacts error:', error);
    res.status(500).json({ error: 'Failed to fetch contacts' });
  }
});

// Delete user
router.delete('/users/:id', auth, adminAuth, async (req, res) => {
  try {
    const userId = req.params.id;
    
    // Prevent admin from deleting themselves
    if (parseInt(userId) === req.user.id) {
      return res.status(400).json({ error: 'Cannot delete your own account' });
    }
    
    const user = await User.findByPk(userId);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    await user.destroy();
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Delete user error:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
});

// Delete snippet
router.delete('/snippets/:id', auth, adminAuth, async (req, res) => {
  try {
    const snippet = await Snippet.findByPk(req.params.id);
    if (!snippet) {
      return res.status(404).json({ error: 'Snippet not found' });
    }
    
    await snippet.destroy();
    
    res.json({ message: 'Snippet deleted successfully' });
  } catch (error) {
    console.error('Delete snippet error:', error);
    res.status(500).json({ error: 'Failed to delete snippet' });
  }
});

// System statistics over time
router.get('/statistics', auth, adminAuth, async (req, res) => {
  try {
    const { period = '7d' } = req.query; // 7d, 30d, 90d
    
    let days;
    switch (period) {
      case '30d': days = 30; break;
      case '90d': days = 90; break;
      default: days = 7;
    }
    
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    // User registrations over time
    const userRegistrations = await User.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        created_at: {
          [Op.gte]: startDate
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
    });
    
    // Code executions over time
    const codeExecutions = await Run.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('id')), 'count']
      ],
      where: {
        created_at: {
          [Op.gte]: startDate
        }
      },
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
    });
    
    // Language usage statistics
    const languageStats = await Snippet.findAll({
      attributes: [
        'language',
        [sequelize.fn('COUNT', sequelize.col('language')), 'count']
      ],
      group: ['language'],
      order: [[sequelize.fn('COUNT', sequelize.col('language')), 'DESC']]
    });
    
    res.json({
      userRegistrations,
      codeExecutions,
      languageStats
    });
  } catch (error) {
    console.error('Statistics error:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

module.exports = router;