module.exports = (sequelize, DataTypes) => {
  const OTP = sequelize.define('OTP', {
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
    otpCode: {
      type: DataTypes.STRING(6),
      allowNull: false
    },
    purpose: {
      type: DataTypes.ENUM('login', 'transaction', 'registration'),
      defaultValue: 'login'
    },
    expiresAt: {
      type: DataTypes.DATE,
      allowNull: false
    },
    verified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    verifiedAt: {
      type: DataTypes.DATE,
      allowNull: true
    },
    attempts: {
      type: DataTypes.INTEGER,
      defaultValue: 0
    },
    maxAttempts: {
      type: DataTypes.INTEGER,
      defaultValue: 3
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW
    },
    metadata: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Additional data like transaction ID for transaction OTPs'
    }
  }, {
    tableName: 'otps',
    timestamps: true,
    indexes: [
      {
        fields: ['userId']
      },
      {
        fields: ['expiresAt']
      },
      {
        fields: ['verified']
      }
    ]
  });

  return OTP;
};
