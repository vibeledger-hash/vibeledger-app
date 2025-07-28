const admin = require('firebase-admin');

class FirestoreService {
  constructor() {
    this.db = admin.firestore();
  }

  // User operations
  async createUser(userData) {
    const userRef = this.db.collection('users').doc();
    await userRef.set({
      ...userData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { id: userRef.id, ...userData };
  }

  async getUserByPhone(phoneNumber) {
    const snapshot = await this.db
      .collection('users')
      .where('phoneNumber', '==', phoneNumber)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  async updateUser(userId, updateData) {
    await this.db.collection('users').doc(userId).update({
      ...updateData,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  // Wallet operations
  async getWallet(userId) {
    const doc = await this.db.collection('wallets').doc(userId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async createWallet(userId, initialBalance = 0) {
    const walletData = {
      userId,
      balance: initialBalance,
      currency: 'USD',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    };
    await this.db.collection('wallets').doc(userId).set(walletData);
    return { id: userId, ...walletData };
  }

  async updateWalletBalance(userId, newBalance) {
    await this.db.collection('wallets').doc(userId).update({
      balance: newBalance,
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  // Transaction operations
  async createTransaction(transactionData) {
    const transactionRef = this.db.collection('transactions').doc();
    await transactionRef.set({
      ...transactionData,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { id: transactionRef.id, ...transactionData };
  }

  async getTransactions(userId, limit = 50) {
    const snapshot = await this.db
      .collection('transactions')
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  }

  async getTransaction(transactionId) {
    const doc = await this.db.collection('transactions').doc(transactionId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  // Merchant operations
  async createMerchant(merchantData) {
    const merchantRef = this.db.collection('merchants').doc();
    await merchantRef.set({
      ...merchantData,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
    return { id: merchantRef.id, ...merchantData };
  }

  async getMerchant(merchantId) {
    const doc = await this.db.collection('merchants').doc(merchantId).get();
    if (!doc.exists) return null;
    return { id: doc.id, ...doc.data() };
  }

  async getMerchantByBleId(bleId) {
    const snapshot = await this.db
      .collection('merchants')
      .where('bleId', '==', bleId)
      .limit(1)
      .get();
    
    if (snapshot.empty) return null;
    const doc = snapshot.docs[0];
    return { id: doc.id, ...doc.data() };
  }

  // OTP operations
  async storeOTP(phoneNumber, otpCode, expiresAt) {
    await this.db.collection('otps').doc(phoneNumber).set({
      code: otpCode,
      expiresAt: admin.firestore.Timestamp.fromDate(expiresAt),
      verified: false,
      createdAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }

  async verifyOTP(phoneNumber, otpCode) {
    const doc = await this.db.collection('otps').doc(phoneNumber).get();
    if (!doc.exists) return false;
    
    const data = doc.data();
    const now = new Date();
    const isValid = data.code === otpCode && 
                   data.expiresAt.toDate() > now && 
                   !data.verified;
    
    if (isValid) {
      await this.db.collection('otps').doc(phoneNumber).update({
        verified: true,
        verifiedAt: admin.firestore.FieldValue.serverTimestamp()
      });
    }
    
    return isValid;
  }
}

module.exports = new FirestoreService();
