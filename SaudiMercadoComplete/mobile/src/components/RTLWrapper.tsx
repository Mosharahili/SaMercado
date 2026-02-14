import React, { useEffect } from 'react';
import { View, StyleSheet, I18nManager } from 'react-native';
import { useLanguage } from '@hooks/useLanguage';

export const RTLWrapper = ({ children }: { children: React.ReactNode }) => {
  const { isRTL, forceRemount } = useLanguage();

  useEffect(() => {
    I18nManager.allowRTL(true);
  }, []);

  return (
    <View
      key={`rtl-${forceRemount}`}
      style={[
        styles.container,
        {
          direction: isRTL ? 'rtl' : 'ltr',
          flexDirection: isRTL ? 'row-reverse' : 'row',
        },
      ]}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
