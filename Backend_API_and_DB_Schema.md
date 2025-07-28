# MicroShield Payments — Backend API Endpoints & Database Schema

---

## API Endpoints (Google Cloud Functions + API Gateway)

### Auth & OTP
- `POST /api/auth/request-otp` — Request OTP for phone number (via Firebase Auth/GCM)
- `POST /api/auth/verify-otp` — Verify OTP and issue JWT (via Firebase Auth)

### Wallet
- `GET /api/wallet/balance` — Get wallet balance (JWT required)
- `GET /api/wallet/history` — Get transaction history (JWT required)

### Transaction
- `POST /api/transaction/initiate` — Start a payment (JWT required)
- `POST /api/transaction/confirm` — Confirm payment with OTP/JWT
- `POST /api/transaction/sync` — Sync offline transactions (JWT required)

### BLE
- `POST /api/ble/register` — Register merchant BLE beacon
- `POST /api/ble/discover` — Discover nearby merchants (JWT required)

---

## Database Schema (Cloud SQL / Firestore)

### users
| id (PK) | phone_number | created_at | trust_score |

### wallets
| id (PK) | user_id (FK) | balance | updated_at |

### transactions
| id (PK) | user_id (FK) | merchant_id (FK) | amount | status | created_at | synced_at | uuid |

### merchants
| id (PK) | name | ble_id | qr_code | created_at |

### otps
| id (PK) | user_id (FK) | otp_code | expires_at | verified |

---

## SQLite (Mobile)
- `pending_transactions` (id, uuid, merchant_id, amount, status, created_at, encrypted_blob)
- `wallet_cache` (user_id, balance, updated_at)

---

# Notes
- All endpoints require JWT except OTP requests
- Use UUID for offline transaction deduplication
- Store encrypted blobs for sensitive data in SQLite
- Google Cloud Functions replace AWS Lambda; Firebase Auth/GCM for OTP and notifications; Cloud SQL or Firestore for database
