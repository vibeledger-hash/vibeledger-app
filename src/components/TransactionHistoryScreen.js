import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity } from 'react-native';
import { getDBConnection, createTables } from '../db/sqlite';

const TransactionHistoryScreen = ({ onBack }) => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    const loadTransactions = async () => {
      const db = await getDBConnection();
      await createTables(db);
      const [txResult] = await db.executeSql('SELECT * FROM pending_transactions ORDER BY created_at DESC');
      const txs = [];
      for (let i = 0; i < txResult.rows.length; i++) {
        txs.push(txResult.rows.item(i));
      }
      setTransactions(txs);
    };
    loadTransactions();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity style={styles.backButton} onPress={onBack}>
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Recent Transactions</Text>
      </View>
      <FlatList
        data={transactions}
        keyExtractor={item => item.id?.toString()}
        renderItem={({ item }) => (
          <View style={styles.row}>
            <Text>{item.merchant_id}</Text>
            <Text>{item.amount}</Text>
            <Text>{item.status}</Text>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, backgroundColor: '#fff' },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  backButton: { marginRight: 16 },
  backButtonText: { fontSize: 16, color: '#0066cc' },
  title: { fontSize: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
});

export default TransactionHistoryScreen;
