// src/theme/responsive.ts
import { useWindowDimensions } from 'react-native';

const BASE_WIDTH = 375;   // iPhone baseline
const BASE_HEIGHT = 812;

export function scale(size: number, width: number) {
  return (width / BASE_WIDTH) * size;
}

export function verticalScale(size: number, height: number) {
  return (height / BASE_HEIGHT) * size;
}

export function useResponsive() {
  const { width, height } = useWindowDimensions(); // ✅ hook inside hook

  const isTablet = width >= 768;

  const typography = {
    title: scale(isTablet ? 24 : 22, width),
    subtitle: scale(isTablet ? 18 : 16, width),
    body: scale(isTablet ? 16 : 14, width),
    small: scale(isTablet ? 14 : 12, width),
  };

  const spacing = {
    s: scale(8, width),
    m: scale(12, width),
    l: scale(16, width),
    xl: scale(24, width),
  };

  return { width, height, isTablet, typography, spacing };
}
