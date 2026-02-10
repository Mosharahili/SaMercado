import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@theme/theme';

export const VendorProductsScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>منتجاتي</Text>
      <TouchableOpacity style={styles.addButton}>
        <Text style={styles.addButtonText}>إضافة منتج جديد</Text>
      </TouchableOpacity>
      <Text style={styles.placeholder}>قائمة منتجاتك ستظهر هنا</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: theme.colors.background, padding: theme.spacing.lg },
  title: { fontSize: theme.typography.fontSize.xl, fontWeight: theme.typography.fontWeight.bold, color: theme.colors.text, textAlign: 'center', marginBottom: theme.spacing.lg },
  addButton: { backgroundColor: theme.colors.primary, padding: theme.spacing.md, borderRadius: theme.borderRadius.md, alignItems: 'center', marginBottom: theme.spacing.lg },
  addButtonText: { color: 'white', fontSize: theme.typography.fontSize.md, fontWeight: theme.typography.fontWeight.semibold },
  placeholder: { fontSize: theme.typography.fontSize.md, color: theme.colors.textSecondary, textAlign: 'center' },
});