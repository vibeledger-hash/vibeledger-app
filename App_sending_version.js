/**
 * VibeLedger App
 * Secure mobile payment system with BLE integration
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TextInp  const renderWalletScreen = () => {
    const features = [
      { id: 'receive', label: 'Receive Payment', icon: '💰', color: '#4CAF50' },
      { id: 'history', label: 'Sales History', icon: '📊', color: '#2196F3' },
      { id: 'ble', label: 'BLE Pairing', icon: '📱', color: '#FF9800' },
      { id: 'logout', label: 'Logout', icon: '🚪', color: '#f44336' }
    ];TouchableOpacity, 
  StyleSheet, 
  StatusBar,
  Animated,
  Dimensions
} from 'react-native';

function App() {
  // All state hooks at the top level - following Rules of Hooks
  const [currentScreen, setCurrentScreen] = useState('otp');
  const [otp, setOtp] = useState('');
  const [phoneNumber] = useState('+1234567890');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [demoMessage, setDemoMessage] = useState('');
  const [balance, setBalance] = useState('0.00');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successData, setSuccessData] = useState({ amount: '', recipient: '' });
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (currentScreen === 'wallet') {
      setBalance('1247.83');
    } else {
      setBalance('0.00');
    }
  }, [currentScreen]);

  // Simple success animation - no additional hooks in component
  const SuccessAnimation = ({ amount, recipient, visible, onComplete }) => {
    useEffect(() => {
      if (visible) {
        // Auto dismiss after 3 seconds
        const timer = setTimeout(() => {
          onComplete();
        }, 3000);
        return () => clearTimeout(timer);
      }
    }, [visible, onComplete]);

    if (!visible) return null;

    return (
      <View style={styles.successAnimationContainer}>
        <View style={styles.successContent}>
          <Text style={styles.checkMark}>✓</Text>
          <Text style={styles.successTitle}>Money Sent Successfully!</Text>
          <Text style={styles.successAmount}>${amount}</Text>
          <Text style={styles.successRecipient}>sent to {recipient}</Text>
          <Text style={styles.successTimestamp}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  const handleOTPVerification = async () => {
    if (otp.length !== 6) {
      setDemoMessage('Please enter a valid 6-digit OTP');
      setTimeout(() => setDemoMessage(''), 3000);
      return;
    }

    setDemoMessage('Verifying OTP...');

    setTimeout(() => {
      if (otp === '123456') {
        setIsAuthenticated(true);
        setDemoMessage('');
        setCurrentScreen('wallet');
      } else {
        setDemoMessage('Invalid OTP. Try: 123456');
        setTimeout(() => setDemoMessage(''), 3000);
      }
    }, 1000);
  };

  const handleButtonPress = (feature) => {
    console.log('Button pressed:', feature);
    switch(feature) {
      case 'send':
        console.log('Navigating to send screen');
        setRecipient('');
        setAmount('');
        setCurrentScreen('send');
        break;
      case 'history':
        console.log('Navigating to history screen');
        setCurrentScreen('history');
        break;
      case 'ble':
        console.log('Navigating to ble screen');
        setCurrentScreen('ble');
        break;
      case 'logout':
        console.log('Logging out');
        setCurrentScreen('otp');
        setOtp('');
        setIsAuthenticated(false);
        setBalance('0.00');
        setDemoMessage('');
        break;
      default:
        setDemoMessage(`${feature} feature activated!`);
        setTimeout(() => setDemoMessage(''), 2000);
    }
  };

  const handleSendMoney = () => {
    console.log('Send Money final button pressed');
    
    if (!recipient.trim()) {
      setDemoMessage('Please enter recipient');
      setTimeout(() => setDemoMessage(''), 3000);
      return;
    }
    
    if (!amount.trim() || isNaN(parseFloat(amount))) {
      setDemoMessage('Please enter a valid amount');
      setTimeout(() => setDemoMessage(''), 3000);
      return;
    }
    
    setSuccessData({ amount: amount, recipient: recipient });
    setRecipient('');
    setAmount('');
    setShowSuccessAnimation(true);
  };

  const handleSuccessComplete = () => {
    setShowSuccessAnimation(false);
    setCurrentScreen('wallet');
  };

  const renderOTPScreen = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>VibeLedger</Text>
        <Text style={styles.subtitle}>Secure Mobile Payments</Text>
        
        <Text style={styles.phoneLabel}>Phone Number</Text>
        <View style={styles.phoneContainer}>
          <Text style={styles.phoneNumber}>{phoneNumber}</Text>
        </View>
        
        <Text style={styles.otpLabel}>Enter OTP sent to your phone</Text>
        <TextInput
          style={styles.otpInput}
          value={otp}
          onChangeText={setOtp}
          placeholder="000000"
          keyboardType="numeric"
          maxLength={6}
          textAlign="center"
        />
        
        <TouchableOpacity 
          style={styles.verifyButton} 
          onPress={handleOTPVerification}
        >
          <Text style={styles.verifyButtonText}>Verify & Continue</Text>
        </TouchableOpacity>
        
        <Text style={styles.helpText}>
          Demo: Use OTP "123456"
        </Text>
      </View>
    );
  };

  const renderWalletScreen = () => {
    const features = [
      { id: 'send', label: 'Send Money', icon: '💸', color: '#4CAF50' },
      { id: 'history', label: 'History', icon: '📜', color: '#2196F3' },
      { id: 'ble', label: 'BLE Pairing', icon: '📱', color: '#FF9800' },
      { id: 'logout', label: 'Logout', icon: '��', color: '#f44336' }
    ];

    return (
      <View style={styles.container}>
        <Text style={styles.walletTitle}>VibeLedger Wallet</Text>
        
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>${balance}</Text>
        </View>
        
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Quick Actions</Text>
          <View style={styles.featuresGrid}>
            {features.map((feature) => (
              <TouchableOpacity
                key={feature.id}
                style={[styles.featureButton, { backgroundColor: feature.color }]}
                onPress={() => handleButtonPress(feature.id)}
              >
                <Text style={styles.featureIcon}>{feature.icon}</Text>
                <Text style={styles.featureLabel}>{feature.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    );
  };

  const renderSendMoneyScreen = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Send Money</Text>
        
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Recipient</Text>
          <TextInput
            style={styles.textInput}
            value={recipient}
            onChangeText={setRecipient}
            placeholder="Enter recipient name or phone"
            placeholderTextColor="#999"
          />
          
          <Text style={styles.inputLabel}>Amount ($)</Text>
          <TextInput
            style={styles.textInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
          />
          
          <TouchableOpacity 
            style={styles.sendButton}
            onPress={handleSendMoney}
          >
            <Text style={styles.sendButtonText}>Send Money</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              setRecipient('');
              setAmount('');
              setCurrentScreen('wallet');
            }}
          >
            <Text style={styles.backButtonText}>Back to Wallet</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTransactionHistoryScreen = () => {
    const transactions = [
      { id: 1, type: 'sent', amount: '25.00', recipient: 'John Doe', date: '2024-01-15' },
      { id: 2, type: 'received', amount: '50.00', sender: 'Jane Smith', date: '2024-01-14' },
      { id: 3, type: 'sent', amount: '12.50', recipient: 'Coffee Shop', date: '2024-01-13' }
    ];

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Transaction History</Text>
        
        <View style={styles.transactionsList}>
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionAmount}>
                  {transaction.type === 'sent' ? '-' : '+'}${transaction.amount}
                </Text>
                <Text style={styles.transactionPerson}>
                  {transaction.type === 'sent' ? `To: ${transaction.recipient}` : `From: ${transaction.sender}`}
                </Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text style={[styles.transactionType, 
                transaction.type === 'sent' ? styles.sentType : styles.receivedType]}>
                {transaction.type.toUpperCase()}
              </Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentScreen('wallet')}
        >
          <Text style={styles.backButtonText}>Back to Wallet</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderBLEPairingScreen = () => {
    const devices = [
      { id: 1, name: 'VibeLedger-Device-001', status: 'Available', signal: '●●●●○' },
      { id: 2, name: 'VibeLedger-Device-002', status: 'Connected', signal: '●●●●●' },
      { id: 3, name: 'VibeLedger-Device-003', status: 'Available', signal: '●●○○○' }
    ];

    return (
      <View style={styles.container}>
        <Text style={styles.title}>BLE Device Pairing</Text>
        <Text style={styles.subtitle}>Secure Bluetooth Low Energy Connection</Text>
        
        <View style={styles.devicesList}>
          {devices.map((device) => (
            <TouchableOpacity key={device.id} style={styles.deviceItem}>
              <View style={styles.deviceInfo}>
                <Text style={styles.deviceName}>{device.name}</Text>
                <Text style={styles.deviceSignal}>Signal: {device.signal}</Text>
              </View>
              <Text style={[styles.deviceStatus, 
                device.status === 'Connected' ? styles.connectedStatus : styles.availableStatus]}>
                {device.status}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => setCurrentScreen('wallet')}
        >
          <Text style={styles.backButtonText}>Back to Wallet</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCurrentScreen = () => {
    console.log('Current screen:', currentScreen);
    switch(currentScreen) {
      case 'otp':
        return renderOTPScreen();
      case 'wallet':
        return renderWalletScreen();
      case 'send':
        return renderSendMoneyScreen();
      case 'history':
        return renderTransactionHistoryScreen();
      case 'ble':
        return renderBLEPairingScreen();
      default:
        return renderOTPScreen();
    }
  };

  return (
    <View style={styles.appContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      {demoMessage && currentScreen === 'otp' && (
        <View style={styles.debugContainer}>
          <Text style={styles.debugText}>{demoMessage}</Text>
        </View>
      )}
      
      {renderCurrentScreen()}
      
      <SuccessAnimation
        amount={successData.amount}
        recipient={successData.recipient}
        visible={showSuccessAnimation}
        onComplete={handleSuccessComplete}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 40,
    textAlign: 'center',
  },
  phoneLabel: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 8,
    alignSelf: 'flex-start',
    width: '100%',
  },
  phoneContainer: {
    width: '100%',
    padding: 15,
    backgroundColor: '#ecf0f1',
    borderRadius: 8,
    marginBottom: 20,
  },
  phoneNumber: {
    fontSize: 16,
    color: '#2c3e50',
    textAlign: 'center',
  },
  otpLabel: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 15,
    textAlign: 'center',
  },
  otpInput: {
    width: '80%',
    height: 60,
    borderWidth: 2,
    borderColor: '#3498db',
    borderRadius: 8,
    fontSize: 24,
    paddingHorizontal: 20,
    marginBottom: 30,
    backgroundColor: '#fff',
    color: '#2c3e50',
  },
  verifyButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#3498db',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  verifyButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  helpText: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
    marginTop: 10,
  },
  debugContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: '#f39c12',
    padding: 15,
    borderRadius: 8,
    zIndex: 1000,
  },
  debugText: {
    color: '#fff',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  walletTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 30,
  },
  balanceContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    marginBottom: 30,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    width: '100%',
  },
  balanceLabel: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 10,
  },
  balanceAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#27ae60',
  },
  featuresContainer: {
    width: '100%',
  },
  featuresTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
    textAlign: 'center',
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  featureButton: {
    width: '48%',
    aspectRatio: 1,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  featureIcon: {
    fontSize: 30,
    marginBottom: 10,
  },
  featureLabel: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
  },
  inputLabel: {
    fontSize: 16,
    color: '#34495e',
    marginBottom: 8,
    fontWeight: '500',
  },
  textInput: {
    width: '100%',
    height: 50,
    borderWidth: 1,
    borderColor: '#bdc3c7',
    borderRadius: 8,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: '#fff',
    marginBottom: 20,
    color: '#2c3e50',
  },
  sendButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#27ae60',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 15,
  },
  sendButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  backButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#95a5a6',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  transactionsList: {
    width: '100%',
    maxWidth: 400,
  },
  transactionItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  transactionDetails: {
    flex: 1,
  },
  transactionAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  transactionPerson: {
    fontSize: 14,
    color: '#7f8c8d',
    marginBottom: 3,
  },
  transactionDate: {
    fontSize: 12,
    color: '#95a5a6',
  },
  transactionType: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  sentType: {
    backgroundColor: '#e74c3c',
    color: '#fff',
  },
  receivedType: {
    backgroundColor: '#27ae60',
    color: '#fff',
  },
  devicesList: {
    width: '100%',
    maxWidth: 400,
  },
  deviceItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
  },
  deviceSignal: {
    fontSize: 12,
    color: '#7f8c8d',
  },
  deviceStatus: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  connectedStatus: {
    backgroundColor: '#27ae60',
    color: '#fff',
  },
  availableStatus: {
    backgroundColor: '#3498db',
    color: '#fff',
  },
  successAnimationContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  successContent: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  checkMark: {
    fontSize: 80,
    color: '#34C759',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  successAmount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#34C759',
    marginBottom: 10,
  },
  successRecipient: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
  },
  successTimestamp: {
    fontSize: 14,
    color: '#ccc',
  },
});

export default App;
