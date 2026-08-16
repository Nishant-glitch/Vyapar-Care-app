import { Platform } from 'react-native';

export const COLORS = {
  primaryDark: '#1B2B5E',
  gold: '#C5991A',
  white: '#FFFFFF',
  whatsapp: '#25D366',
  border: '#DDDDDD',
  grayText: '#666666',

  // GST forms me use hote hain (purane screens ke rang waise hi hain)
  danger: '#E74C3C',
  warning: '#F39C12',
  background: '#F5F5F5',
  lightBlue: '#E8F0FE',
  textDark: '#333333',
};

export const SERIF = Platform.select({
  ios: 'Georgia',
  android: 'serif',
  default: 'serif',
});

export const MONO = Platform.select({
  ios: 'Menlo',
  android: 'monospace',
  default: 'monospace',
});
