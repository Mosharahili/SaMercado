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
      {image ? <Image source={{ uri: image }} style={styles.image} /> : <View style={styles.placeholder} />}
      <Text style={styles.name}>{product.name}</Text>
      <View style={styles.badge}>
        <Text style={styles.badgeText}>{product.category?.nameAr}</Text>
      </View>
      <Text style={styles.meta}>{product.vendor?.businessName}</Text>
      <Text style={styles.meta}>{product.market?.name}</Text>
      <Text style={styles.meta}>الوحدة: {product.unit}</Text>
      <Text style={styles.price}>{formatSAR(Number(product.price))}</Text>

      <Pressable onPress={onAdd} style={styles.addButton}>
        <MaterialCommunityIcons name="cart-plus" size={18} color="white" />
        <Text style={styles.addText}>إضافة</Text>
      </Pressable>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: '48.5%',
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: theme.radius.lg,
    padding: 10,
    ...theme.shadow.card,
  },
  image: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
  },
  placeholder: {
    width: '100%',
    height: 100,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#dcfce7',
  },
  name: {
    fontWeight: '800',
    color: theme.colors.text,
    textAlign: 'right',
  },
  badge: {
    alignSelf: 'flex-end',
    marginTop: 5,
    marginBottom: 3,
    backgroundColor: '#bbf7d0',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: {
    color: '#166534',
    fontSize: 11,
    fontWeight: '700',
  },
  meta: {
    color: theme.colors.textMuted,
    textAlign: 'right',
    fontSize: 12,
  },
  price: {
    marginTop: 6,
    textAlign: 'right',
    fontSize: 16,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  addButton: {
    marginTop: 8,
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row-reverse',
    gap: 6,
  },
  addText: {
    color: 'white',
    fontWeight: '700',
  },
});
