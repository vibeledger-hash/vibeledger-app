# 🛡️ MicroShield Payments — Project Specification

## 📌 Overview
MicroShield Payments is a secure, offline-capable mobile payment system. It’s designed to support low-connectivity zones using Bluetooth proximity, OTP-based verification, and JWT-backed sessions—with a front-end built in React Native, proximity handled via Android BLE, and backend services hosted on AWS.

## 🧱 System Architecture
| Layer            | Technology                        | Purpose                                   |
|------------------|-----------------------------------|-------------------------------------------|
| Frontend         | React Native                      | UI for wallet, QR scanning, confirmations |
| Backend          | AWS Lambda (Node.js) + API Gateway| Stateless payment processing & sync logic |
| Local Storage    | SQLite (mobile)                   | Offline transaction caching               |
| Cloud Database   | Amazon RDS (PostgreSQL)           | Wallet, transaction history, user metadata|
| Authentication   | JWT + OTP via GCM (Firebase)          | Session control, payment authorization    |
| Bluetooth        | Android BLE (Java/Kotlin)         | Merchant/user discovery                   |
| Hosting          | AWS S3, AWS Lambda                | Scalable, low-cost deployment             |

## 🔐 Core Features
- OTP verification for every transaction
- JWT session token management
- Bluetooth-based merchant/user presence detection
- Offline transaction sync queue
- AES-256 encrypted local log storage
- UI confirmation animations + trust-feedback visuals

## 🔄 Transaction Flow (Live Mode)
1. User scans merchant QR or pairs via BLE
2. Inputs payment amount
3. OTP is sent and verified via GCM (Firebase Cloud Messaging)
4. JWT session token is issued
5. Transaction is processed via AWS Lambda API
6. PostgreSQL database is updated
7. UI renders success animation + push notification sent

## 💾 Offline Transaction Flow
1. Device detects proximity via BLE (merchant presence)
2. Transaction stored locally in SQLite with status PendingSync
3. OTP skipped or performed via SMS (if GSM available)
4. When reconnected: App triggers sync service → sends logs to cloud
5. Server verifies and stores transaction
6. Entry marked as Synced

## 📶 Android BLE Integration
- BLE Permissions in manifest
- BLE Scanning using BluetoothLeScanner
- GATT connection for optional data exchange
- Signal strength used for proximity thresholds

## 🛠️ AWS Deployment Notes
- AWS Lambda handles secure stateless transactions
- AWS API Gateway routes requests from mobile frontend
- PostgreSQL on RDS stores wallet and logs
- GCM (Firebase Cloud Messaging) used for OTP delivery and push notifications
- AWS S3 hosts static React frontend if needed for web access

## 🎨 UX Elements
- Success vault-lock animation after payment
- Transaction badge with “Trust Score” or vibe icon
- Visual countdown timer for OTP entry
- QR codes generated with avatars or merchant logos

## 📈 Optimization & Cost Control
- Serverless backend stays within AWS free tier
- BLE reduces dependency on data for proximity transactions
- SQLite caching minimizes real-time DB use
- JWT tokens reduce session management cost

## 🔗 Integration Possibilities
- Add Stripe, Razorpay, or PayPal via backend microservices
- Layer on invoice module or loyalty features
- Extend wallet to support pooled payments or tips

---

# 🆓 Free-Tier Services List

## 🖥️ Frontend Hosting (React Native)
| Service      | Free Tier Details                                 |
|--------------|---------------------------------------------------|
| Vercel       | 100GB bandwidth/month, 1GB build cache            |
| Netlify      | 100GB bandwidth/month, 300 build minutes/month    |
| GitHub Pages | Unlimited public hosting for static sites         |

## ☁️ Backend & Cloud (AWS)
| Service         | Free Tier Details                                 |
|-----------------|---------------------------------------------------|
| AWS Lambda      | 1M requests/month + 3.2M seconds compute/month    |
| Amazon API GW   | 1M API calls/month (12-month free tier)           |
| Amazon RDS      | 750 hours/month for 12 months + 20GB storage      |
| GCM (Firebase Cloud Messaging) | Free push notifications and messaging via Firebase |
| Amazon S3       | 5GB storage + 15GB data transfer/month (12 mo)    |

## 📲 OTP & Messaging
| Service   | Free Tier Details                                      |
|-----------|--------------------------------------------------------|
| Twilio    | $15.50 trial credit + 100 emails/day via SendGrid      |  <!-- Deprecated: now using GCM (Firebase) -->
| Firebase  | Free Spark plan includes SMS via Firebase Auth         |

