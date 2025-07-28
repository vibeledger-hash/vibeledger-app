// SQLite connection setup for React Native frontend
import SQLite from 'react-native-sqlite-storage';

SQLite.enablePromise(true);

const dbName = 'microshield.db';

export const getDBConnection = async () => {
  try {
    const db = await SQLite.openDatabase({ name: dbName, location: 'default' });
    return db;
  } catch (error) {
    console.error('Failed to open SQLite DB:', error);
    throw error;
  }
};

export const closeDBConnection = async (db) => {
  if (db) {
    try {
      await db.close();
    } catch (error) {
      console.error('Failed to close SQLite DB:', error);
    }
  }
};

export const createTables = async (db) => {
  // Wallet cache table
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS wallet_cache (
      user_id TEXT PRIMARY KEY,
      balance REAL,
      updated_at TEXT
    );
  `);
  // Pending transactions table
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS pending_transactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      uuid TEXT,
      merchant_id TEXT,
      amount REAL,
      status TEXT,
      created_at TEXT,
      encrypted_blob TEXT
    );
  `);
};
