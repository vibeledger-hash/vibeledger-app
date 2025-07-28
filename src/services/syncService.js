// Sync Service: Handles syncing offline transactions
import SQLite from 'react-native-sqlite-storage';
import api from './apiService';

const db = SQLite.openDatabase({ name: 'microshield.db' });

export const syncPending = async () => {
  db.transaction(tx => {
    tx.executeSql('SELECT * FROM pending_transactions WHERE status = ?', ['PendingSync'], async (_, { rows }) => {
      for (let i = 0; i < rows.length; i++) {
        const txData = rows.item(i);
        try {
          await api.post('/api/transaction/sync', txData);
          // Mark as Synced
        } catch {}
      }
    });
  });
};