## 📡 Bluetooth Integration (Android BLE)
| Service         | Free Tier Details                                 |
|-----------------|---------------------------------------------------|
| Android BLE API | Fully free via Android SDK                        |
| BLE Libraries   | Open-source options like Nordic BLE Library        |

## 🗃️ Local Storage (Offline Mode)
| Service   | Free Tier Details                                      |
|-----------|--------------------------------------------------------|
| SQLite    | Free, embedded database (no hosting needed)            |
| IndexedDB | Free browser-native storage for offline caching        |

## ✅ Bonus: Development Tools
| Tool         | Free Tier Details                                   |
|--------------|-----------------------------------------------------|
| GitHub       | Unlimited public repos, GitHub Actions CI/CD        |
| Render       | 750 build minutes/month + 100GB bandwidth           |
| Firebase     | 10GB bandwidth/month + 1GB storage                  |

---

# 💡 Recommended Free-Tier Deployment Plan

## 🖥️ Frontend (React Native)
- Host on Vercel
- Add GitHub integration for CI/CD
- Use environment variables to keep keys safe

## ☁️ Backend (AWS)
- Use AWS Lambda + API Gateway
- Use GCM (Firebase Cloud Messaging) for OTP and push notifications

## 🗃️ Database
- PostgreSQL on Amazon RDS (free tier)
- SQLite (Mobile App) for local transaction queue

## 📶 Bluetooth Proximity
- Android BLE SDK (native and free)
- Implement scanning via BluetoothLeScanner

## 🔐 Authentication
- JWT: No cost (handled on backend)
- AES Encryption (local logs): Use native libs for encryption at rest

## 📈 Monitoring & Cost Tips
- Use AWS CloudWatch for basic logs (free-tier included)
- Set usage alerts so you don’t exceed free limits
- Minimize payload sizes and cache wallet data locally to reduce API calls
- Defer large syncs to off-peak hours for better performance

---

# 📱 React Native Frontend Overview

## 🔧 Key Components
- QR Scan Module: react-native-camera or react-native-qrcode-scanner
- Bluetooth Proximity: react-native-ble-plx
- Offline Caching: react-native-sqlite-storage
- OTP UI: Clean screens for OTP entry and countdown (React Native Timer/Lottie)
- Wallet Interface: Custom screens for balance, history, and animated confirmation

## 🔁 Mobile Flow Adjustment
| Step                | Tech Used                                 |
|---------------------|-------------------------------------------|
| Scan Merchant/BLE   | react-native-ble-plx / QR scanner         |
| OTP Entry/Verify    | UI + API via GCM (Firebase Cloud Messaging)               |
| Wallet Adjustment   | API call via AWS Lambda + sync to RDS     |
| Offline Logging     | SQLite local storage                      |
| Sync Trigger        | Background Task (react-native-background-fetch) |

## 🛠️ Updated Architecture (React Native-Optimized)
| Layer      | Tech Stack                                 |
|------------|--------------------------------------------|
| Frontend   | React Native + BLE + SQLite                |
| Backend    | AWS Lambda + API Gateway                   |
| Auth       | JWT + OTP via GCM (Firebase)               |
| Database   | PostgreSQL (cloud) + SQLite (offline)      |
| Hosting    | AWS (entire stack stays free tier-friendly)|

## ✅ Developer Perks
- Single codebase for iOS and Android
- Native access to BLE, local storage, and device sensors
- Fast animations via Lottie and fluid UI transitions
- Seamless integration with AWS services via Amplify or direct REST

---

# ⚠️ Drawbacks & Mitigation Strategies

## Technical & Infrastructure Challenges
- Offline sync complexity: Use event-based sync, UUID+hash, conflict resolution
- BLE instability: Device checks, tune RSSI, QR fallback
- Local storage risks: AES encryption, auto-expiry, remote wipe

## User Experience Concerns
- OTP fatigue: Group micro-payments, trusted contacts, biometrics
- Bluetooth confusion: Onboarding animations, smart prompts, manual fallback
- Offline cap: User-set caps, trust scores, alerts

## Market & Adoption Hurdles
- Merchant BLE onboarding: Plug-and-play dongles, companion app, POS partnerships
- Overlap with existing systems: Highlight offline/BLE, integrate with wallets
- Regulatory compliance: Monitor and adapt to local laws

## Developer Complexity
- Stack diversity: Modularize, CI/CD, internal docs
- Debugging sync: Log tracing, manual retry, admin dashboard

---

# 🗂️ Next Steps
- Folder structure
- Wireframes
- API endpoints & DB schema
- Code snippets
- Roadmap
- Architecture diagram
