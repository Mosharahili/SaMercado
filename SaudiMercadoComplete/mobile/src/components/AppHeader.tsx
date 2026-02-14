import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@hooks/useLanguage';
import { theme } from '@theme/theme';

export const AppHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  const { isRTL } = useLanguage();
  const textDirectionStyle = {
    textAlign: isRTL ? 'right' : 'left',
    writingDirection: isRTL ? 'rtl' : 'ltr',
  } as const;

  return (
    <View style={[styles.container, { }]}>
      <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="cover" />
      <View style={[styles.textWrap, isRTL ? styles.textWrapRTL : styles.textWrapLTR]}>
        <Text style={[styles.title, textDirectionStyle]}>{title}</Text>
        {!!subtitle && <Text style={[styles.subtitle, textDirectionStyle]}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    gap: theme.spacing.md,
  },
  logo: {
    width: 54,
    height: 54,
    borderRadius: 14,
    borderWidth: 2,
    borderColor: '#bbf7d0',
  },
  textWrap: {
    flex: 1,
  },
  textWrapLTR: {
    alignItems: 'flex-start',
  },
  textWrapRTL: {
    alignItems: 'flex-end',
  },
  title: {
    color: '#0f2f3d',
    fontSize: 20,
    fontWeight: '800',
  },
  subtitle: {
    color: '#4a6572',
    fontSize: 13,
    marginTop: 2,
  },
});
