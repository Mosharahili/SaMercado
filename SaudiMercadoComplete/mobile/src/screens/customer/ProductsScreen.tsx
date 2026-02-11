import React, { useEffect, useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, TextInput, View } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { ProductCard } from '@components/ProductCard';
import { BannerCarousel } from '@components/BannerCarousel';
import { useCart } from '@hooks/useCart';
import { api } from '@api/client';
import { Banner, Category, Market, Product } from '@app-types/models';
import { mockBanners, mockCategories, mockMarkets, mockProducts } from '@utils/mockData';
import { theme } from '@theme/theme';

export const ProductsScreen = () => {
  const { addToCart } = useCart();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [search, setSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [marketId, setMarketId] = useState('');
  const [vendorId, setVendorId] = useState('');
  const [priceMin, setPriceMin] = useState('');
  const [priceMax, setPriceMax] = useState('');

  const [products, setProducts] = useState<Product[]>(mockProducts);
  const [categories, setCategories] = useState<Category[]>(mockCategories);
  const [markets, setMarkets] = useState<Market[]>(mockMarkets);
  const [banners, setBanners] = useState<Banner[]>(mockBanners);

  const fetchData = async () => {
    try {
      const [p, c, m, b] = await Promise.all([
        api.get<{ products: Product[] }>(`/products?search=${encodeURIComponent(search)}&categoryId=${categoryId}&marketId=${marketId}&vendorId=${vendorId}&minPrice=${priceMin}&maxPrice=${priceMax}`),
        api.get<{ categories: Category[] }>('/categories'),
        api.get<{ markets: Market[] }>('/markets'),
        api.get<{ banners: Banner[] }>('/banners/active?placement=PRODUCT_TOP'),
      ]);

      if (p.products?.length) setProducts(p.products);
      if (c.categories?.length) setCategories(c.categories);
      if (m.markets?.length) setMarkets(m.markets);
      if (b.banners?.length) setBanners(b.banners);
    } catch (_error) {
      setProducts(mockProducts);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const filtered = useMemo(() => {
    return products.filter((product) => {
      const matchSearch = search.trim()
        ? product.name.toLowerCase().includes(search.toLowerCase()) ||
          product.market.name.toLowerCase().includes(search.toLowerCase())
        : true;

      const matchCategory = categoryId ? product.category.id === categoryId : true;
      const matchMarket = marketId ? product.market.id === marketId : true;
      const matchVendor = vendorId ? product.vendor.id === vendorId : true;
      const min = priceMin ? Number(priceMin) : 0;
      const max = priceMax ? Number(priceMax) : Number.MAX_SAFE_INTEGER;
      const matchPrice = Number(product.price) >= min && Number(product.price) <= max;

      return matchSearch && matchCategory && matchMarket && matchVendor && matchPrice;
    });
  }, [products, search, categoryId, marketId, vendorId, priceMin, priceMax]);

  return (
    <ScreenContainer>
      <AppHeader title="المنتجات" subtitle="خضار / فواكه / تمور" />

      <BannerCarousel banners={banners} />

      <View style={styles.filterCard}>
        <TextInput
          style={styles.search}
          value={search}
          onChangeText={setSearch}
          placeholder="ابحث عن المنتج أو السوق"
          placeholderTextColor="#6b7280"
          textAlign="right"
        />

        <View style={styles.pickerWrap}>
          <Picker selectedValue={categoryId} onValueChange={setCategoryId}>
            <Picker.Item label="كل الفئات" value="" />
            {categories.map((category) => (
              <Picker.Item key={category.id} label={category.nameAr} value={category.id} />
            ))}
          </Picker>
        </View>

        <View style={styles.pickerWrap}>
          <Picker selectedValue={marketId} onValueChange={setMarketId}>
            <Picker.Item label="كل الأسواق" value="" />
            {markets.map((market) => (
              <Picker.Item key={market.id} label={market.name} value={market.id} />
            ))}
          </Picker>
        </View>

        <View style={styles.inlineInputs}>
          <TextInput style={styles.numberInput} value={priceMin} onChangeText={setPriceMin} keyboardType="numeric" placeholder="أقل سعر" textAlign="center" />
          <TextInput style={styles.numberInput} value={priceMax} onChangeText={setPriceMax} keyboardType="numeric" placeholder="أعلى سعر" textAlign="center" />
        </View>

        <Pressable style={styles.applyBtn} onPress={fetchData}>
          <Text style={styles.applyText}>تطبيق الفلاتر</Text>
        </Pressable>
      </View>

      <View style={styles.rowBetween}>
        <Text style={styles.countText}>عدد المنتجات: {filtered.length}</Text>
        <Pressable onPress={() => setViewMode((v) => (v === 'grid' ? 'list' : 'grid'))} style={styles.toggleBtn}>
          <MaterialCommunityIcons name={viewMode === 'grid' ? 'view-list' : 'view-grid'} size={20} color="white" />
          <Text style={styles.toggleText}>{viewMode === 'grid' ? 'عرض قائمة' : 'عرض شبكي'}</Text>
        </Pressable>
      </View>

      <FlatList
        data={filtered}
        key={viewMode}
        numColumns={viewMode === 'grid' ? 2 : 1}
        keyExtractor={(item) => item.id}
        columnWrapperStyle={viewMode === 'grid' ? { justifyContent: 'space-between' } : undefined}
        contentContainerStyle={{ gap: 10, paddingBottom: 24 }}
        scrollEnabled={false}
        renderItem={({ item, index }) => (
          <View style={{ width: viewMode === 'grid' ? '48.5%' : '100%' }}>
            <ProductCard product={item} onAdd={() => addToCart(item)} />
            {index === 1 ? (
              <View style={styles.inlineBanner}>
                <Text style={styles.inlineBannerText}>عرض خاص داخل الصفحة</Text>
              </View>
            ) : null}
          </View>
        )}
      />
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  filterCard: {
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: 18,
    padding: 12,
    gap: 8,
  },
  search: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  pickerWrap: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    overflow: 'hidden',
  },
  inlineInputs: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  numberInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 10,
    backgroundColor: '#f0fdf4',
    paddingVertical: 10,
  },
  applyBtn: {
    backgroundColor: theme.colors.primary,
    borderRadius: 10,
    alignItems: 'center',
    paddingVertical: 10,
  },
  applyText: {
    color: 'white',
    fontWeight: '800',
  },
  rowBetween: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  countText: {
    color: '#dcfce7',
    fontWeight: '700',
  },
  toggleBtn: {
    flexDirection: 'row-reverse',
    gap: 6,
    alignItems: 'center',
    backgroundColor: '#15803d',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  toggleText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 12,
  },
  inlineBanner: {
    marginTop: 8,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#86efac',
    backgroundColor: 'rgba(240,253,244,0.95)',
  },
  inlineBannerText: {
    textAlign: 'center',
    color: '#14532d',
    fontWeight: '700',
  },
});
