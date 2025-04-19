import { Dimensions, PixelRatio, Platform } from 'react-native';

// Get dimensions
const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Base dimensions (iPhone 12/13/14)
const baseWidth = 390;
const baseHeight = 844;

// Helper functions
export const wp = (percentage) => {
  const value = (percentage * screenWidth) / 100;
  return Math.round(value);
};

export const hp = (percentage) => {
  const value = (percentage * screenHeight) / 100;
  return Math.round(value);
};

export const scale = (size) => {
  const ratio = screenWidth / baseWidth;
  const newSize = size * ratio;
  return Math.round(newSize);
};

export const verticalScale = (size) => {
  const ratio = screenHeight / baseHeight;
  const newSize = size * ratio;
  return Math.round(newSize);
};

export const moderateScale = (size, factor = 0.5) => {
  const ratio = screenWidth / baseWidth;
  const newSize = size + (size * (ratio - 1) * factor);
  return Math.round(newSize);
};

// Font scaling with safeguards
export const fontScale = (size) => {
  const ratio = Math.min(screenWidth / baseWidth, 1.2); // Cap at 120% scaling
  const newSize = size * ratio;
  
  // Platform-specific adjustments
  if (Platform.OS === 'ios') {
    return Math.round(PixelRatio.roundToNearestPixel(newSize));
  } else {
    return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 1; // Slight reduction on Android
  }
};

// Responsive padding based on device size
export const getResponsivePadding = () => {
  if (screenWidth < 360) return scale(12);      // Small phones
  if (screenWidth < 400) return scale(16);      // Medium phones
  if (screenWidth < 600) return scale(20);      // Large phones
  return scale(24);                             // Tablets and larger screens
};

// Device type detection
export const isTablet = () => {
  return screenWidth >= 600;
};

// Screen size breakpoints
export const Breakpoints = {
  small: 360,
  medium: 400,
  large: 600,
  extraLarge: 960
};

// Dimensions listener utility
export const useDimensionsListener = (callback) => {
  return Dimensions.addEventListener('change', ({ window }) => {
    callback(window.width, window.height);
  });
};

export default {
  wp,
  hp,
  scale,
  verticalScale,
  moderateScale,
  fontScale,
  getResponsivePadding,
  isTablet,
  Breakpoints,
  screenWidth,
  screenHeight,
  useDimensionsListener
};