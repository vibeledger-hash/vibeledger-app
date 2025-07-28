import React, { useState } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  TextInput,
  Modal,
  ActivityIndicator
} from 'react-native';
import { bleApi } from '../services/bleApiService';
import { transactionApi } from '../services/transactionApiService';

const QRScannerScreen = ({ navigation }) => {
  const [scannedData, setScannedData] = useState('');
  const [showManualEntry, setShowManualEntry] = useState(false);
  const [manualQR, setManualQR] = useState('');
  const [loading, setLoading] = useState(false);

  // Handle QR code scan (placeholder for actual camera integration)
  const onQRCodeScanned = async (data) => {
    setScannedData(data);
    await verifyAndProceed(data);
  };

  // Verify merchant and proceed to payment
  const verifyAndProceed = async (qrCode) => {
    setLoading(true);
    try {
      const result = await bleApi.verifyMerchantByQR(qrCode);
      if (result.success) {
        // Navigate to payment screen with merchant data
        navigation.navigate('PaymentScreen', {
          merchant: result.data.merchant,
          paymentMethod: 'qr'
        });
      } else {
        Alert.alert('Invalid QR Code', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to verify merchant QR code');
    } finally {
      setLoading(false);
    }
  };

  // Handle manual QR entry
  const handleManualEntry = async () => {
    if (!manualQR.trim()) {
      Alert.alert('Error', 'Please enter a QR code');
      return;
    }
    setShowManualEntry(false);
    await verifyAndProceed(manualQR.trim());
    setManualQR('');
  };

  // Navigate to BLE pairing
  const navigateToBLE = () => {
    navigation.navigate('BLEPairingScreen');
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Scan to Pay</Text>
        <Text style={styles.subtitle}>Point your camera at the merchant's QR code</Text>
      </View>

      <View style={styles.cameraContainer}>
        <View style={styles.cameraView}>
          {loading ? (
            <ActivityIndicator size="large" color="#007AFF" />
          ) : (
            <>
              <Text style={styles.cameraPlaceholder}>📷</Text>
              <Text style={styles.cameraText}>QR Camera View</Text>
              <Text style={styles.cameraSubtext}>
                {scannedData ? `Scanned: ${scannedData}` : 'Align QR code within frame'}
              </Text>
            </>
          )}
        </View>
        
        {/* QR code frame overlay */}
        <View style={styles.overlay}>
          <View style={styles.topLeft} />
          <View style={styles.topRight} />
          <View style={styles.bottomLeft} />
          <View style={styles.bottomRight} />
        </View>
      </View>

      <View style={styles.actionButtons}>
        <TouchableOpacity 
          style={styles.actionButton} 
          onPress={() => setShowManualEntry(true)}
        >
          <Text style={styles.actionButtonText}>Enter Code Manually</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.actionButton, styles.bleButton]} 
          onPress={navigateToBLE}
        >
          <Text style={styles.actionButtonText}>Use Bluetooth</Text>
        </TouchableOpacity>
      </View>

      {/* Manual Entry Modal */}
      <Modal
        visible={showManualEntry}
        transparent
        animationType="slide"
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Enter QR Code</Text>
            <TextInput
              style={styles.textInput}
              value={manualQR}
              onChangeText={setManualQR}
              placeholder="Paste or type QR code here"
              multiline
              numberOfLines={3}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]} 
                onPress={() => {
                  setShowManualEntry(false);
                  setManualQR('');
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalButton, styles.confirmButton]} 
                onPress={handleManualEntry}
                disabled={loading}
              >
                <Text style={styles.confirmButtonText}>
                  {loading ? 'Verifying...' : 'Verify'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: '#000',
  },
  header: {
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#000',
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255,255,255,0.7)',
    textAlign: 'center',
  },
  cameraContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  cameraView: { 
    width: 280, 
    height: 280, 
    backgroundColor: '#1a1a1a', 
    justifyContent: 'center', 
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 2,
    borderColor: '#007AFF',
  },
  cameraPlaceholder: {
    fontSize: 60,
    marginBottom: 16,
  },
  cameraText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  cameraSubtext: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 20,
  },
  overlay: {
    position: 'absolute',
    width: 280,
    height: 280,
  },
  topLeft: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#00FF88',
  },
  topRight: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 30,
    height: 30,
    borderTopWidth: 4,
    borderRightWidth: 4,
    borderColor: '#00FF88',
  },
  bottomLeft: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    borderColor: '#00FF88',
  },
  bottomRight: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 30,
    height: 30,
    borderBottomWidth: 4,
    borderRightWidth: 4,
    borderColor: '#00FF88',
  },
  actionButtons: {
    padding: 20,
    backgroundColor: '#000',
  },
  actionButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  bleButton: {
    backgroundColor: '#34C759',
  },
  actionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.8)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    minWidth: '80%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    textAlign: 'center',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 6,
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#f0f0f0',
  },
  confirmButton: {
    backgroundColor: '#007AFF',
  },
  cancelButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default QRScannerScreen;
