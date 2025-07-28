// Storage Service: Handles local storage for wallet and transactions
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'microshield.db' });

export const saveWalletCache = (userId, balance) => {
  db.transaction(tx => {
    tx.executeSql(
      'REPLACE INTO wallet_cache (user_id, balance, updated_at) VALUES (?, ?, ?)',
      [userId, balance, new Date().toISOString()]
    );
  });
};

export const getWalletCache = (userId, callback) => {
  db.transaction(tx => {
    tx.executeSql(
      'SELECT balance FROM wallet_cache WHERE user_id = ?',
      [userId],
      (_, { rows }) => {
        if (rows.length > 0) callback(rows.item(0).balance);
        else callback(null);
      }
    );
  });
};
