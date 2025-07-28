module.exports = (sequelize, DataTypes) => {
  const Wallet = sequelize.define('Wallet', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    userId: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    balance: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00,
      validate: {
        min: 0
      }
    },
    currency: {
      type: DataTypes.STRING(3),
      defaultValue: 'USD'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    isLocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    dailyLimit: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 1000.00
    },
    dailySpent: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 0.00
    },
    lastTransactionAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'wallets',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['userId']
      }
    ]
  });

  return Wallet;
};
