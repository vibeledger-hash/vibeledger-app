const { sequelize, Wallet, Transaction, User, Merchant } = require('../models');

class WalletService {
  async getWalletByUserId(userId) {
    try {
      let wallet = await Wallet.findOne({
        where: { userId },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'phoneNumber', 'trustScore']
        }]
      });

      // Create wallet if doesn't exist
      if (!wallet) {
        wallet = await Wallet.create({ userId });
        wallet = await Wallet.findByPk(wallet.id, {
          include: [{
            model: User,
            as: 'user',
            attributes: ['id', 'phoneNumber', 'trustScore']
          }]
        });
      }

      return wallet;
    } catch (error) {
      console.error('Get wallet error:', error);
      throw new Error('Failed to retrieve wallet');
    }
  }

  async updateBalance(userId, amount, transaction = null) {
    const t = transaction || await sequelize.transaction();
    
    try {
      const wallet = await Wallet.findOne({
        where: { userId },
        transaction: t
      });

      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const newBalance = parseFloat(wallet.balance) + parseFloat(amount);
      
      if (newBalance < 0) {
        throw new Error('Insufficient funds');
      }

      await wallet.update({
        balance: newBalance,
        lastTransactionAt: new Date()
      }, { transaction: t });

      if (!transaction) {
        await t.commit();
      }

      return newBalance;
    } catch (error) {
      if (!transaction) {
        await t.rollback();
      }
      console.error('Update balance error:', error);
      throw error;
    }
  }

  async checkDailyLimit(userId, amount) {
    try {
      const wallet = await Wallet.findOne({ where: { userId } });
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Calculate daily spent
      const dailyTransactions = await Transaction.sum('amount', {
        where: {
          userId,
          status: 'confirmed',
          type: 'payment',
          createdAt: {
            [require('sequelize').Op.gte]: today
          }
        }
      });

      const totalDailySpent = parseFloat(dailyTransactions || 0) + parseFloat(amount);
      
      if (totalDailySpent > parseFloat(wallet.dailyLimit)) {
        throw new Error(`Daily limit exceeded. Limit: ${wallet.dailyLimit}, Attempted: ${totalDailySpent}`);
      }

      return true;
    } catch (error) {
      console.error('Daily limit check error:', error);
      throw error;
    }
  }

  async getTransactionHistory(userId, limit = 50, offset = 0, filters = {}) {
    try {
      const whereClause = { userId };
      
      if (filters.status) {
        whereClause.status = filters.status;
      }
      
      if (filters.type) {
        whereClause.type = filters.type;
      }
      
      if (filters.startDate && filters.endDate) {
        whereClause.createdAt = {
          [require('sequelize').Op.between]: [filters.startDate, filters.endDate]
        };
      }

      const transactions = await Transaction.findAndCountAll({
        where: whereClause,
        include: [{
          model: Merchant,
          as: 'merchant',
          attributes: ['id', 'name', 'category']
        }],
        order: [['createdAt', 'DESC']],
        limit,
        offset
      });

      return {
        transactions: transactions.rows,
        total: transactions.count,
        limit,
        offset,
        hasMore: (offset + limit) < transactions.count
      };
    } catch (error) {
      console.error('Transaction history error:', error);
      throw new Error('Failed to retrieve transaction history');
    }
  }

  async lockWallet(userId, reason = 'Security') {
    try {
      const wallet = await Wallet.findOne({ where: { userId } });
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      await wallet.update({ 
        isLocked: true,
        metadata: { 
          ...wallet.metadata, 
          lockReason: reason,
          lockedAt: new Date()
        }
      });

      return wallet;
    } catch (error) {
      console.error('Lock wallet error:', error);
      throw error;
    }
  }

  async unlockWallet(userId) {
    try {
      const wallet = await Wallet.findOne({ where: { userId } });
      
      if (!wallet) {
        throw new Error('Wallet not found');
      }

      await wallet.update({ 
        isLocked: false,
        metadata: { 
          ...wallet.metadata, 
          unlockedAt: new Date()
        }
      });

      return wallet;
    } catch (error) {
      console.error('Unlock wallet error:', error);
      throw error;
    }
  }
}

module.exports = new WalletService();
