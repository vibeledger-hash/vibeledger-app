import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  TouchableOpacity, 
  StyleSheet, 
  Alert,
  ActivityIndicator 
} from 'react-native';

const WalletScreen = ({ onShowHistory }) => {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading wallet balance
    setTimeout(() => {
      setBalance(1250.50);
      setLoading(false);
    }, 1000);
  }, []);

  const handleSendMoney = () => {
    Alert.alert('Send Money', 'Send money feature coming soon!');
  };

  const handleReceiveMoney = () => {
    Alert.alert('Receive Money', 'Receive money feature coming soon!');
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#0066cc" />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>MicroShield Wallet</Text>
      
      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Current Balance</Text>
        <Text style={styles.balanceAmount}>${balance.toFixed(2)}</Text>
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.actionButton} onPress={handleSendMoney}>
          <Text style={styles.buttonText}>Send Money</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={handleReceiveMoney}>
          <Text style={styles.buttonText}>Receive Money</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.actionButton} onPress={onShowHistory}>
          <Text style={styles.buttonText}>Transaction History</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: '#333',
  },
  balanceCard: {
    backgroundColor: '#0066cc',
    borderRadius: 12,
    padding: 30,
    marginBottom: 40,
    alignItems: 'center',
  },
  balanceLabel: {
    color: '#fff',
    fontSize: 16,
    marginBottom: 8,
  },
  balanceAmount: {
    color: '#fff',
    fontSize: 36,
    fontWeight: 'bold',
  },
  buttonContainer: {
    flex: 1,
  },
  actionButton: {
    backgroundColor: '#fff',
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#0066cc',
  },
});

export default WalletScreen;
