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
import { formatSAR } from '@utils/format';
import { theme } from '@theme/theme';
import { useLanguage } from '@hooks/useLanguage';

export const ProductsScreen = () => {
  const { addToCart } = useCart();
  const { isRTL, tr } = useLanguage();
  const textDirectionStyle = {
    writingDirection: isRTL ? 'rtl' : 'ltr',
    textAlign: isRTL ? 'right' : 'left',
  } as const;
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'VEGETABLES' | 'FRUITS' | 'DATES'>('ALL');

  const [products, setProducts] = useState<Product[]>([]);
  const [topBanners, setTopBanners] = useState<Banner[]>([]);
  const [inlineOffers, setInlineOffers] = useState<Banner[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = async (keyword?: string) => {
    const q = keyword ?? search;
    try {
      const response = await api.get<{ products: Product[] }>(`/products?search=${encodeURIComponent(q.trim())}`);
      setProducts(response.products || []);
    } catch (_error) {
      setProducts([]);
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

        setProducts(productsRes.products || []);
        setTopBanners(topRes.banners || []);
        setInlineOffers(offerRes.banners || []);
      } catch (_error) {
        setProducts([]);
        setTopBanners([]);
      }
    };

    load();
  }, []);

  const visibleProducts = useMemo(() => {
    return products.filter((product) => {
      const keyword = search.toLowerCase();
      const matchesSearch = !search.trim() || (
        product.name.toLowerCase().includes(keyword) ||
        (product.market?.name || '').toLowerCase().includes(keyword)
      );

      const categoryRaw = `${product.category?.slug || ''} ${product.category?.nameAr || ''}`.toLowerCase();
      const categoryKey: 'VEGETABLES' | 'FRUITS' | 'DATES' | 'ALL' =
        categoryRaw.includes('date') || categoryRaw.includes('تمر')
          ? 'DATES'
          : categoryRaw.includes('fruit') || categoryRaw.includes('فواك')
            ? 'FRUITS'
            : categoryRaw.includes('vegetable') || categoryRaw.includes('خض')
              ? 'VEGETABLES'
              : 'ALL';

      const matchesCategory = categoryFilter === 'ALL' || categoryKey === categoryFilter;
      return matchesSearch && matchesCategory;
    });
  }, [products, search, categoryFilter]);

  const topOffer = inlineOffers[0];
  const topOfferImage = api.resolveAssetUrl(topOffer?.imageUrl);

  return (
    <ScreenContainer>
      <AppHeader title={tr('المنتجات', 'Products')} subtitle={tr('تشكيلة يومية طازجة', 'Fresh daily selection')} />

      <BannerCarousel banners={topBanners} />

      {topOffer ? (
        <View style={styles.offerCard}>
          <Text style={[styles.offerTag, { alignSelf: isRTL ? 'flex-end' : 'flex-start', writingDirection: isRTL ? 'rtl' : 'ltr' }]}>{tr('عرض خاص', 'Special Offer')}</Text>
          {topOfferImage ? <Image source={{ uri: topOfferImage }} style={styles.offerImage} resizeMode="cover" /> : null}
          <Text style={[styles.offerTitle, textDirectionStyle]}>{topOffer.title}</Text>
          {!!topOffer.description && <Text style={[styles.offerDesc, textDirectionStyle]}>{topOffer.description}</Text>}
        </View>
      ) : null}

      <View style={[styles.searchWrap, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
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
          style={[styles.searchInput, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}
          value={searchInput}
          onChangeText={setSearchInput}
          placeholder={tr('ابحث عن منتج أو سوق', 'Search for a product or market')}
          placeholderTextColor="#6b7280"
          textAlign={isRTL ? 'right' : 'left'}
          onSubmitEditing={() => {
            setSearch(searchInput);
            fetchProducts(searchInput);
          }}
        />
      </View>

      <View style={[styles.filtersRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        {[
          { key: 'ALL', label: tr('الكل', 'All') },
          { key: 'DATES', label: tr('تمور', 'Dates') },
          { key: 'VEGETABLES', label: tr('خضار', 'Vegetables') },
          { key: 'FRUITS', label: tr('فواكه', 'Fruits') },
        ].map((item) => {
          const active = categoryFilter === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => setCategoryFilter(item.key as 'ALL' | 'VEGETABLES' | 'FRUITS' | 'DATES')}
              style={[styles.filterChip, active ? styles.filterChipActive : null]}
            >
              <Text style={[styles.filterText, active ? styles.filterTextActive : null]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </View>

      <View style={[styles.rowBetween, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
        <Text style={[styles.countText, textDirectionStyle]}>{tr('عدد المنتجات', 'Products count')}: {visibleProducts.length}</Text>
        <Pressable onPress={() => setViewMode((v) => (v === 'grid' ? 'list' : 'grid'))} style={[styles.toggleBtn, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
          <MaterialCommunityIcons name={viewMode === 'grid' ? 'view-list' : 'view-grid'} size={20} color="white" />
          <Text style={[styles.toggleText, { writingDirection: isRTL ? 'rtl' : 'ltr' }]}>{viewMode === 'grid' ? tr('عرض قائمة', 'List View') : tr('عرض شبكي', 'Grid View')}</Text>
        </Pressable>
      </View>

      {!visibleProducts.length ? <Text style={[styles.emptyText, textDirectionStyle]}>{tr('لا توجد منتجات مطابقة حالياً.', 'No matching products found right now.')}</Text> : null}

      <FlatList
        data={visibleProducts}
        key={viewMode}
        numColumns={viewMode === 'grid' ? 2 : 1}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={viewMode === 'grid' ? { justifyContent: 'space-between', gap: 8 } : undefined}
        contentContainerStyle={{ gap: 12, paddingBottom: 24 }}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <View style={{ width: viewMode === 'grid' ? '49%' : '100%' }}>
            <ProductCard product={item} onAdd={() => addToCart(item)} onPress={() => setSelectedProduct(item)} />
          </View>
        )}
      />

      <Modal visible={!!selectedProduct} transparent animationType="fade" onRequestClose={() => setSelectedProduct(null)}>
        <View style={styles.previewOverlay}>
          <View style={styles.previewCard}>
            <View style={[styles.previewHeader, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}>
              <Pressable onPress={() => setSelectedProduct(null)} style={styles.previewClose}>
                <MaterialCommunityIcons name="close" size={20} color="#0f2f3d" />
              </Pressable>
              <Text style={[styles.previewTitle, textDirectionStyle]}>{tr('تفاصيل المنتج', 'Product Details')}</Text>
            </View>

            {selectedProduct ? (
              <>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={[styles.previewImagesRow, { flexDirection: isRTL ? 'row-reverse' : 'row' }]}
                >
                  {(selectedProduct.images?.length
                    ? selectedProduct.images
                    : [{ id: 'placeholder', imageUrl: '' }]
                  ).map((image) => {
                    const src = api.resolveAssetUrl(image.imageUrl);
                    return src ? (
                      <Image key={image.id} source={{ uri: src }} style={styles.previewImage} resizeMode="cover" />
                    ) : (
                      <View key={image.id} style={styles.previewImagePlaceholder} />
                    );
                  })}
                </ScrollView>

                <Text style={[styles.previewName, textDirectionStyle]}>{selectedProduct.name}</Text>
                <Text style={[styles.previewMeta, textDirectionStyle]}>{tr('التصنيف', 'Category')}: {selectedProduct.category?.nameAr || '-'}</Text>
                <Text style={[styles.previewMeta, textDirectionStyle]}>{tr('السوق', 'Market')}: {selectedProduct.market?.name || '-'}</Text>
                <Text style={[styles.previewMeta, textDirectionStyle]}>{selectedProduct.description || tr('منتج طازج بجودة عالية.', 'Fresh product with premium quality.')}</Text>
                <Text style={[styles.previewPrice, textDirectionStyle]}>
                  {formatSAR(Number(selectedProduct.price))} / {selectedProduct.unit}
                </Text>

                <AppButton
                  label={tr('إضافة إلى السلة', 'Add to Cart')}
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
    borderColor: '#bbf7d0',
    gap: 8,
  },
  offerTag: {
    alignSelf: 'flex-end',
    backgroundColor: '#dcfce7',
    color: '#166534',
    fontWeight: '800',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  offerImage: {
    width: '100%',
    height: 140,
    borderRadius: 12,
    backgroundColor: '#ecfdf3',
  },
  offerTitle: {
    color: theme.colors.text,
    fontWeight: '900',
    fontSize: 16,
  },
  offerDesc: {
    color: theme.colors.textMuted,
  },
  searchWrap: {
    gap: 8,
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#bbf7d0',
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
  filtersRow: {
    gap: 8,
    flexWrap: 'wrap',
  },
  filterChip: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 7,
    backgroundColor: 'rgba(255,255,255,0.9)',
  },
  filterChipActive: {
    backgroundColor: '#2f9e44',
    borderColor: '#2f9e44',
  },
  filterText: {
    color: '#166534',
    fontWeight: '700',
    fontSize: 12,
  },
  filterTextActive: {
    color: '#ffffff',
  },
  rowBetween: {
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countText: {
    color: '#166534',
    fontWeight: '700',
  },
  emptyText: {
    color: '#4b6a5a',
    marginBottom: 2,
  },
  toggleBtn: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
    backgroundColor: '#2f9e44',
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
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewTitle: {
    color: '#0f2f3d',
    fontWeight: '900',
    fontSize: 17,
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
    flexDirection: 'row',
    gap: 8,
  },
  previewImage: {
    width: 220,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
  },
  previewImagePlaceholder: {
    width: 220,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
  },
  previewName: {
    color: '#0f2f3d',
    fontWeight: '900',
    fontSize: 18,
  },
  previewMeta: {
    color: '#4a6572',
  },
  previewPrice: {
    color: '#0f766e',
    fontWeight: '900',
    fontSize: 16,
  },
});
