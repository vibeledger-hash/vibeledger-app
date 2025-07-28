# MicroShield Payments — Key Code Snippets

---

## BLE Scanning (react-native-ble-plx)
```typescript
import { BleManager } from 'react-native-ble-plx';
const manager = new BleManager();

manager.startDeviceScan(null, null, (error, device) => {
  if (error) return;
  if (device && device.name?.includes('Merchant')) {
    // Show connect button
  }
});
```

---

## OTP Request (API call)
```typescript
import axios from 'axios';
export const requestOTP = async (phone: string) => {
  return axios.post('/api/auth/request-otp', { phone });
};
```

---

## JWT Session Handling
```typescript
import AsyncStorage from '@react-native-async-storage/async-storage';
export const saveToken = async (token: string) => {
  await AsyncStorage.setItem('jwt', token);
};
export const getToken = async () => {
  return AsyncStorage.getItem('jwt');
};
```

---

## Offline Sync (SQLite + API)
```typescript
import SQLite from 'react-native-sqlite-storage';
import axios from 'axios';
const db = SQLite.openDatabase({ name: 'microshield.db' });

export const syncPending = async () => {
  db.transaction(tx => {
    tx.executeSql('SELECT * FROM pending_transactions WHERE status = ?', ['PendingSync'], async (_, { rows }) => {
      for (let i = 0; i < rows.length; i++) {
        const txData = rows.item(i);
        try {
          await axios.post('/api/transaction/sync', txData);
          // Mark as Synced
        } catch {}
      }
    });
  });
};
```

---

## AES Encryption (local logs)
```typescript
import CryptoJS from 'crypto-js';
export const encrypt = (data: string, key: string) => {
  return CryptoJS.AES.encrypt(data, key).toString();
};
export const decrypt = (cipher: string, key: string) => {
  return CryptoJS.AES.decrypt(cipher, key).toString(CryptoJS.enc.Utf8);
};
```
