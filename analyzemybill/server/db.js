const { Sequelize, DataTypes } = require('sequelize');
const path = require('path');

// SQLite for dev; switch to Postgres in prod if you like:
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, 'database.sqlite'),
  logging: false,
});

const User = sequelize.define('User', {
  id: {
    type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true
  },
  email: {
    type: DataTypes.STRING, unique: true, allowNull: false
  },
  passwordHash: {
    type: DataTypes.STRING, allowNull: false
  },
  name: DataTypes.STRING
}, {
  timestamps: true
});

module.exports = { sequelize, User };

const Subscription = sequelize.define('Subscription', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  stripeCustomerId: { type: DataTypes.STRING, allowNull: false },
  stripeSubscriptionId: { type: DataTypes.STRING, allowNull: false },
  status: { type: DataTypes.STRING, allowNull: false },     // e.g. active, past_due, canceled
  currentPeriodStart: { type: DataTypes.DATE, allowNull: false },
  currentPeriodEnd: { type: DataTypes.DATE, allowNull: false }
}, {
  timestamps: true
});

// Link Subscription → User (1:1)
User.hasOne(Subscription, { foreignKey: 'userId' });
Subscription.belongsTo(User, { foreignKey: 'userId' });

module.exports = { sequelize, User, Subscription };
