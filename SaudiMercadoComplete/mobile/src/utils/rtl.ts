import { I18nManager } from 'react-native';

export const initializeRTL = (isRTL: boolean) => {
  try {
    // Set allowRTL to true to enable RTL support
    I18nManager.allowRTL(true);
    I18nManager.forceRTL(isRTL);
  } catch (error) {
    console.warn('Failed to set RTL:', error);
  }
};

export const getRTLStyle = (isRTL: boolean) => ({
  direction: isRTL ? ('rtl' as const) : ('ltr' as const),
  textAlign: isRTL ? ('right' as const) : ('left' as const),
  writingDirection: isRTL ? ('rtl' as const) : ('ltr' as const),
});

export const getRTLFlexStyle = (isRTL: boolean) => ({
  flexDirection: isRTL ? ('row-reverse' as const) : ('row' as const),
});
