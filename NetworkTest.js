// Simple network test for the mobile app
import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert } from 'react-native';

const NetworkTest = () => {
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testBackend = async () => {
    setLoading(true);
    setTestResult('Testing...');

    try {
      // Test 1: Health check
      console.log('🧪 Testing health endpoint...');
      const healthResponse = await fetch('https://vibeledger-app.onrender.com/health');
      const healthData = await healthResponse.json();
      console.log('✅ Health check:', healthData);

      // Test 2: OTP endpoint
      console.log('🧪 Testing OTP endpoint...');
      const otpResponse = await fetch('https://vibeledger-app.onrender.com/api/auth/request-otp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ phoneNumber: '+919876543210' })
      });

      const otpData = await otpResponse.json();
      console.log('✅ OTP test:', otpData);

      setTestResult(`✅ SUCCESS!\nHealth: ${healthData.status}\nOTP: ${otpData.success ? 'Working' : 'Failed'}`);
      
      Alert.alert('Network Test', 'Backend is reachable and working!');
    } catch (error) {
      console.error('❌ Network test failed:', error);
      setTestResult(`❌ FAILED: ${error.message}`);
      Alert.alert('Network Test Failed', error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Network Test</Text>
      <TouchableOpacity 
        style={styles.button} 
        onPress={testBackend}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Testing...' : 'Test Backend Connection'}
        </Text>
      </TouchableOpacity>
      {testResult ? (
        <Text style={styles.result}>{testResult}</Text>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#3498db',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  result: {
    fontSize: 14,
    textAlign: 'center',
    padding: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
});

export default NetworkTest;
