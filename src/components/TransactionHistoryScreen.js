import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet } from 'react-native';
import { getDBConnection, createTables } from '../db/sqlite';

const TransactionHistoryScreen = () => {
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
      <Text style={styles.title}>Recent Transactions</Text>
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
  title: { fontSize: 20, marginBottom: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 8 },
});

export default TransactionHistoryScreen;
