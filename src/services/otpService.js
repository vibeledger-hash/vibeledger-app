// OTP Service: Handles OTP requests and verification via Firebase
import axios from 'axios';

export const requestOTP = async (phone) => {
  // Replace with Firebase Auth or your backend endpoint
  return axios.post('/api/auth/request-otp', { phone });
};

export const verifyOTP = async (phone, otp) => {
  // Replace with Firebase Auth or your backend endpoint
  return axios.post('/api/auth/verify-otp', { phone, otp });
};
