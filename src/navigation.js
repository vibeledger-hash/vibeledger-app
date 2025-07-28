import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import WalletScreen from './components/WalletScreen';
import OTPEntryScreen from './components/OTPEntryScreen';
import BLEPairingScreen from './components/BLEPairingScreen';
import QRScannerScreen from './components/QRScannerScreen';
import PaymentScreen from './components/PaymentScreen';
import TransactionHistoryScreen from './components/TransactionHistoryScreen';
import SuccessAnimation from './components/SuccessAnimation';

const Stack = createStackNavigator();

const AppNavigator = () => (
  <NavigationContainer>
    <Stack.Navigator initialRouteName="Wallet">
      <Stack.Screen 
        name="Wallet" 
        component={WalletScreen}
        options={{ title: 'MicroShield Wallet' }}
      />
      <Stack.Screen 
        name="OTPEntry" 
        component={OTPEntryScreen}
        options={{ title: 'Enter OTP' }}
      />
      <Stack.Screen 
        name="BLEPairing" 
        component={BLEPairingScreen}
        options={{ title: 'Discover Merchants' }}
      />
      <Stack.Screen 
        name="QRScannerScreen" 
        component={QRScannerScreen}
        options={{ title: 'Scan QR Code' }}
      />
      <Stack.Screen 
        name="PaymentScreen" 
        component={PaymentScreen}
        options={{ title: 'Make Payment' }}
      />
      <Stack.Screen 
        name="Transactions" 
        component={TransactionHistoryScreen}
        options={{ title: 'Transaction History' }}
      />
      <Stack.Screen 
        name="Success" 
        component={SuccessAnimation}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  </NavigationContainer>
);

export default AppNavigator;
