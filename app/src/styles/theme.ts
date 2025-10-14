
import { useColorScheme } from 'react-native';

export type BrandTheme = {
  name: 'light' | 'dark';
  bg: string;
  card: string;
  text: string;
  muted: string;
  accent: string;
  border: string;
  success: string;
  danger: string;
  shadow: string;
  gradient: [string, string];
};

export const lightTheme: BrandTheme = {
  name: 'light',
  bg: '#FFFFFF',
  card: '#FFFFFF',
  text: '#0E1A18',
  muted: '#607376',
  accent: '#16C79A',
  border: '#E5E7EB',
  success: '#16C79A',
  danger: '#DB4437',
  shadow: 'rgba(0,0,0,0.06)',
  gradient: ['#0E2A28', '#061A18']
};

export const darkTheme: BrandTheme = {
  name: 'dark',
  bg: '#071311',
  card: '#0B1A18',
  text: '#E6F3F1',
  muted: '#9BB3B0',
  accent: '#23E5B7',
  border: '#0E2A28',
  success: '#23E5B7',
  danger: '#FF6B6B',
  shadow: 'rgba(0,0,0,0.4)',
  gradient: ['#0B2421', '#051311']
};

export function useBrandTheme(): BrandTheme {
  const scheme = useColorScheme();
  return scheme === 'dark' ? darkTheme : lightTheme;
}
