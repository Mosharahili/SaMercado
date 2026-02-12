import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Image, Modal, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { ProductCard } from '@components/ProductCard';
import { AppButton } from '@components/AppButton';
import { BannerCarousel } from '@components/BannerCarousel';
import { useCart } from '@hooks/useCart';
import { api } from '@api/client';
import { Banner, Product } from '@app-types/models';
import { mockBanners, mockProducts } from '@utils/mockData';
import { formatSAR } from '@utils/format';
import { theme } from '@theme/theme';

export const ProductsScreen = () => {
  const { addToCart } = useCart();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [topBanners, setTopBanners] = useState<Banner[]>(mockBanners);
  const [inlineOffers, setInlineOffers] = useState<Banner[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = async (keyword?: string) => {
    const q = keyword ?? search;
    try {
      const response = await api.get<{ products: Product[] }>(`/products?search=${encodeURIComponent(q.trim())}`);
      setProducts(response.products || []);
    } catch (_error) {
      setProducts(mockProducts);
    }
  };

  useEffect(() => {
    const load = async () => {
      try {
        const [productsRes, topRes, offerRes] = await Promise.all([
          api.get<{ products: Product[] }>('/products'),
          api.get<{ banners: Banner[] }>('/banners/active?placement=PRODUCT_TOP'),
          api.get<{ banners: Banner[] }>('/banners/active?placement=PRODUCT_INLINE'),
        ]);

        setProducts(productsRes.products?.length ? productsRes.products : mockProducts);
        setTopBanners(topRes.banners?.length ? topRes.banners : mockBanners);
        setInlineOffers(offerRes.banners || []);
      } catch (_error) {
        setProducts(mockProducts);
        setTopBanners(mockBanners);
      }
    };

    load();
  }, []);

  const visibleProducts = useMemo(() => {
    if (!search.trim()) return products;

    return products.filter((product) => {
      const keyword = search.toLowerCase();
      return (
        product.name.toLowerCase().includes(keyword) ||
        product.market.name.toLowerCase().includes(keyword) ||
        product.vendor.businessName.toLowerCase().includes(keyword)
      );
    });
  }, [products, search]);

  const topOffer = inlineOffers[0];
  const topOfferImage = api.resolveAssetUrl(topOffer?.imageUrl);

  return (
    <ScreenContainer>
      <AppHeader title="المنتجات" subtitle="تشكيلة يومية طازجة" />

      <BannerCarousel banners={topBanners} />

      {topOffer ? (
        <View style={styles.offerCard}>
          <Text style={styles.offerTag}>عرض خاص</Text>
          {topOfferImage ? <Image source={{ uri: topOfferImage }} style={styles.offerImage} /> : null}
          <Text style={styles.offerTitle}>{topOffer.title}</Text>
          {!!topOffer.description && <Text style={styles.offerDesc}>{topOffer.description}</Text>}
        </View>
      ) : null}

      <View style={styles.searchWrap}>
        <Pressable
          style={styles.searchBtn}
          onPress={() => {
            setSearch(searchInput);
            fetchProducts(searchInput);
          }}
        >
          <MaterialCommunityIcons name="magnify" size={20} color="white" />
        </Pressable>
        <TextInput
          style={styles.searchInput}
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder="ابحث عن منتج أو سوق أو بائع"
          placeholderTextColor="#6b7280"
          textAlign="right"
          onSubmitEditing={() => {
            setSearch(searchInput);
            fetchProducts(searchInput);
          }}
        />
      </View>

      <View style={styles.rowBetween}>
        <Text style={styles.countText}>عدد المنتجات: {visibleProducts.length}</Text>
        <Pressable onPress={() => setViewMode((v) => (v === 'grid' ? 'list' : 'grid'))} style={styles.toggleBtn}>
          <MaterialCommunityIcons name={viewMode === 'grid' ? 'view-list' : 'view-grid'} size={20} color="white" />
          <Text style={styles.toggleText}>{viewMode === 'grid' ? 'عرض قائمة' : 'عرض شبكي'}</Text>
        </Pressable>
      </View>

      <FlatList
        data={visibleProducts}
        key={viewMode}
        numColumns={viewMode === 'grid' ? 2 : 1}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={viewMode === 'grid' ? { justifyContent: 'space-between' } : undefined}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={{ width: viewMode === 'grid' ? '48.7%' : '100%' }}>
            <ProductCard product={item} onAdd={() => addToCart(item)} onPress={() => setSelectedProduct(item)} />
          </View>
        )}
      />

      <Modal visible={!!selectedProduct} transparent animationType="fade" onRequestClose={() => setSelectedProduct(null)}>
        <View style={styles.previewOverlay}>
          <View style={styles.previewCard}>
            <View style={styles.previewHeader}>
              <Pressable onPress={() => setSelectedProduct(null)} style={styles.previewClose}>
                <MaterialCommunityIcons name="close" size={20} color="#0f2f3d" />
              </Pressable>
              <Text style={styles.previewTitle}>تفاصيل المنتج</Text>
            </View>

            {selectedProduct ? (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.previewImagesRow}
                >
                  {(selectedProduct.images?.length
                    ? selectedProduct.images
                    : [{ id: 'placeholder', imageUrl: '' }]
                  ).map((image) => {
                    const src = api.resolveAssetUrl(image.imageUrl);
                    return src ? (
                      <Image key={image.id} source={{ uri: src }} style={styles.previewImage} />
                    ) : (
                      <View key={image.id} style={styles.previewImagePlaceholder} />
                    );
                  })}
                </ScrollView>

                <Text style={styles.previewName}>{selectedProduct.name}</Text>
                <Text style={styles.previewMeta}>التصنيف: {selectedProduct.category?.nameAr || '-'}</Text>
                <Text style={styles.previewMeta}>السوق: {selectedProduct.market?.name || '-'}</Text>
                <Text style={styles.previewMeta}>البائع: {selectedProduct.vendor?.businessName || '-'}</Text>
                <Text style={styles.previewMeta}>{selectedProduct.description || 'منتج طازج بجودة عالية.'}</Text>
                <Text style={styles.previewPrice}>
                  {formatSAR(Number(selectedProduct.price))} / {selectedProduct.unit}
                </Text>

                <AppButton
                  label="إضافة إلى السلة"
                  onPress={() => {
                    addToCart(selectedProduct);
                    setSelectedProduct(null);
                  }}
                />
              </>
            ) : null}
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  offerCard: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: '#67e8f9',
    gap: 8,
  },
  offerTag: {
    alignSelf: 'flex-end',
    backgroundColor: '#cffafe',
    color: '#0e7490',
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  offerImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    backgroundColor: '#ecfeff',
  },
  offerTitle: {
    textAlign: 'right',
    color: theme.colors.text,
    fontWeight: '900',
    fontSize: 16,
  },
  offerDesc: {
    textAlign: 'right',
    color: theme.colors.textMuted,
  },
  searchWrap: {
    flexDirection: 'row-reverse',
    gap: 8,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#99f6e4',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingHorizontal: 12,
    paddingVertical: 11,
  },
  searchBtn: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowBetween: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countText: {
    color: '#0e7490',
    fontWeight: '700',
  },
  toggleBtn: {
    flexDirection: 'row-reverse',
    gap: 6,
    alignItems: 'center',
    backgroundColor: '#0d9488',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  toggleText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
  previewOverlay: {
    flex: 1,
    backgroundColor: 'rgba(5, 15, 25, 0.45)',
    justifyContent: 'center',
    padding: 18,
  },
  previewCard: {
    backgroundColor: 'rgba(255,255,255,0.98)',
    borderRadius: 18,
    padding: 14,
    gap: 8,
    maxHeight: '85%',
  },
  previewHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewTitle: {
    color: '#0f2f3d',
    fontWeight: '900',
    fontSize: 17,
    textAlign: 'right',
  },
  previewClose: {
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: '#ecfeff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewImagesRow: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  previewImage: {
    width: 220,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#cffafe',
  },
  previewImagePlaceholder: {
    width: 220,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#cffafe',
  },
  previewName: {
    textAlign: 'right',
    color: '#0f2f3d',
    fontWeight: '900',
    fontSize: 18,
  },
  previewMeta: {
    textAlign: 'right',
    color: '#4a6572',
  },
  previewPrice: {
    textAlign: 'right',
    color: '#0f766e',
    fontWeight: '900',
    fontSize: 16,
  },
});
