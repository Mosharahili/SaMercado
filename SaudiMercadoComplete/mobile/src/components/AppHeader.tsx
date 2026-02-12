import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { theme } from '@theme/theme';

export const AppHeader = ({ title, subtitle }: { title: string; subtitle?: string }) => {
  return (
    <View style={styles.container}>
      <Image source={require('../../assets/icon.png')} style={styles.logo} />
      <View style={styles.textWrap}>
        <Text style={styles.title}>{title}</Text>
        {!!subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row-reverse',
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
    textAlign: 'right',
  },
  subtitle: {
    color: '#4a6572',
    fontSize: 13,
    textAlign: 'right',
    marginTop: 2,
  },
});
