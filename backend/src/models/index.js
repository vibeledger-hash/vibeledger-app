const { Sequelize } = require('sequelize');
require('dotenv').config();

const sequelize = new Sequelize(
  process.env.DB_NAME || 'microshield_dev',
  process.env.DB_USER || 'postgres',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 5432,
    dialect: 'postgres',
    logging: process.env.NODE_ENV === 'development' ? console.log : false,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000
    }
  }
);

// Import models
const User = require('./User')(sequelize, Sequelize.DataTypes);
const Wallet = require('./Wallet')(sequelize, Sequelize.DataTypes);
const Transaction = require('./Transaction')(sequelize, Sequelize.DataTypes);
const Merchant = require('./Merchant')(sequelize, Sequelize.DataTypes);
const OTP = require('./OTP')(sequelize, Sequelize.DataTypes);

// Define associations
User.hasOne(Wallet, { foreignKey: 'userId', as: 'wallet' });
Wallet.belongsTo(User, { foreignKey: 'userId', as: 'user' });

User.hasMany(Transaction, { foreignKey: 'userId', as: 'transactions' });
Transaction.belongsTo(User, { foreignKey: 'userId', as: 'user' });

Merchant.hasMany(Transaction, { foreignKey: 'merchantId', as: 'transactions' });
Transaction.belongsTo(Merchant, { foreignKey: 'merchantId', as: 'merchant' });

User.hasMany(OTP, { foreignKey: 'userId', as: 'otps' });
OTP.belongsTo(User, { foreignKey: 'userId', as: 'user' });

module.exports = {
  sequelize,
  User,
  Wallet,
  Transaction,
  Merchant,
  OTP
};
