import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Market } from '@app-types/models';
import { api } from '@api/client';
import { theme } from '@theme/theme';

export const MarketCard = ({ market }: { market: Market; onBrowse?: () => void }) => {
  const image = api.resolveAssetUrl(market.imageUrl);

  return (
    <View style={styles.card}>
      {image ? <Image source={{ uri: image }} style={styles.image} resizeMode="cover" /> : <View style={styles.placeholder} />}
      <View style={styles.row}>
        <MaterialCommunityIcons name="storefront-outline" size={26} color={theme.colors.primary} />
        <Text style={styles.title}>{market.name}</Text>
      </View>
      <Text style={styles.description}>{market.description || 'سوق موثوق بمنتجات طازجة وجودة يومية.'}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: theme.radius.lg,
    padding: theme.spacing.md,
    gap: 10,
    borderWidth: 1,
    borderColor: '#dcfce7',
    ...theme.shadow.card,
  },
  image: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#ecfdf3',
  },
  placeholder: {
    width: '100%',
    height: 160,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
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
});
