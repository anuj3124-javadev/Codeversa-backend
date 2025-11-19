const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Snippet = sequelize.define('Snippet', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  language: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  title: {
    type: DataTypes.STRING(255),
    allowNull: false,
    defaultValue: 'Untitled'
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  }
}, {
  tableName: 'snippets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Snippet;