# MicroShield Payments — React Native App Structure

```
VibeLedgerApp/
├── App.tsx
├── package.json
├── /src
│   ├── /components
│   │   ├── WalletScreen.tsx
│   │   ├── OTPEntryScreen.tsx
│   │   ├── BLEPairingScreen.tsx
│   │   ├── QRScannerScreen.tsx
│   │   ├── TransactionHistoryScreen.tsx
│   │   └── SuccessAnimation.tsx
│   ├── /services
│   │   ├── bleService.ts
│   │   ├── otpService.ts
│   │   ├── jwtService.ts
│   │   ├── apiService.ts
│   │   ├── syncService.ts
│   │   └── storageService.ts
│   ├── /utils
│   │   ├── encryption.ts
│   │   └── helpers.ts
│   ├── /db
│   │   └── schema.ts
│   ├── /assets
│   │   ├── images/
│   │   └── animations/
│   └── navigation.tsx
├── /__tests__
│   └── ...
└── README.md
```

- `components/`: UI screens and reusable components
- `services/`: BLE, OTP, JWT, API, sync, and storage logic
- `utils/`: Encryption and helper functions
- `db/`: SQLite schema and DB helpers
- `assets/`: Images, Lottie animations, etc.
- `navigation.tsx`: React Navigation setup
