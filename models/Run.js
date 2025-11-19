const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const Run = sequelize.define('Run', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  user_id: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  language: {
    type: DataTypes.STRING(50),
    allowNull: false
  },
  input: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  stdout: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  stderr: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  status: {
    type: DataTypes.ENUM('queued', 'running', 'done', 'error'),
    defaultValue: 'queued'
  }
}, {
  tableName: 'runs',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

module.exports = Run;