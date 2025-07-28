import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet } from 'react-native';

const OTPEntryScreen = () => {
  const [otp, setOtp] = useState('');
  const [timer, setTimer] = useState(30);

  // Timer logic would go here

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Enter OTP</Text>
      <TextInput
        style={styles.input}
        value={otp}
        onChangeText={setOtp}
        keyboardType="numeric"
        maxLength={6}
        placeholder="●●●●●●"
      />
      <Text style={styles.timer}>Time left: 00:{timer.toString().padStart(2, '0')}</Text>
      <Button title="Resend OTP" onPress={() => {}} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  title: { fontSize: 22, marginBottom: 16 },
  input: { borderWidth: 1, borderColor: '#ccc', borderRadius: 8, fontSize: 24, padding: 12, width: 160, textAlign: 'center', marginBottom: 12 },
  timer: { fontSize: 16, marginBottom: 16 },
});

export default OTPEntryScreen;
