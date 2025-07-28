import React, { useEffect, useState, useRef } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  FlatList, 
  Alert,
  ActivityIndicator,
  PermissionsAndroid,
  Platform
} from 'react-native';
import { BleManager } from 'react-native-ble-plx';
import { bleApi } from '../services/bleApiService';

const BLEPairingScreen = ({ navigation }) => {
  const [nearbyMerchants, setNearbyMerchants] = useState([]);
  const [bleDevices, setBleDevices] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [connectedDeviceId, setConnectedDeviceId] = useState(null);
  const [location, setLocation] = useState(null);
  const manager = useRef(new BleManager()).current;

  useEffect(() => {
    requestPermissions();
    getCurrentLocation();
    discoverNearbyMerchants();
    
    return () => {
      stopScanning();
      manager.destroy();
    };
  }, []);

  // Request necessary permissions
  const requestPermissions = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.requestMultiple([
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
          PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        ]);
        
        const allPermissionsGranted = Object.values(granted).every(
          permission => permission === PermissionsAndroid.RESULTS.GRANTED
        );
        
        if (!allPermissionsGranted) {
          Alert.alert(
            'Permissions Required',
            'Bluetooth and location permissions are required for merchant discovery'
          );
        }
      } catch (error) {
        console.error('Permission request error:', error);
      }
    }
  };

  // Get current location (placeholder - implement with react-native-geolocation-service)
  const getCurrentLocation = () => {
    // For now, use a default location (NYC)
    setLocation({ latitude: 40.7128, longitude: -74.0060 });
  };

  // Discover merchants via backend API
  const discoverNearbyMerchants = async () => {
    try {
      const result = await bleApi.discoverMerchants({
        latitude: location?.latitude,
        longitude: location?.longitude,
        radius: 2, // 2km radius
        limit: 10
      });
      
      if (result.success) {
        setNearbyMerchants(result.data.merchants);
      } else {
        console.warn('Failed to discover merchants:', result.error);
      }
    } catch (error) {
      console.error('Merchant discovery error:', error);
    }
  };

  // Start BLE scanning
  const startScanning = async () => {
    try {
      setScanning(true);
      setBleDevices([]);
      
      const state = await manager.state();
      if (state !== 'PoweredOn') {
        Alert.alert('Bluetooth', 'Please turn on Bluetooth to discover merchants');
        setScanning(false);
        return;
      }

      manager.startDeviceScan(null, null, (error, device) => {
        if (error) {
          console.error('BLE scan error:', error);
          setScanning(false);
          return;
        }

        if (device && device.name && device.name.includes('MicroShield')) {
          setBleDevices(prevDevices => {
            const exists = prevDevices.find(d => d.id === device.id);
            if (!exists) {
              return [...prevDevices, {
                id: device.id,
                name: device.name,
                rssi: device.rssi,
                device: device
              }];
            }
            return prevDevices;
          });
        }
      });

      // Stop scanning after 15 seconds
      setTimeout(() => {
        stopScanning();
      }, 15000);

    } catch (error) {
      console.error('Failed to start BLE scan:', error);
      setScanning(false);
    }
  };

  // Stop BLE scanning
  const stopScanning = () => {
    manager.stopDeviceScan();
    setScanning(false);
  };

  // Connect to BLE device and verify merchant
  const connectToDevice = async (deviceInfo) => {
    try {
      setConnecting(true);
      const device = await manager.connectToDevice(deviceInfo.id);
      await device.discoverAllServicesAndCharacteristics();
      
      // Read merchant ID from BLE device (customize based on your BLE service)
      const services = await device.services();
      let merchantBleId = null;
      
      for (const service of services) {
        const characteristics = await service.characteristics();
        for (const char of characteristics) {
          if (char.isReadable) {
            try {
              const value = await char.read();
              merchantBleId = atob(value.value); // Decode base64
              break;
            } catch (readError) {
              console.warn('Failed to read characteristic:', readError);
            }
          }
        }
        if (merchantBleId) break;
      }

      if (merchantBleId) {
        // Verify merchant with backend
        const result = await bleApi.verifyMerchantByBLE(merchantBleId);
        if (result.success) {
          setConnectedDeviceId(device.id);
          Alert.alert(
            'Connected!',
            `Connected to ${result.data.merchant.name}`,
            [
              {
                text: 'Make Payment',
                onPress: () => navigation.navigate('PaymentScreen', {
                  merchant: result.data.merchant,
                  paymentMethod: 'ble'
                })
              },
              {
                text: 'OK',
                style: 'cancel'
              }
            ]
          );
        } else {
          Alert.alert('Verification Failed', result.error);
          await device.cancelConnection();
        }
      } else {
        Alert.alert('Error', 'Could not read merchant information from device');
        await device.cancelConnection();
      }
    } catch (error) {
      console.error('BLE connection error:', error);
      Alert.alert('Connection Failed', 'Could not connect to the merchant device');
    } finally {
      setConnecting(false);
    }
  };

  // Navigate to payment with selected merchant
  const payToMerchant = (merchant) => {
    navigation.navigate('PaymentScreen', {
      merchant,
      paymentMethod: 'api'
    });
  };

  // Render merchant item
  const renderMerchantItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.merchantCard}
      onPress={() => payToMerchant(item)}
    >
      <View style={styles.merchantInfo}>
        <Text style={styles.merchantName}>{item.name}</Text>
        <Text style={styles.merchantAddress}>{item.address}</Text>
        <Text style={styles.merchantDistance}>
          {item.distance ? `${item.distance.toFixed(2)} km away` : 'Location unknown'}
        </Text>
      </View>
      <View style={styles.payButton}>
        <Text style={styles.payButtonText}>Pay</Text>
      </View>
    </TouchableOpacity>
  );

  // Render BLE device item
  const renderBleDeviceItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.bleDeviceCard}
      onPress={() => connectToDevice(item)}
      disabled={connecting}
    >
      <View style={styles.deviceInfo}>
        <Text style={styles.deviceName}>{item.name}</Text>
        <Text style={styles.deviceId}>ID: {item.id}</Text>
        <Text style={styles.deviceRssi}>Signal: {item.rssi} dBm</Text>
      </View>
      {connectedDeviceId === item.id ? (
        <View style={styles.connectedIndicator}>
          <Text style={styles.connectedText}>Connected</Text>
        </View>
      ) : (
        <View style={styles.connectButton}>
          <Text style={styles.connectButtonText}>
            {connecting ? 'Connecting...' : 'Connect'}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Discover Merchants</Text>
        <Text style={styles.subtitle}>Connect via Bluetooth or choose from nearby merchants</Text>
      </View>

      {/* Scanning Controls */}
      <View style={styles.scanSection}>
        <View style={styles.scanButtons}>
          <TouchableOpacity 
            style={[styles.scanButton, scanning && styles.scanButtonActive]}
            onPress={scanning ? stopScanning : startScanning}
            disabled={connecting}
          >
            <Text style={[styles.scanButtonText, scanning && styles.scanButtonTextActive]}>
              {scanning ? 'Stop Scanning' : 'Scan for Devices'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.refreshButton}
            onPress={discoverNearbyMerchants}
          >
            <Text style={styles.refreshButtonText}>Refresh Merchants</Text>
          </TouchableOpacity>
        </View>
        {scanning && (
          <View style={styles.scanningIndicator}>
            <ActivityIndicator size="small" color="#007AFF" />
            <Text style={styles.scanningText}>Scanning for BLE devices...</Text>
          </View>
        )}
      </View>

      {/* BLE Devices Section */}
      {bleDevices.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available BLE Devices</Text>
          <FlatList
            data={bleDevices}
            keyExtractor={item => item.id}
            renderItem={renderBleDeviceItem}
            style={styles.deviceList}
            showsVerticalScrollIndicator={false}
          />
        </View>
      )}

      {/* Nearby Merchants Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Nearby Merchants</Text>
        <FlatList
          data={nearbyMerchants}
          keyExtractor={item => item.id.toString()}
          renderItem={renderMerchantItem}
          ListEmptyComponent={
            <View style={styles.emptyState}>
              <Text style={styles.emptyText}>No merchants found nearby</Text>
              <Text style={styles.emptySubtext}>Try scanning for BLE devices or check your location</Text>
            </View>
          }
          style={styles.merchantList}
          showsVerticalScrollIndicator={false}
        />
      </View>

      {/* Alternative Options */}
      <View style={styles.alternativeSection}>
        <TouchableOpacity 
          style={styles.qrButton}
          onPress={() => navigation.navigate('QRScannerScreen')}
        >
          <Text style={styles.qrButtonText}>Scan QR Code Instead</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#212529',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: '#6c757d',
  },
  scanSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  scanButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  scanButton: {
    flex: 1,
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginRight: 10,
  },
  scanButtonActive: {
    backgroundColor: '#dc3545',
  },
  scanButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  scanButtonTextActive: {
    color: '#fff',
  },
  refreshButton: {
    backgroundColor: '#28a745',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
  },
  scanningIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  scanningText: {
    marginLeft: 10,
    color: '#007AFF',
    fontWeight: '500',
  },
  section: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 15,
  },
  merchantCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  merchantInfo: {
    flex: 1,
  },
  merchantName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  merchantAddress: {
    fontSize: 14,
    color: '#6c757d',
    marginBottom: 2,
  },
  merchantDistance: {
    fontSize: 12,
    color: '#007AFF',
  },
  payButton: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  payButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  bleDeviceCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#212529',
    marginBottom: 4,
  },
  deviceId: {
    fontSize: 12,
    color: '#6c757d',
    marginBottom: 2,
  },
  deviceRssi: {
    fontSize: 12,
    color: '#007AFF',
  },
  connectButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  connectButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  connectedIndicator: {
    backgroundColor: '#28a745',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  connectedText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#6c757d',
    marginBottom: 8,
  },
  emptySubtext: {
    fontSize: 14,
    color: '#adb5bd',
    textAlign: 'center',
  },
  alternativeSection: {
    padding: 20,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
  },
  qrButton: {
    backgroundColor: '#6c757d',
    paddingVertical: 14,
    borderRadius: 8,
  },
  qrButtonText: {
    color: '#fff',
    fontWeight: '600',
    textAlign: 'center',
    fontSize: 16,
  },
  deviceList: {
    maxHeight: 200,
  },
  merchantList: {
    flex: 1,
  },
});

export default BLEPairingScreen;
