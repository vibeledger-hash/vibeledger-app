// Encryption Utils: AES-256 encryption for local logs
import CryptoJS from 'crypto-js';

export const encrypt = (data, key) => {
  return CryptoJS.AES.encrypt(data, key).toString();
};

export const decrypt = (cipher, key) => {
  return CryptoJS.AES.decrypt(cipher, key).toString(CryptoJS.enc.Utf8);
};
