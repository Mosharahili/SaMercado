import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { ScreenContainer } from '@components/ScreenContainer';
import { api } from '@api/client';
import { useLanguage } from '@hooks/useLanguage';

export const VendorProductsScreen = () => {
  const { isRTL, tr } = useLanguage();
  const [products, setProducts] = useState<any[]>([]);

  useEffect(() => {
    (async () => {
      try {
        const response = await api.get<{ products: any[] }>('/products');
        setProducts(response.products || []);
      } catch {
        setProducts([]);
      }
    })();
  }, []);

  return (
    <ScreenContainer>
      {products.map((product) => (
        <View key={product.id} style={styles.item}>
          <Text style={[styles.title, { textAlign: isRTL ? 'right' : 'left' }]}>{product.name}</Text>
          <Text style={[styles.meta, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('السعر', 'Price')}: {product.price} ر.س</Text>
          <Text style={[styles.meta, { textAlign: isRTL ? 'right' : 'left' }]}>{tr('الوحدة', 'Unit')}: {product.unit}</Text>
        </View>
      ))}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  item: { backgroundColor: 'rgba(255,255,255,0.96)', borderRadius: 12, padding: 12, gap: 4 },
  title: { fontWeight: '800', color: '#14532d' },
  meta: { color: '#4b5563' },
});
