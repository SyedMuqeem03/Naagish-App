import { Dimensions, PixelRatio, Platform } from 'react-native';

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

// Base dimensions that we're designing for
const baseWidth = 390; // iPhone 13/14 width
const baseHeight = 844; // iPhone 13/14 height

// Scales the size based on the screen width
export const widthScale = (size) => {
    return (SCREEN_WIDTH / baseWidth) * size;
};

// Scales the size based on the screen height
export const heightScale = (size) => {
    return (SCREEN_HEIGHT / baseHeight) * size;
};

// Scales the size based on the screen width for fonts
export const fontScale = (size) => {
    const scale = SCREEN_WIDTH / baseWidth;
    const newSize = size * scale;

    // Cap font scaling on larger screens, and ensure minimum font size
    if (Platform.OS === 'ios') {
        return Math.round(PixelRatio.roundToNearestPixel(newSize));
    } else {
        return Math.round(PixelRatio.roundToNearestPixel(newSize)) - 2;
    }
};

// Returns responsive paddings for containers
export const getResponsivePadding = () => {
    if (SCREEN_WIDTH < 375) {
        return 12; // Small phones (iPhone SE etc)
    } else if (SCREEN_WIDTH < 414) {
        return 16; // Medium phones (iPhone X, 11, 12, 13, etc.)
    } else if (SCREEN_WIDTH < 768) {
        return 20; // Large phones (iPhone Plus, Pro Max, etc.)
    } else {
        return 24; // Tablets and larger screens
    }
};

// Handle responsive sizing for components
export const getResponsiveSize = (small, medium, large) => {
    if (SCREEN_WIDTH < 375) {
        return small;
    } else if (SCREEN_WIDTH < 414) {
        return medium;
    } else {
        return large;
    }
};

// Listen for dimension changes
export const useDimensionsListener = (callback) => {
    Dimensions.addEventListener('change', ({ window }) => {
        const { width, height } = window;
        callback(width, height);
    });
};

// Create dynamic styles that will update with dimension changes
export const createDynamicStyle = (dimensions, styleFunction) => {
    if (!dimensions) {
        // If no dimensions provided, use the current screen size
        dimensions = { width: SCREEN_WIDTH, height: SCREEN_HEIGHT };
    }
    return styleFunction(dimensions);
};

export default {
    widthScale,
    heightScale,
    fontScale,
    getResponsivePadding,
    getResponsiveSize,
    useDimensionsListener,
    createDynamicStyle,
    SCREEN_WIDTH,
    SCREEN_HEIGHT
}; 