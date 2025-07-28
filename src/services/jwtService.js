// JWT Service: Handles storing and retrieving JWT tokens
import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveToken = async (token) => {
  await AsyncStorage.setItem('jwt', token);
};

export const getToken = async () => {
  return AsyncStorage.getItem('jwt');
};
