import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const TestScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎉 MicroShield Test Screen</Text>
      <Text style={styles.message}>If you can see this, the app is working!</Text>
      <Text style={styles.info}>Components are loading correctly</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
  },
  message: {
    fontSize: 18,
    color: '#666',
    textAlign: 'center',
    marginBottom: 10,
  },
  info: {
    fontSize: 16,
    color: '#007AFF',
    textAlign: 'center',
  },
});

export default TestScreen;
