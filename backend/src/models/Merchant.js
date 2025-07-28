module.exports = (sequelize, DataTypes) => {
  const Merchant = sequelize.define('Merchant', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    bleId: {
      type: DataTypes.STRING,
      allowNull: true,
      unique: true
    },
    qrCode: {
      type: DataTypes.TEXT,
      allowNull: true,
      unique: true
    },
    location: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Stores latitude, longitude, address'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    trustScore: {
      type: DataTypes.DECIMAL(3, 2),
      defaultValue: 0.0,
      validate: {
        min: 0.0,
        max: 1.0
      }
    },
    dailyLimit: {
      type: DataTypes.DECIMAL(15, 2),
      defaultValue: 10000.00
    },
    contactInfo: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Phone, email, website'
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    lastTransactionAt: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    tableName: 'merchants',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['bleId']
      },
      {
        unique: true,
        fields: ['qrCode']
      },
      {
        fields: ['isActive']
      },
      {
        fields: ['category']
      }
    ]
  });

  return Merchant;
};
