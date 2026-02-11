import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Product } from '@app-types/models';
import { api } from '@api/client';
import { theme } from '@theme/theme';
import { formatSAR } from '@utils/format';

export const ProductCard = ({
  product,
  onAdd,
}: {
  product: Product;
  onAdd?: () => void;
}) => {
  const image = api.resolveAssetUrl(product.images?.[0]?.imageUrl);

  return (
    <View style={styles.card}>
      <View style={styles.mediaWrap}>
        {image ? <Image source={{ uri: image }} style={styles.image} /> : <View style={styles.placeholder} />}
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{product.category?.nameAr}</Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={styles.name} numberOfLines={2}>
          {product.name}
        </Text>
        <Text style={styles.meta}>{product.market?.name}</Text>
        <Text style={styles.meta}>{product.vendor?.businessName}</Text>

        <View style={styles.bottomRow}>
          <View style={styles.priceWrap}>
            <Text style={styles.unit}>/{product.unit}</Text>
            <Text style={styles.price}>{formatSAR(Number(product.price))}</Text>
          </View>
          <Pressable onPress={onAdd} style={styles.addButton}>
            <MaterialCommunityIcons name="cart-plus" size={17} color="white" />
            <Text style={styles.addText}>إضافة</Text>
          </Pressable>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    ...theme.shadow.card,
  },
  mediaWrap: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: 140,
  },
  placeholder: {
    width: '100%',
    height: 140,
    backgroundColor: '#cffafe',
  },
  body: {
    padding: 10,
  },
  name: {
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'right',
    minHeight: 42,
  },
  badge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(12,74,110,0.82)',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  meta: {
    color: theme.colors.textMuted,
    textAlign: 'right',
    fontSize: 12,
  },
  bottomRow: {
    marginTop: 8,
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 10,
  },
  priceWrap: {
    flexDirection: 'row-reverse',
    alignItems: 'baseline',
    gap: 4,
  },
  price: {
    textAlign: 'right',
    fontSize: 15,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  unit: {
    color: '#0e7490',
    fontSize: 12,
    fontWeight: '700',
  },
  addButton: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 7,
    paddingHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row-reverse',
    gap: 6,
  },
  addText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
});
