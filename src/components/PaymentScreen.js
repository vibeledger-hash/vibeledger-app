import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform
} from 'react-native';
import { transactionApi } from '../services/transactionApiService';
import { walletApi } from '../services/walletApiService';

const PaymentScreen = ({ route, navigation }) => {
  const { merchant, paymentMethod } = route.params;
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [walletBalance, setWalletBalance] = useState(0);
  const [processing, setProcessing] = useState(false);
  const [pendingTransaction, setPendingTransaction] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [showOTPInput, setShowOTPInput] = useState(false);

  useEffect(() => {
    loadWalletBalance();
  }, []);

  const loadWalletBalance = async () => {
    try {
      const result = await walletApi.getBalance();
      if (result.success) {
        setWalletBalance(result.data.balance);
      }
    } catch (error) {
      console.error('Failed to load wallet balance:', error);
    }
  };

  const initiatePayment = async () => {
    if (!amount || parseFloat(amount) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (parseFloat(amount) > walletBalance) {
      Alert.alert('Insufficient Balance', 'You do not have enough balance for this transaction');
      return;
    }

    setProcessing(true);
    try {
      const result = await transactionApi.initiateTransaction({
        merchantId: merchant.id,
        amount: parseFloat(amount),
        description: description || `Payment to ${merchant.name}`,
        paymentMethod
      });

      if (result.success) {
        setPendingTransaction(result.data.transaction);
        setShowOTPInput(true);
        Alert.alert(
          'OTP Sent', 
          'Please enter the OTP sent to your phone to confirm the transaction'
        );
      } else {
        Alert.alert('Transaction Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to initiate transaction');
    } finally {
      setProcessing(false);
    }
  };

  const confirmPayment = async () => {
    if (!otpCode || otpCode.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    setProcessing(true);
    try {
      const result = await transactionApi.confirmTransaction(
        pendingTransaction.id,
        otpCode
      );

      if (result.success) {
        Alert.alert(
          'Payment Successful!',
          `${walletBalance.toFixed(2)} ${result.data.currency} has been sent to ${merchant.name}`,
          [
            {
              text: 'OK',
              onPress: () => navigation.navigate('WalletScreen')
            }
          ]
        );
      } else {
        Alert.alert('Payment Failed', result.error);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to confirm transaction');
    } finally {
      setProcessing(false);
    }
  };

  const cancelPayment = async () => {
    if (pendingTransaction) {
      try {
        await transactionApi.cancelTransaction(pendingTransaction.id, 'User cancelled');
      } catch (error) {
        console.error('Failed to cancel transaction:', error);
      }
    }
    navigation.goBack();
  };

  if (showOTPInput) {
    return (
      <KeyboardAvoidingView 
        style={styles.container} 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <View style={styles.otpContainer}>
          <Text style={styles.title}>Confirm Payment</Text>
          
          <View style={styles.transactionSummary}>
            <Text style={styles.summaryLabel}>Paying to:</Text>
            <Text style={styles.summaryValue}>{merchant.name}</Text>
            
            <Text style={styles.summaryLabel}>Amount:</Text>
            <Text style={styles.summaryAmount}>USD {amount}</Text>
            
            {description && (
              <>
                <Text style={styles.summaryLabel}>Description:</Text>
                <Text style={styles.summaryValue}>{description}</Text>
              </>
            )}
          </View>

          <Text style={styles.otpLabel}>Enter OTP sent to your phone:</Text>
          <TextInput
            style={styles.otpInput}
            value={otpCode}
            onChangeText={setOtpCode}
            placeholder="000000"
            keyboardType="numeric"
            maxLength={6}
            textAlign="center"
          />

          <View style={styles.buttonRow}>
            <TouchableOpacity 
              style={[styles.button, styles.cancelButton]} 
              onPress={cancelPayment}
              disabled={processing}
            >
              <Text style={styles.cancelButtonText}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.button, styles.confirmButton]} 
              onPress={confirmPayment}
              disabled={processing || otpCode.length !== 6}
            >
              {processing ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.confirmButtonText}>Confirm Payment</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    );
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.paymentContainer}>
        <Text style={styles.title}>Payment Details</Text>
        
        <View style={styles.merchantInfo}>
          <Text style={styles.merchantName}>{merchant.name}</Text>
          <Text style={styles.merchantCategory}>{merchant.category}</Text>
          {merchant.location?.address && (
            <Text style={styles.merchantAddress}>{merchant.location.address}</Text>
          )}
        </View>

        <View style={styles.walletInfo}>
          <Text style={styles.balanceLabel}>Available Balance:</Text>
          <Text style={styles.balanceAmount}>USD {walletBalance.toFixed(2)}</Text>
        </View>

        <View style={styles.inputSection}>
          <Text style={styles.inputLabel}>Amount *</Text>
          <TextInput
            style={styles.amountInput}
            value={amount}
            onChangeText={setAmount}
            placeholder="0.00"
            keyboardType="decimal-pad"
            textAlign="center"
          />
          
          <Text style={styles.inputLabel}>Description (Optional)</Text>
          <TextInput
            style={styles.descriptionInput}
            value={description}
            onChangeText={setDescription}
            placeholder="What's this payment for?"
            multiline
            numberOfLines={2}
          />
        </View>

        <View style={styles.buttonContainer}>
          <TouchableOpacity 
            style={[styles.button, styles.backButton]} 
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.backButtonText}>Back</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={[styles.button, styles.payButton]} 
            onPress={initiatePayment}
            disabled={processing || !amount || parseFloat(amount) <= 0}
          >
            {processing ? (
              <ActivityIndicator color="white" />
            ) : (
              <Text style={styles.payButtonText}>Pay USD {amount || '0.00'}</Text>
            )}
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  paymentContainer: {
    flex: 1,
    padding: 20,
  },
  otpContainer: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  merchantInfo: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  merchantName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  merchantCategory: {
    fontSize: 16,
    color: '#007AFF',
    marginBottom: 8,
  },
  merchantAddress: {
    fontSize: 14,
    color: '#666',
  },
  walletInfo: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  balanceLabel: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  balanceAmount: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  inputSection: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  amountInput: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#007AFF',
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
    paddingVertical: 12,
    marginBottom: 20,
  },
  descriptionInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 60,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  button: {
    flex: 1,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginHorizontal: 6,
  },
  backButton: {
    backgroundColor: '#f0f0f0',
  },
  backButtonText: {
    color: '#666',
    fontSize: 16,
    fontWeight: '600',
  },
  payButton: {
    backgroundColor: '#007AFF',
  },
  payButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  cancelButton: {
    backgroundColor: '#FF6B6B',
  },
  cancelButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  confirmButton: {
    backgroundColor: '#34C759',
  },
  confirmButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  transactionSummary: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
    marginBottom: 30,
  },
  summaryLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  summaryValue: {
    fontSize: 16,
    color: '#333',
    marginBottom: 12,
  },
  summaryAmount: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#007AFF',
    marginBottom: 12,
  },
  otpLabel: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  otpInput: {
    fontSize: 24,
    fontWeight: 'bold',
    borderWidth: 2,
    borderColor: '#007AFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    letterSpacing: 8,
  },
});

export default PaymentScreen;
