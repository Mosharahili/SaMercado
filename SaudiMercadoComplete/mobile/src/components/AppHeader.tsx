import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@hooks/useLanguage';
import { theme } from '@theme/theme';

export const AppHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  const { isRTL } = useLanguage();

  return (
    <View style={[styles.container, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
      <Image source={require('../../assets/icon.png')} style={styles.logo} resizeMode="cover" />
      <View style={styles.textWrap}>
        <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>{title}</Text>
        {!!subtitle && <Text style={[styles.subtitle, { textAlign: isRTL ? 'right' : 'left' }]}>{subtitle}</Text>}
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
