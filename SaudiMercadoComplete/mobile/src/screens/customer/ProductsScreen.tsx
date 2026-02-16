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
  const visualPad = React.useCallback((value: string) => (isRTL ? `\u200F\u061C\u00A0\u00A0${value}` : value), [isRTL]);
  const textDirectionStyle = {
    textAlign: isRTL ? 'right' : 'left',
    width: '100%',
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
  const categoryItems = useMemo(
    () => {
      const items = [
        { key: 'ALL', label: tr('الكل', 'All') },
        { key: 'DATES', label: tr('تمور', 'Dates') },
        { key: 'VEGETABLES', label: tr('خضار', 'Vegetables') },
        { key: 'FRUITS', label: tr('فواكه', 'Fruits') },
      ];
      return isRTL ? items.reverse() : items;
    },
    [isRTL, tr]
  );

  const topOffer = inlineOffers[0];
  const topOfferImage = api.resolveAssetUrl(topOffer?.imageUrl);

  return (
    <ScreenContainer>
      <AppHeader title={tr('المنتجات', 'Products')} subtitle={tr('تشكيلة يومية طازجة', 'Fresh daily selection')} />

      <BannerCarousel banners={topBanners} />

      {topOffer ? (
        <View style={styles.offerCard}>
          <Text style={styles.offerTag}>{tr('عرض خاص', 'Special Offer')}</Text>
          {topOfferImage ? <Image source={{ uri: topOfferImage }} style={styles.offerImage} resizeMode="cover" /> : null}
          <Text style={[styles.offerTitle, textDirectionStyle]}>{visualPad(topOffer.title)}</Text>
          {!!topOffer.description && <Text style={[styles.offerDesc, textDirectionStyle]}>{visualPad(topOffer.description)}</Text>}
        </View>
      ) : null}

      <View style={styles.searchWrap}>
        <TextInput
          style={[
            styles.searchInput,
            styles.searchInput,
            { },
          ]}
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
        <Pressable
          style={styles.searchBtn}
          onPress={() => {
            setSearch(searchInput);
            fetchProducts(searchInput);
          }}
        >
          <MaterialCommunityIcons name="magnify" size={20} color="white" />
        </Pressable>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filtersRow}>
        {categoryItems.map((item) => {
          const active = categoryFilter === item.key;
          return (
            <Pressable
              key={item.key}
              onPress={() => setCategoryFilter(item.key as 'ALL' | 'VEGETABLES' | 'FRUITS' | 'DATES')}
              style={[styles.filterChip, active ? styles.filterChipActive : null]}
            >
              <Text style={[styles.filterText, active ? styles.filterTextActive : null, textDirectionStyle]}>{item.label}</Text>
            </Pressable>
          );
        })}
      </ScrollView>

      <View style={styles.rowBetween}>
        <Text style={[styles.countText, textDirectionStyle, styles.countText]}>
          {tr('عدد المنتجات', 'Products count')}: {visibleProducts.length}
        </Text>
        <Pressable onPress={() => setViewMode((v) => (v === 'grid' ? 'list' : 'grid'))} style={styles.toggleBtn}>
          <MaterialCommunityIcons
            name={viewMode === 'grid' ? 'view-list' : 'view-grid'}
            size={20}
            color="white"
            style={styles.toggleIcon}
          />
          <Text style={[styles.toggleText, { }]}>
            {viewMode === 'grid' ? tr('عرض قائمة', 'List View') : tr('عرض شبكي', 'Grid View')}
          </Text>
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
            <View style={styles.previewHeader}>
              <Text style={[styles.previewTitle, textDirectionStyle]}>{tr('تفاصيل المنتج', 'Product Details')}</Text>
              <Pressable onPress={() => setSelectedProduct(null)} style={[styles.previewClose, styles.previewClosePosition]}>
                <MaterialCommunityIcons name="close" size={20} color="#0f2f3d" />
              </Pressable>
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
                      <Image key={image.id} source={{ uri: src }} style={styles.previewImage} resizeMode="cover" />
                    ) : (
                      <View key={image.id} style={styles.previewImagePlaceholder} />
                    );
                  })}
                </ScrollView>

                <Text style={[styles.previewName, textDirectionStyle]}>{visualPad(selectedProduct.name)}</Text>
                <Text style={[styles.previewMeta, textDirectionStyle]}>
                  {tr('التصنيف', 'Category')}: {selectedProduct.category?.nameAr ? visualPad(selectedProduct.category.nameAr) : '-'}
                </Text>
                <Text style={[styles.previewMeta, textDirectionStyle]}>
                  {tr('السوق', 'Market')}: {selectedProduct.market?.name ? visualPad(selectedProduct.market.name) : '-'}
                </Text>
                <Text style={[styles.previewMeta, textDirectionStyle]}>
                  {selectedProduct.description ? visualPad(selectedProduct.description) : tr('منتج طازج بجودة عالية.', 'Fresh product with premium quality.')}
                </Text>
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
    position: 'relative',
  },
  searchInput: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.95)',
    paddingVertical: 11,
  },
  searchInput: {
    paddingStart: 56,
    paddingEnd: 12,
  },
  searchBtn: {
    position: 'absolute',
    top: 0,
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: theme.colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtn: {
    end: 0,
  },
  filtersRow: {
    gap: 8,
    paddingVertical: 2,
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
    minHeight: 40,
    justifyContent: 'center',
    position: 'relative',
  },
  countText: {
    color: '#166534',
    fontWeight: '700',
    width: '100%',
  },
  countText: {
    paddingStart: 118,
  },
  emptyText: {
    color: '#4b6a5a',
    marginBottom: 2,
  },
  toggleBtn: {
    position: 'absolute',
    top: 0,
    backgroundColor: '#2f9e44',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
    minHeight: 38,
    justifyContent: 'center',
  },
  toggleBtn: {
    end: 0,
  },
  toggleIcon: {
    position: 'absolute',
    top: 9,
  },
  toggleIcon: {
    end: 8,
  },
  toggleText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
    paddingHorizontal: 24,
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
    minHeight: 34,
    justifyContent: 'center',
    position: 'relative',
  },
  previewTitle: {
    color: '#0f2f3d',
    fontWeight: '900',
    fontSize: 17,
    width: '100%',
  },
  previewClose: {
    position: 'absolute',
    top: 0,
    width: 34,
    height: 34,
    borderRadius: 999,
    backgroundColor: '#ecfeff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  previewClosePosition: {
    start: 0,
  },
  previewImagesRow: {
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
