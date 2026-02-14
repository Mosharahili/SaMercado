import { useLanguage } from './useLanguage';
import { StyleSheet } from 'react-native';

export const useRTLStyles = () => {
  const { isRTL } = useLanguage();

  const screenStyles = StyleSheet.create({
    container: {
      flex: 1,
      direction: isRTL ? 'rtl' : 'ltr',
    },
    row: {
      flexDirection: isRTL ? 'row-reverse' : 'row',
    },
    textRight: {
      textAlign: isRTL ? 'right' : 'left',
      writingDirection: isRTL ? 'rtl' : 'ltr',
    },
    paddingStart: {
      paddingLeft: isRTL ? 0 : 16,
      paddingRight: isRTL ? 16 : 0,
    },
    paddingEnd: {
      paddingLeft: isRTL ? 16 : 0,
      paddingRight: isRTL ? 0 : 16,
    },
    marginStart: {
      marginLeft: isRTL ? 0 : 12,
      marginRight: isRTL ? 12 : 0,
    },
    marginEnd: {
      marginLeft: isRTL ? 12 : 0,
      marginRight: isRTL ? 0 : 12,
    },
  });

  return { isRTL, screenStyles };
};
