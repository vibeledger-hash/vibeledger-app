/**
 * VibeLedger Merchant App - REAL-TIME VERSION
 * Secure mobile payment system for merchants to receive payments with backend integration
 *
 * @format
 */

import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Animated,
  Dimensions,
  ActivityIndicator,
  Alert,
} from 'react-native';
import apiService from './src/services/api';
import { CONFIG } from './src/config';

function App() {
  // Authentication states
  const [currentScreen, setCurrentScreen] = useState('phone');
  const [otp, setOtp] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('+91');
  const [otpId, setOtpId] = useState('');
  const [loading, setLoading] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  
  // App states
  const [message, setMessage] = useState('');
  const [balance, setBalance] = useState('0.00');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successData, setSuccessData] = useState({ amount: '', customer: '' });
  const [customerMobile, setCustomerMobile] = useState('');
  const [amount, setAmount] = useState('');

  // Initialize app and check for existing authentication
  useEffect(() => {
    initializeApp();
  }, []);

  const initializeApp = async () => {
    try {
      await apiService.init();
      if (apiService.isAuthenticated()) {
        setIsAuthenticated(true);
        setCurrentScreen('wallet');
        await loadWalletData();
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  };

  const loadWalletData = async () => {
    try {
      setLoading(true);
      const balanceData = await apiService.getBalance();
      setBalance(balanceData.balance.toFixed(2));
    } catch (error) {
      console.error('Failed to load wallet data:', error);
      setMessage('Failed to load wallet data');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle phone number submission and OTP request
  const handlePhoneSubmit = async () => {
    if (!phoneNumber || phoneNumber.length < 10) {
      setMessage('Please enter a valid phone number');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      setLoading(true);
      setMessage('Requesting OTP...');
      
      const response = await apiService.requestOTP(phoneNumber);
      setOtpId(response.otpId);
      setCurrentScreen('otp');
      setMessage(`OTP sent to ${response.phoneNumber}`);
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Failed to request OTP:', error);
      setMessage('Failed to send OTP. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleOTPVerification = async () => {
    if (otp.length !== CONFIG.OTP_LENGTH) {
      setMessage(`Please enter a valid ${CONFIG.OTP_LENGTH}-digit OTP`);
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      setLoading(true);
      setMessage('Verifying OTP...');

      const response = await apiService.verifyOTP(otpId, otp, phoneNumber);
      
      if (response.success) {
        setIsAuthenticated(true);
        setMessage('');
        setCurrentScreen('wallet');
        await loadWalletData();
      }
    } catch (error) {
      console.error('OTP verification failed:', error);
      setMessage('Invalid OTP. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Simple success animation for payment received
  const SuccessAnimation = ({ amount, customer, visible, onComplete }) => {
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
          <Text style={styles.successTitle}>Payment Received!</Text>
          <Text style={styles.successAmount}>₹{amount}</Text>
          <Text style={styles.successRecipient}>from {customer}</Text>
          <Text style={styles.successTimestamp}>
            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </Text>
        </View>
      </View>
    );
  };

  // Handle button presses from wallet screen
  const handleButtonPress = (feature) => {
    console.log('Button pressed:', feature);
    switch(feature) {
      case 'receive':
        console.log('Navigating to receive payment screen');
        setCustomerMobile('');
        setAmount('');
        setCurrentScreen('receive');
        break;
      case 'history':
        console.log('Navigating to sales history screen');
        setCurrentScreen('history');
        break;
      case 'ble':
        console.log('Navigating to ble screen');
        setCurrentScreen('ble');
        break;
      case 'logout':
        console.log('Logging out');
        handleLogout();
        break;
      default:
        setMessage(`${feature} feature coming soon!`);
        setTimeout(() => setMessage(''), 2000);
    }
  };

  const handleLogout = async () => {
    try {
      await apiService.logout();
      setIsAuthenticated(false);
      setCurrentScreen('phone');
      setPhoneNumber('+91');
      setOtp('');
      setBalance('0.00');
      setMessage('Logged out successfully');
      setTimeout(() => setMessage(''), 2000);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const handleReceivePayment = async () => {
    console.log('Receive Payment button pressed');
    
    if (!customerMobile.trim()) {
      setMessage('Please enter customer mobile number');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      setMessage('Please enter a valid amount');
      setTimeout(() => setMessage(''), 3000);
      return;
    }

    try {
      setLoading(true);
      setMessage('Processing payment...');

      // Simulate payment processing with backend
      const transactionData = {
        recipientId: customerMobile,
        amount: parseFloat(amount),
        description: `Payment from ${customerMobile}`,
      };

      const response = await apiService.initiateTransaction(
        transactionData.recipientId,
        transactionData.amount,
        transactionData.description
      );

      if (response.success) {
        // Update balance
        await loadWalletData();
        
        // Show success animation
        setSuccessData({ amount: amount, customer: customerMobile });
        setShowSuccessAnimation(true);
        setCustomerMobile('');
        setAmount('');
        setMessage('');
      }
    } catch (error) {
      console.error('Payment processing failed:', error);
      setMessage('Payment processing failed. Please try again.');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleSuccessComplete = () => {
    setShowSuccessAnimation(false);
    setCurrentScreen('wallet');
  };

  // Phone number input screen
  const renderPhoneScreen = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>VibeLedger Merchant</Text>
        <Text style={styles.subtitle}>Enter your phone number to get started</Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.textInput}
            value={phoneNumber}
            onChangeText={setPhoneNumber}
            placeholder="+91 XXXXX XXXXX"
            keyboardType="phone-pad"
            maxLength={15}
            editable={!loading}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.primaryButton, loading && styles.disabledButton]}
          onPress={handlePhoneSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Send OTP</Text>
          )}
        </TouchableOpacity>
        
        {message ? (
          <Text style={styles.messageText}>{message}</Text>
        ) : null}
      </View>
    );
  };

  const renderOTPScreen = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Verify OTP</Text>
        <Text style={styles.subtitle}>
          Enter the {CONFIG.OTP_LENGTH}-digit code sent to {phoneNumber}
        </Text>
        
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>OTP Code</Text>
          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={setOtp}
            placeholder="000000"
            keyboardType="numeric"
            maxLength={CONFIG.OTP_LENGTH}
            secureTextEntry={false}
            editable={!loading}
          />
        </View>
        
        <TouchableOpacity 
          style={[styles.primaryButton, loading && styles.disabledButton]}
          onPress={handleOTPVerification}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.primaryButtonText}>Verify OTP</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => {
            setCurrentScreen('phone');
            setOtp('');
            setMessage('');
          }}
          disabled={loading}
        >
          <Text style={styles.secondaryButtonText}>Change Phone Number</Text>
        </TouchableOpacity>
        
        {message ? (
          <Text style={styles.messageText}>{message}</Text>
        ) : null}
      </View>
    );
  };

  const renderWalletScreen = () => {
    const features = [
      { id: 'receive', label: 'Receive Payment', icon: '💰', color: '#4CAF50' },
      { id: 'history', label: 'Sales History', icon: '📊', color: '#2196F3' },
      { id: 'ble', label: 'BLE Pairing', icon: '📱', color: '#FF9800' },
      { id: 'logout', label: 'Logout', icon: '🚪', color: '#f44336' }
    ];

    return (
      <View style={styles.container}>
        <Text style={styles.walletTitle}>VibeLedger Merchant</Text>
        
        <View style={styles.balanceContainer}>
          <Text style={styles.balanceLabel}>Today's Earnings</Text>
          {loading ? (
            <ActivityIndicator size="large" color="#27ae60" />
          ) : (
            <Text style={styles.balanceAmount}>₹{balance}</Text>
          )}
          <Text style={styles.balanceSubtext}>Available Balance</Text>
        </View>
        
        <View style={styles.customerBalanceContainer}>
          <Text style={styles.customerBalanceLabel}>System Status</Text>
          <Text style={styles.customerBalanceAmount}>
            {apiService.isAuthenticated() ? '🟢 Connected' : '🔴 Offline'}
          </Text>
          <Text style={styles.customerBalanceSubtext}>Backend Connection</Text>
        </View>
        
        <View style={styles.featuresContainer}>
          <Text style={styles.featuresTitle}>Merchant Actions</Text>
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

  const renderReceivePaymentScreen = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Receive Payment</Text>
        
        <View style={styles.formContainer}>
          <Text style={styles.inputLabel}>Customer Mobile No</Text>
          <TextInput
            style={styles.textInput}
            value={customerMobile}
            onChangeText={setCustomerMobile}
            placeholder="+91 XXXXX XXXXX"
            keyboardType="phone-pad"
            editable={!loading}
          />
          
          <Text style={styles.inputLabel}>Amount (₹)</Text>
          <TextInput
            style={styles.textInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="numeric"
            editable={!loading}
          />
          
          <TouchableOpacity 
            style={[styles.primaryButton, loading && styles.disabledButton]}
            onPress={handleReceivePayment}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.primaryButtonText}>Receive Payment</Text>
            )}
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.secondaryButton}
            onPress={() => setCurrentScreen('wallet')}
            disabled={loading}
          >
            <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderTransactionHistoryScreen = () => {
    const transactions = [
      { id: 1, type: 'received', amount: '1,250.00', customer: '+91 98765 43210', date: '2025-08-04', time: '14:30' },
      { id: 2, type: 'received', amount: '750.50', customer: '+91 87654 32109', date: '2025-08-04', time: '12:15' },
      { id: 3, type: 'received', amount: '2,100.00', customer: '+91 76543 21098', date: '2025-08-04', time: '10:45' },
    ];

    return (
      <View style={styles.container}>
        <Text style={styles.title}>Transaction History</Text>
        
        <View style={styles.transactionsList}>
          {transactions.map((transaction) => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionDetails}>
                <Text style={styles.transactionAmount}>
                  +₹{transaction.amount}
                </Text>
                <Text style={styles.transactionPerson}>
                  From: {transaction.customer}
                </Text>
                <Text style={styles.transactionDate}>{transaction.date} at {transaction.time}</Text>
              </View>
              <Text style={[styles.transactionType, styles.receivedType]}>
                RECEIVED
              </Text>
            </View>
          ))}
        </View>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => setCurrentScreen('wallet')}
        >
          <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderBLEPairingScreen = () => {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>BLE Pairing</Text>
        <Text style={styles.subtitle}>Connect with nearby payment devices</Text>
        
        <View style={styles.bleContainer}>
          <Text style={styles.bleStatus}>🔍 Scanning for devices...</Text>
          <Text style={styles.bleInfo}>Make sure Bluetooth is enabled</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={() => setCurrentScreen('wallet')}
        >
          <Text style={styles.secondaryButtonText}>Back to Dashboard</Text>
        </TouchableOpacity>
      </View>
    );
  };

  const renderCurrentScreen = () => {
    console.log('Current screen:', currentScreen);
    
    if (!isAuthenticated) {
      switch (currentScreen) {
        case 'phone':
          return renderPhoneScreen();
        case 'otp':
          return renderOTPScreen();
        default:
          return renderPhoneScreen();
      }
    }

    switch (currentScreen) {
      case 'wallet':
        return renderWalletScreen();
      case 'receive':
        return renderReceivePaymentScreen();
      case 'history':
        return renderTransactionHistoryScreen();
      case 'ble':
        return renderBLEPairingScreen();
      default:
        return renderWalletScreen();
    }
  };

  return (
    <View style={styles.appContainer}>
      <StatusBar barStyle="dark-content" backgroundColor="#fff" />
      
      {renderCurrentScreen()}
      
      <SuccessAnimation
        amount={successData.amount}
        customer={successData.customer}
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
  inputContainer: {
    width: '100%',
    marginBottom: 20,
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
    color: '#2c3e50',
  },
  otpInput: {
    width: '100%',
    height: 60,
    borderWidth: 2,
    borderColor: '#3498db',
    borderRadius: 8,
    fontSize: 24,
    paddingHorizontal: 20,
    backgroundColor: '#fff',
    color: '#2c3e50',
    textAlign: 'center',
  },
  primaryButton: {
    width: '100%',
    height: 50,
    backgroundColor: '#3498db',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 10,
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  secondaryButton: {
    marginTop: 20,
    padding: 10,
  },
  secondaryButtonText: {
    color: '#3498db',
    fontSize: 16,
    textAlign: 'center',
    textDecorationLine: 'underline',
  },
  disabledButton: {
    opacity: 0.6,
  },
  messageText: {
    color: '#e74c3c',
    fontSize: 14,
    textAlign: 'center',
    marginTop: 10,
    paddingHorizontal: 20,
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
    marginBottom: 20,
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
    marginBottom: 5,
  },
  balanceSubtext: {
    fontSize: 14,
    color: '#7f8c8d',
    textAlign: 'center',
  },
  customerBalanceContainer: {
    backgroundColor: '#e8f5e8',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    alignItems: 'center',
    width: '100%',
    borderWidth: 2,
    borderColor: '#27ae60',
  },
  customerBalanceLabel: {
    fontSize: 16,
    color: '#27ae60',
    fontWeight: '600',
    marginBottom: 5,
  },
  customerBalanceAmount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 5,
  },
  customerBalanceSubtext: {
    fontSize: 14,
    color: '#27ae60',
    textAlign: 'center',
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
  transactionsList: {
    width: '100%',
    maxHeight: 400,
  },
  transactionItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
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
    color: '#27ae60',
  },
  transactionPerson: {
    fontSize: 14,
    color: '#7f8c8d',
    marginTop: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: '#95a5a6',
    marginTop: 2,
  },
  transactionType: {
    fontSize: 12,
    fontWeight: 'bold',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
  },
  receivedType: {
    backgroundColor: '#d5edda',
    color: '#155724',
  },
  bleContainer: {
    backgroundColor: '#fff',
    padding: 30,
    borderRadius: 15,
    marginBottom: 30,
    alignItems: 'center',
    width: '100%',
  },
  bleStatus: {
    fontSize: 18,
    color: '#3498db',
    marginBottom: 10,
  },
  bleInfo: {
    fontSize: 14,
    color: '#7f8c8d',
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
    zIndex: 1000,
  },
  successContent: {
    backgroundColor: '#fff',
    padding: 40,
    borderRadius: 20,
    alignItems: 'center',
    maxWidth: 300,
    width: '80%',
  },
  checkMark: {
    fontSize: 60,
    color: '#27ae60',
    marginBottom: 20,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 15,
  },
  successAmount: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#27ae60',
    marginBottom: 10,
  },
  successRecipient: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 5,
  },
  successTimestamp: {
    fontSize: 14,
    color: '#95a5a6',
  },
});

export default App;
