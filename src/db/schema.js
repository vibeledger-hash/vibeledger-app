// SQLite schema for wallet and transactions
export const createTables = `
CREATE TABLE IF NOT EXISTS wallet_cache (
  user_id TEXT PRIMARY KEY,
  balance REAL,
  updated_at TEXT
);

CREATE TABLE IF NOT EXISTS pending_transactions (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  uuid TEXT,
  merchant_id TEXT,
  amount REAL,
  status TEXT,
  created_at TEXT,
  encrypted_blob TEXT
);
`;
