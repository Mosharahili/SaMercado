import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { useLanguage } from '@hooks/useLanguage';
import { theme } from '@theme/theme';

export const StatCard = ({ label, value }: { label: string; value: string }) => {
  const { isRTL } = useLanguage();

  return (
    <View style={styles.card}>
      <Text style={[styles.value, { textAlign: isRTL ? 'right' : 'left' }]}>{value}</Text>
      <Text style={[styles.label, { textAlign: isRTL ? 'right' : 'left' }]}>{label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    minWidth: 140,
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: theme.radius.md,
    padding: theme.spacing.md,
    ...theme.shadow.card,
  },
  value: {
    fontSize: 24,
    fontWeight: '800',
    color: theme.colors.primary,
  },
  label: {
    fontSize: 13,
    color: theme.colors.textMuted,
  },
});
