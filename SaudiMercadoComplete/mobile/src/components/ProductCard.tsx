import React, { useRef } from 'react';
import { Animated, Image, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Product } from '@app-types/models';
import { api } from '@api/client';
import { useLanguage } from '@hooks/useLanguage';
import { theme } from '@theme/theme';
import { formatSAR } from '@utils/format';

export const ProductCard = ({
  product,
  onAdd,
  onPress,
}: {
  product: Product;
  onAdd?: () => void;
  onPress?: () => void;
}) => {
  const { isRTL, tr } = useLanguage();
  const visualPad = React.useCallback((value: string) => (isRTL ? `\u200F\u061C\u00A0\u00A0${value}` : value), [isRTL]);
  const image = api.resolveAssetUrl(product.images?.[0]?.imageUrl);
  const textDirectionStyle = {
    textAlign: isRTL ? 'right' : 'left',
    alignSelf: isRTL ? 'flex-end' : 'flex-start',
    width: '100%',
  } as const;

  const addScale = useRef(new Animated.Value(1)).current;

  const handleAdd = () => {
    Animated.sequence([
      Animated.timing(addScale, {
        toValue: 0.9,
        duration: 70,
        useNativeDriver: true,
      }),
      Animated.spring(addScale, {
        toValue: 1,
        friction: 4,
        tension: 130,
        useNativeDriver: true,
      }),
    ]).start();
    onAdd?.();
  };

  return (
    <Pressable style={styles.card} onPress={onPress}>
      <View style={styles.mediaWrap}>
        {image ? <Image source={{ uri: image }} style={styles.image} resizeMode="cover" /> : <View style={styles.placeholder} />}
        <View style={styles.badge}>
          <Text style={[styles.badgeText, { }]}>
            {product.category?.nameAr ? visualPad(product.category.nameAr) : tr('منتج', 'Product')}
          </Text>
        </View>
      </View>
      <View style={styles.body}>
        <Text style={[styles.name, textDirectionStyle]} numberOfLines={2}>
          {visualPad(product.name)}
        </Text>
        <Text style={[styles.meta, textDirectionStyle]}>
          {product.market?.name ? visualPad(product.market.name) : tr('سوق الرياض', 'Riyadh Market')}
        </Text>

        <View style={styles.bottomRow}>
          <View style={styles.priceWrap}>
            <Text style={[styles.unit, { }]}>/{product.unit}</Text>
            <Text style={[styles.price, { }]}>{formatSAR(Number(product.price))}</Text>
          </View>
          <Animated.View style={[styles.addWrap, addWrapPositionStyle, { transform: [{ scale: addScale }] }]}>
            <Pressable
              onPress={(event) => {
                event.stopPropagation();
                handleAdd();
              }}
              style={styles.addButton}
            >
              <MaterialCommunityIcons name="cart-plus" size={17} color="white" style={[styles.addIcon, addIconPositionStyle]} />
              <Text style={[styles.addText, isRTL ? styles.addTextRTL : styles.addTextLTR, { }]}>
                {tr('إضافة', 'Add')}
              </Text>
            </Pressable>
          </Animated.View>
        </View>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#dcfce7',
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
    backgroundColor: '#dcfce7',
  },
  body: {
    padding: 10,
  },
  name: {
    fontWeight: '800',
    color: theme.colors.text,
    minHeight: 42,
  },
  badge: {
    position: 'absolute',
    top: 8,
    backgroundColor: 'rgba(20,83,45,0.88)',
    borderRadius: theme.radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badge: {
    end: 8,
  },
  badgeText: {
    color: 'white',
    fontSize: 11,
    fontWeight: '700',
  },
  meta: {
    color: theme.colors.textMuted,
    fontSize: 12,
    marginTop: 2,
  },
  bottomRow: {
    marginTop: 8,
    minHeight: 38,
    justifyContent: 'center',
    position: 'relative',
  },
  priceWrap: {
    position: 'absolute',
    top: 0,
    gap: 4,
    flexShrink: 1,
  },
  priceWrap: {
    end: 0,
    alignItems: 'flex-end',
  },
  addWrap: {
    position: 'absolute',
    bottom: 0,
  },
  addWrap: {
    start: 0,
  },
  price: {
    fontSize: 15,
    fontWeight: '900',
    color: theme.colors.primary,
  },
  unit: {
    color: '#166534',
    fontSize: 12,
    fontWeight: '700',
  },
  addButton: {
    position: 'relative',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    minHeight: 36,
    paddingVertical: 8,
    paddingHorizontal: 12,
    justifyContent: 'center',
  },
  addIcon: {
    position: 'absolute',
    top: 9,
  },
  addIcon: {
    end: 8,
  },
  addText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 11,
    paddingHorizontal: 20,
  },
  addTextLTR: {
    textAlign: 'left',
  },
  addTextRTL: {
    textAlign: 'right',
  },
});
