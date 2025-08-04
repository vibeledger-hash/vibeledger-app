import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, Alert } from 'react-native';

const OTPEntryScreen = ({ onOTPSuccess }) => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);
  const [phoneNumber] = useState('+1234567890'); // Default test phone number
  const [otpId, setOtpId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  const requestOTP = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('https://vibeledger-app.onrender.com/api/auth/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber }),
      });
      
      const data = await response.json();
      if (data.success) {
        setOtpId(data.otpId);
        Alert.alert('OTP Sent', 'Please enter the 6-digit code. For testing, use: 123456');
      } else {
        Alert.alert('Error', data.error || 'Failed to send OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('OTP request error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async () => {
    if (otp.length !== 6) {
      Alert.alert('Error', 'Please enter a valid 6-digit OTP');
      return;
    }

    if (!otpId) {
      Alert.alert('Error', 'Please request OTP first');
      await requestOTP();
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('https://vibeledger-app.onrender.com/api/auth/verify-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          otpId,
          otp,
          phoneNumber 
        }),
      });
      
      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', 'OTP verified successfully!', [
          { text: 'OK', onPress: onOTPSuccess }
        ]);
      } else {
        Alert.alert('Error', data.error || 'Invalid OTP');
      }
    } catch (error) {
      Alert.alert('Error', 'Network error. Please try again.');
      console.error('OTP verify error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOTP = async () => {
    setOtp('');
    setTimer(30);
    await requestOTP();
  };

  // Request OTP on component mount
  React.useEffect(() => {
    requestOTP();
  }, []);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <Text style={styles.subtitle}>Code sent to {phoneNumber}</Text>
      <Text style={styles.testInfo}>For testing, use: 123456</Text>
      <TextInput
        style={styles.input}
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        maxLength={6}
        placeholder="●●●●●●"
        editable={!isLoading}
      />
      <Text style={styles.timer}>Time left: 00:{timer.toString().padStart(2, '0')}</Text>
      <Button 
        title={isLoading ? "Verifying..." : "Verify OTP"} 
        onPress={handleVerifyOTP} 
        disabled={isLoading}
      />
      <View style={styles.buttonSpacing} />
      <Button 
        title={isLoading ? "Sending..." : "Resend OTP"} 
        onPress={handleResendOTP} 
        disabled={isLoading}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff', padding: 20 },
  title: { fontSize: 22, marginBottom: 8, fontWeight: 'bold' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 8 },
  testInfo: { fontSize: 14, color: '#007AFF', marginBottom: 16, fontStyle: 'italic' },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, fontSize: 24, padding: 12, width: 160, textAlign: 'center', marginBottom: 12 },
  timer: { fontSize: 16, marginBottom: 16 },
  buttonSpacing: { height: 10 },
});

export default OTPEntryScreen;
