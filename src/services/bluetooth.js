// Bluetooth Low Energy Service for VibeLedger
import { BleManager, Device, State } from 'react-native-ble-plx';
import { PermissionsAndroid, Platform, Alert } from 'react-native';

class BluetoothService {
  constructor() {
    this.manager = new BleManager();
    this.devices = new Map();
    this.isScanning = false;
    this.scanSubscription = null;
  }

  // Initialize BLE manager
  async init() {
    return new Promise((resolve, reject) => {
      const subscription = this.manager.onStateChange((state) => {
        console.log('🔵 BLE State changed:', state);
        if (state === State.PoweredOn) {
          subscription.remove();
          resolve(state);
        } else if (state === State.PoweredOff) {
          reject(new Error('Bluetooth is turned off'));
        }
      }, true);
    });
  }

  // Request necessary permissions for Android
  async requestPermissions() {
    if (Platform.OS === 'android') {
      try {
        console.log('📱 Requesting Android Bluetooth permissions...');
        
        const permissions = [
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.ACCESS_COARSE_LOCATION,
        ];

        // For Android 12 and above
        if (Platform.Version >= 31) {
          permissions.push(
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
            PermissionsAndroid.PERMISSIONS.BLUETOOTH_ADVERTISE
          );
        }

        const granted = await PermissionsAndroid.requestMultiple(permissions);
        
        const allGranted = Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED
        );

        if (!allGranted) {
          throw new Error('Bluetooth permissions not granted');
        }

        console.log('✅ All Bluetooth permissions granted');
        return true;
      } catch (error) {
        console.error('❌ Permission request failed:', error);
        throw error;
      }
    }
    return true;
  }

  // Start scanning for BLE devices
  async startScan(onDeviceFound, onError) {
    try {
      console.log('🔍 Starting BLE scan...');
      
      // Request permissions first
      await this.requestPermissions();
      
      // Initialize BLE if not already done
      await this.init();
      
      // Clear previous devices
      this.devices.clear();
      
      // Start scanning
      this.isScanning = true;
      this.scanSubscription = this.manager.startDeviceScan(
        null, // Service UUIDs (null = scan for all)
        {
          allowDuplicates: false,
          scanMode: 'balanced', // balanced, lowPower, lowLatency
          callbackType: 'allMatches'
        },
        (error, device) => {
          if (error) {
            console.error('❌ BLE Scan error:', error);
            this.isScanning = false;
            onError(error);
            return;
          }

          if (device && device.name) {
            console.log('📡 Found device:', {
              id: device.id,
              name: device.name,
              rssi: device.rssi,
              isConnectable: device.isConnectable
            });

            // Store device
            this.devices.set(device.id, {
              id: device.id,
              name: device.name,
              rssi: device.rssi,
              isConnectable: device.isConnectable,
              serviceUUIDs: device.serviceUUIDs || [],
              manufacturerData: device.manufacturerData,
              localName: device.localName,
              timestamp: Date.now()
            });

            // Notify callback
            onDeviceFound(Array.from(this.devices.values()));
          }
        }
      );

      // Auto-stop scan after 30 seconds
      setTimeout(() => {
        if (this.isScanning) {
          this.stopScan();
        }
      }, 30000);

    } catch (error) {
      console.error('❌ Failed to start BLE scan:', error);
      this.isScanning = false;
      onError(error);
    }
  }

  // Stop scanning
  stopScan() {
    if (this.isScanning && this.scanSubscription) {
      console.log('⏹️ Stopping BLE scan...');
      this.manager.stopDeviceScan();
      this.isScanning = false;
      this.scanSubscription = null;
    }
  }

  // Connect to a device
  async connectToDevice(deviceId) {
    try {
      console.log('🔗 Connecting to device:', deviceId);
      
      const device = await this.manager.connectToDevice(deviceId);
      console.log('✅ Connected to:', device.name);
      
      // Discover services and characteristics
      const deviceWithServices = await device.discoverAllServicesAndCharacteristics();
      console.log('🔍 Services discovered for:', device.name);
      
      return deviceWithServices;
    } catch (error) {
      console.error('❌ Connection failed:', error);
      throw error;
    }
  }

  // Disconnect from device
  async disconnectDevice(deviceId) {
    try {
      console.log('🔌 Disconnecting from device:', deviceId);
      await this.manager.cancelDeviceConnection(deviceId);
      console.log('✅ Disconnected from device');
    } catch (error) {
      console.error('❌ Disconnection failed:', error);
      throw error;
    }
  }

  // Get current scanning status
  getIsScanning() {
    return this.isScanning;
  }

  // Get discovered devices
  getDevices() {
    return Array.from(this.devices.values());
  }

  // Cleanup
  destroy() {
    this.stopScan();
    this.manager.destroy();
  }
}

// Export singleton instance
const bluetoothService = new BluetoothService();
export default bluetoothService;
