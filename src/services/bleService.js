// BLE Service: Handles BLE scanning and connections
import { BleManager } from 'react-native-ble-plx';

const manager = new BleManager();

export const startScan = (onDeviceFound) => {
  manager.startDeviceScan(null, null, (error, device) => {
    if (error) return;
    if (device) onDeviceFound(device);
  });
};

export const stopScan = () => {
  manager.stopDeviceScan();
};
