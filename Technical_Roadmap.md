# MicroShield Payments — Technical Roadmap & Sprint Plan

---

## Phase 1: Foundation (Week 1-2)
- Set up React Native project & folder structure
- Integrate navigation, basic screens (Wallet, OTP, BLE, QR)
- Set up AWS backend (Lambda, API Gateway, RDS)
- Implement user registration, OTP, JWT auth

## Phase 2: Core Features (Week 3-4)
- BLE scanning & merchant discovery
- QR code scanning
- Wallet balance & transaction history UI
- Payment initiation & confirmation (live mode)
- SQLite local storage for offline queue

## Phase 3: Offline & Sync (Week 5-6)
- Offline transaction queueing
- Sync service (background fetch)
- AES encryption for local logs
- Conflict resolution & deduplication logic

## Phase 4: UX & Polish (Week 7-8)
- Lottie animations (success, trust score)
- Error handling, edge cases (BLE, OTP, sync)
- Push notifications (success, sync)
- Settings: offline cap, trusted contacts

## Phase 5: Testing & Launch (Week 9-10)
- Device/BLE compatibility testing
- Security audit (local storage, JWT, API)
- Free-tier usage monitoring & cost alerts
- Prepare docs, pitch deck, and launch MVP

---

# Milestones
- [ ] App skeleton & backend live
- [ ] BLE/QR working
- [ ] Payments (live & offline)
- [ ] Sync & encryption
- [ ] UX polish & launch
