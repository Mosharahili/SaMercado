import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Market } from '@app-types/models';
import { theme } from '@theme/theme';

export const MarketCard = ({ market, onBrowse }: { market: Market; onBrowse?: () => void }) => {
  return (
    <View style={styles.card}>
      <View style={styles.row}>
        <MaterialCommunityIcons name="storefront-outline" size={26} color={theme.colors.primary} />
        <Text style={styles.title}>{market.name}</Text>
      </View>
      <Text style={styles.meta}>المنطقة: {market.region}</Text>
      {market.description ? <Text style={styles.description}>{market.description}</Text> : null}
      <Text style={styles.meta}>عدد البائعين: {market._count?.vendorLinks ?? 0}</Text>
      <Text style={styles.meta}>ساعات العمل: {market.operatingHours || 'غير محدد'}</Text>
      <Text style={styles.meta}>نطاق الأسعار: {market.priceRange || 'غير محدد'}</Text>

      <Pressable style={styles.button} onPress={onBrowse}>
        <Text style={styles.buttonText}>تصفح السوق</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: 6,
    ...theme.shadow.card,
  },
  row: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 8,
  },
  title: {
    flex: 1,
    textAlign: 'right',
    fontWeight: '800',
    fontSize: 16,
    color: theme.colors.text,
  },
  description: {
    textAlign: 'right',
    color: theme.colors.textMuted,
    fontSize: 13,
  },
  meta: {
    textAlign: 'right',
    color: '#166534',
    fontSize: 12,
  },
  button: {
    marginTop: 8,
    backgroundColor: '#dcfce7',
    borderRadius: theme.radius.md,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: theme.colors.primary,
    fontWeight: '700',
  },
});
