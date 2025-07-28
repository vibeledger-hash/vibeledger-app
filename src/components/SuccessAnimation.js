import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
// import LottieView from 'lottie-react-native'; // Uncomment if using Lottie

const SuccessAnimation = () => (
  <View style={styles.container}>
    {/* <LottieView source={require('../assets/animations/vault-lock.json')} autoPlay loop={false} /> */}
    <Text style={styles.text}>Payment Successful!</Text>
    <Text style={styles.trust}>Trust Score: 98% 🔒</Text>
  </View>
);

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#fff' },
  text: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  trust: { fontSize: 18, color: 'green' },
});

export default SuccessAnimation;
