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
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  StatusBar,
  Animated,
  Dimensions
} from 'react-native';

function App() {
  const [currentScreen, setCurrentScreen] = useState('otp');
  const [otp, setOtp] = useState('');
  const [phoneNumber] = useState('+1234567890');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [demoMessage, setDemoMessage] = useState('');
  const [balance, setBalance] = useState('0.00');
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [successData, setSuccessData] = useState({ amount: '', recipient: '' });
  
  // Send Money form state - moved to top level to follow Rules of Hooks
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');

  useEffect(() => {
    if (currentScreen === 'wallet') {
      setBalance('1247.83');
    } else {
      setBalance('0.00');
    }
  }, [currentScreen]);

  // Success Animation Component
  const SuccessAnimation = ({ amount, recipient, visible, onComplete }) => {
    const screenData = Dimensions.get('window');
    const [animations] = useState({
      checkScale: new Animated.Value(0),
      checkOpacity: new Animated.Value(0),
      titleOpacity: new Animated.Value(0),
      titleTranslateY: new Animated.Value(50),
      detailsOpacity: new Animated.Value(0),
      detailsTranslateY: new Animated.Value(30),
      confetti1: new Animated.Value(-100),
      confetti2: new Animated.Value(-100),
      confetti3: new Animated.Value(-100),
      confetti4: new Animated.Value(-100),
      confetti5: new Animated.Value(-100),
      backgroundOpacity: new Animated.Value(0),
    });

    useEffect(() => {
      if (visible) {
        // Reset animations
        Object.values(animations).forEach(anim => anim.setValue(anim === animations.backgroundOpacity ? 0 : (anim === animations.titleTranslateY || anim === animations.detailsTranslateY ? 50 : anim === animations.confetti1 ? -100 : 0)));

        // Background fade in
        Animated.timing(animations.backgroundOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }).start();

        // Check mark animation
        Animated.sequence([
          Animated.delay(200),
          Animated.parallel([
            Animated.spring(animations.checkScale, {
              toValue: 1,
              tension: 100,
              friction: 8,
              useNativeDriver: true,
            }),
            Animated.timing(animations.checkOpacity, {
              toValue: 1,
              duration: 400,
              useNativeDriver: true,
            }),
          ]),
        ]).start();

        // Title animation
        Animated.sequence([
          Animated.delay(600),
          Animated.parallel([
            Animated.timing(animations.titleOpacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.spring(animations.titleTranslateY, {
              toValue: 0,
              tension: 80,
              friction: 8,
              useNativeDriver: true,
            }),
          ]),
        ]).start();

        // Details animation
        Animated.sequence([
          Animated.delay(1000),
          Animated.parallel([
            Animated.timing(animations.detailsOpacity, {
              toValue: 1,
              duration: 500,
              useNativeDriver: true,
            }),
            Animated.spring(animations.detailsTranslateY, {
              toValue: 0,
              tension: 80,
              friction: 8,
              useNativeDriver: true,
            }),
          ]),
        ]).start();

        // Confetti animation
        const confettiAnimations = [
          animations.confetti1,
          animations.confetti2,
          animations.confetti3,
          animations.confetti4,
          animations.confetti5,
        ];

        confettiAnimations.forEach((anim, index) => {
          anim.setValue(-100);
          Animated.sequence([
            Animated.delay(800 + index * 100),
            Animated.timing(anim, {
              toValue: screenData.height + 100,
              duration: 2000 + Math.random() * 1000,
              useNativeDriver: true,
            }),
          ]).start();
        });

        // Auto dismiss after 3 seconds
        setTimeout(() => {
          if (onComplete) onComplete();
        }, 3500);
      }
    }, [visible]);

    if (!visible) return null;

    return (
      <Animated.View 
        style={[
          styles.successOverlay,
          {
            opacity: animations.backgroundOpacity,
          }
        ]}
      >
        {/* Confetti Elements */}
        {[
          { anim: animations.confetti1, left: '10%', color: '#FFD700', char: '✨' },
          { anim: animations.confetti2, left: '25%', color: '#FF6B6B', char: '🎉' },
          { anim: animations.confetti3, left: '50%', color: '#4ECDC4', char: '💫' },
          { anim: animations.confetti4, left: '75%', color: '#45B7D1', char: '⭐' },
          { anim: animations.confetti5, left: '90%', color: '#96CEB4', char: '🌟' },
        ].map((confetti, index) => (
          <Animated.Text
            key={index}
            style={[
              styles.confettiItem,
              {
                left: confetti.left,
                color: confetti.color,
                transform: [{ translateY: confetti.anim }],
              },
            ]}
          >
            {confetti.char}
          </Animated.Text>
        ))}

        {/* Success Content */}
        <View style={styles.successContent}>
          {/* Animated Check Mark */}
          <Animated.View
            style={[
              styles.checkMarkContainer,
              {
                opacity: animations.checkOpacity,
                transform: [{ scale: animations.checkScale }],
              },
            ]}
          >
            <Text style={styles.checkMark}>✓</Text>
          </Animated.View>

          {/* Animated Title */}
          <Animated.View
            style={{
              opacity: animations.titleOpacity,
              transform: [{ translateY: animations.titleTranslateY }],
            }}
          >
            <Text style={styles.successTitle}>Money Sent Successfully!</Text>
          </Animated.View>

          {/* Animated Details */}
          <Animated.View
            style={[
              styles.successDetails,
              {
                opacity: animations.detailsOpacity,
                transform: [{ translateY: animations.detailsTranslateY }],
              },
            ]}
          >
            <Text style={styles.successAmount}>${amount}</Text>
            <Text style={styles.successRecipient}>sent to {recipient}</Text>
            <Text style={styles.successTimestamp}>
              {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </Animated.View>
        </View>
      </Animated.View>
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

  const renderOTPScreen = () => (
    <View style={styles.container}>
      <View style={styles.logoContainer}>
        <Text style={styles.logoText}>VibeLedger</Text>
      </View>
      <Text style={styles.subtitle}>Enter OTP</Text>
      <Text style={styles.phoneText}>Code sent to {phoneNumber}</Text>
      <Text style={styles.testInfo}>For testing, use: 123456</Text>
      
      {demoMessage ? (
        <Text style={styles.demoMessage}>{demoMessage}</Text>
      ) : null}
      
      <TextInput
        style={styles.input}
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        maxLength={6}
        placeholder="●●●●●●"
        placeholderTextColor="#ccc"
      />
      
      <TouchableOpacity 
        style={styles.primaryButton}
        onPress={handleOTPVerification}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>Verify OTP</Text>
      </TouchableOpacity>
    </View>
  );

  const renderWalletScreen = () => {
    return (
      <View style={styles.container}>
        <View style={styles.walletHeader}>
          <Text style={styles.logoText}>VibeLedger</Text>
          <Text style={styles.walletTitle}>💰 Your Wallet</Text>
        </View>
        
        <View style={styles.balanceCard}>
          <Text style={styles.balanceLabel}>Available Balance</Text>
          <Text style={styles.balanceAmount}>
            ${balance || '0.00'}
          </Text>
        </View>
        
        {demoMessage ? (
          <Text style={styles.demoMessage}>{demoMessage}</Text>
        ) : null}
        
        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.sendButton]}
            onPress={() => handleButtonPress('send')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>💸 Send Money</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.historyButton]}
            onPress={() => handleButtonPress('history')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>📊 Transaction History</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.bleButton]}
            onPress={() => handleButtonPress('ble')}
            activeOpacity={0.8}
          >
            <Text style={styles.actionButtonText}>📱 Pair BLE Device</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.actionButton, styles.logoutButton]}
            onPress={() => handleButtonPress('logout')}
            activeOpacity={0.8}
          >
            <Text style={styles.logoutButtonText}>🚪 Logout</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderSendMoneyScreen = () => {
    const handleSendMoney = () => {
      console.log('Send Money final button pressed');
      console.log('Recipient:', recipient);
      console.log('Amount:', amount);
      
      if (!recipient.trim()) {
        setDemoMessage('Please enter recipient information');
        setTimeout(() => setDemoMessage(''), 3000);
        return;
      }
      
      if (!amount.trim()) {
        setDemoMessage('Please enter an amount');
        setTimeout(() => setDemoMessage(''), 3000);
        return;
      }
      
      // Trigger success animation
      setSuccessData({ amount, recipient });
      setShowSuccessAnimation(true);
    };

    return (
      <View style={[styles.container, { backgroundColor: '#e8f4fd' }]}>
        <View style={styles.screenHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => {
              console.log('Back button pressed from send screen');
              // Clear form when going back
              setRecipient('');
              setAmount('');
              setCurrentScreen('wallet');
            }}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>💸 Send Money</Text>
        </View>

        <View style={styles.formContainer}>
          <Text style={styles.label}>Recipient</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter phone number or email"
            placeholderTextColor="#ccc"
            value={recipient}
            onChangeText={setRecipient}
          />
          
          <Text style={styles.label}>Amount</Text>
          <TextInput
            style={styles.input}
            placeholder="$0.00"
            placeholderTextColor="#ccc"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
          
          <TouchableOpacity 
            style={[styles.primaryButton, { marginTop: 20 }]}
            onPress={handleSendMoney}
            activeOpacity={0.7}
          >
            <Text style={styles.buttonText}>💸 Send Money Now</Text>
          </TouchableOpacity>
          
          {demoMessage ? (
            <Text style={[styles.demoMessage, { marginTop: 20, fontSize: 16 }]}>{demoMessage}</Text>
          ) : null}
        </View>
      </View>
    );
  };

  const renderTransactionHistoryScreen = () => {
    return (
      <View style={styles.container}>
        <View style={styles.screenHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setCurrentScreen('wallet')}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>📊 Transaction History</Text>
        </View>

        <View style={styles.transactionContainer}>
          {[
            { id: 1, type: 'sent', amount: '-$25.00', recipient: 'John Doe', date: 'Today, 2:30 PM' },
            { id: 2, type: 'received', amount: '+$150.00', recipient: 'Sarah Smith', date: 'Yesterday, 4:15 PM' },
            { id: 3, type: 'sent', amount: '-$75.50', recipient: 'Coffee Shop', date: 'Dec 28, 9:20 AM' },
          ].map(transaction => (
            <View key={transaction.id} style={styles.transactionItem}>
              <View style={styles.transactionInfo}>
                <Text style={styles.transactionRecipient}>{transaction.recipient}</Text>
                <Text style={styles.transactionDate}>{transaction.date}</Text>
              </View>
              <Text style={[
                styles.transactionAmount,
                { color: transaction.type === 'received' ? '#34C759' : '#FF3B30' }
              ]}>
                {transaction.amount}
              </Text>
            </View>
          ))}
        </View>
      </View>
    );
  };

  const renderBLEPairingScreen = () => {
    return (
      <View style={styles.container}>
        <View style={styles.screenHeader}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => setCurrentScreen('wallet')}
          >
            <Text style={styles.backButtonText}>← Back</Text>
          </TouchableOpacity>
          <Text style={styles.screenTitle}>📱 BLE Pairing</Text>
        </View>

        <View style={styles.bleContainer}>
          <Text style={styles.bleStatus}>Scanning for nearby devices...</Text>
          
          <View style={styles.deviceList}>
            {[
              { id: 1, name: 'Payment Terminal #1', distance: '2m away', status: 'Available' },
              { id: 2, name: 'Coffee Shop POS', distance: '5m away', status: 'Available' },
              { id: 3, name: 'Retail Scanner', distance: '8m away', status: 'Busy' },
            ].map(device => (
              <TouchableOpacity key={device.id} style={styles.deviceItem}>
                <View style={styles.deviceInfo}>
                  <Text style={styles.deviceName}>{device.name}</Text>
                  <Text style={styles.deviceDistance}>{device.distance}</Text>
                </View>
                <Text style={[
                  styles.deviceStatus,
                  { color: device.status === 'Available' ? '#34C759' : '#FF9500' }
                ]}>
                  {device.status}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
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
          <Text style={styles.debugText}>Current Screen: {currentScreen}</Text>
          <Text style={styles.debugText}>Demo Message: {demoMessage}</Text>
        </View>
      )}
      {renderCurrentScreen()}
      
      {/* Success Animation Overlay */}
      <SuccessAnimation 
        amount={successData.amount}
        recipient={successData.recipient}
        visible={showSuccessAnimation}
        onComplete={() => {
          setShowSuccessAnimation(false);
          setRecipient(''); // Clear form
          setAmount('');    // Clear form
          setCurrentScreen('wallet');
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  appContainer: {
    flex: 1,
    backgroundColor: '#fff',
  },
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8f9fa',
  },
  logoContainer: {
    marginBottom: 30,
    alignItems: 'center',
  },
  logoText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    textAlign: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    textAlign: 'center',
  },
  walletHeader: {
    alignItems: 'center',
    marginBottom: 20,
  },
  walletTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginTop: 10,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 22,
    color: '#555',
    marginBottom: 10,
  },
  phoneText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  testInfo: {
    fontSize: 14,
    color: '#007AFF',
    marginBottom: 30,
    fontStyle: 'italic',
  },
  input: {
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 10,
    fontSize: 24,
    padding: 15,
    width: 180,
    textAlign: 'center',
    marginBottom: 30,
    backgroundColor: '#fff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  primaryButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  balanceCard: {
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 30,
    marginBottom: 40,
    alignItems: 'center',
    minWidth: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 8,
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 10,
    opacity: 0.9,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  buttonContainer: {
    width: '100%',
    maxWidth: 320,
  },
  actionButton: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  sendButton: {
    backgroundColor: '#34C759',
  },
  historyButton: {
    backgroundColor: '#FF9500',
  },
  bleButton: {
    backgroundColor: '#5856D6',
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    marginTop: 10,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  logoutButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  demoMessage: {
    fontSize: 14,
    color: '#FF3B30',
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  screenHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 30,
    paddingHorizontal: 10,
  },
  backButton: {
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  backButtonText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  screenTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 20,
    flex: 1,
  },
  formContainer: {
    width: '100%',
    maxWidth: 320,
    alignItems: 'center',
  },
  label: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  transactionContainer: {
    width: '100%',
    maxWidth: 350,
  },
  transactionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionRecipient: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  transactionDate: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  bleContainer: {
    width: '100%',
    maxWidth: 350,
    alignItems: 'center',
  },
  bleStatus: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 20,
    textAlign: 'center',
  },
  deviceList: {
    width: '100%',
  },
  deviceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#fff',
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  deviceInfo: {
    flex: 1,
  },
  deviceName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  deviceDistance: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  deviceStatus: {
    fontSize: 14,
    fontWeight: '600',
  },
  debugContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 10,
    borderRadius: 5,
    zIndex: 1000,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
  },
  // Success Animation Styles
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
  },
  confettiItem: {
    position: 'absolute',
    fontSize: 24,
    fontWeight: 'bold',
  },
  successContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkMarkContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#34C759',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 30,
    shadowColor: '#34C759',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  checkMark: {
    fontSize: 60,
    color: '#fff',
    fontWeight: 'bold',
  },
  successTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 30,
  },
  successDetails: {
    alignItems: 'center',
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
