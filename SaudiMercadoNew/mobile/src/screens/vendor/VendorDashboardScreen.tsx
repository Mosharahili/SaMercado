import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { theme } from '@theme/theme';

export const VendorDashboardScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>لوحة تحكم البائع</Text>
      <Text style={styles.placeholder}>إحصائيات البائع ستظهر هنا</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg },
  title: { fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text, textAlign: 'center', marginBottom: theme.spacing.lg },
  placeholder: { fontSize: theme.typography.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center' },
});