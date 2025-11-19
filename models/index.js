const sequelize = require('../config/db');
const User = require('./User');
const Snippet = require('./Snippet');
const Run = require('./Run');
const Contact = require('./Contact');

// Define associations
User.hasMany(Snippet, { foreignKey: 'user_id', as: 'snippets' });
Snippet.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

User.hasMany(Run, { foreignKey: 'user_id', as: 'runs' });
Run.belongsTo(User, { foreignKey: 'user_id', as: 'user' });

const models = {
  User,
  Snippet,
  Run,
  Contact
};

module.exports = {
  sequelize,
  ...models
};