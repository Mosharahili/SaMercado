import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BoosterBannerSlot } from '@components/BoosterBannerSlot';
import { theme } from '@theme/theme';

interface Product {
  id: string;
  name: string;
  category: 'خضار' | 'فواكه' | 'تمور';
  vendorName: string;
  marketName: string;
  unit: 'كيلو' | 'ربطة' | 'صندوق';
  price: number;
  imageUrl: string;
}

interface Banner {
  id: string;
  title: string;
  imageUrl: string;
  ctaText?: string;
  placement: 'HOME_HERO' | 'HOME_MID' | 'PRODUCT_TOP' | 'PRODUCT_INLINE';
  actionType: 'PRODUCT' | 'MARKET' | 'CATEGORY' | 'EXTERNAL_LINK' | 'NONE';
}

export const ProductsScreen = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchQuery, setSearchQuery] = useState('');

  // Mock data
  const products: Product[] = [
    {
      id: '1',
      name: 'طماطم حمراء',
      category: 'خضار',
      vendorName: 'مزرعة الأمل',
      marketName: 'سوق الرياض',
      unit: 'كيلو',
      price: 5.50,
      imageUrl: 'https://via.placeholder.com/200x200',
    },
    {
      id: '2',
      name: 'تفاح أحمر',
      category: 'فواكه',
      vendorName: 'فواكه الجنة',
      marketName: 'سوق جدة',
      unit: 'كيلو',
      price: 8.00,
      imageUrl: 'https://via.placeholder.com/200x200',
    },
  ];

  const topBanners: Banner[] = [
    {
      id: '1',
      title: 'خصومات على الخضار',
      imageUrl: 'https://via.placeholder.com/1080x250',
      ctaText: 'تسوق',
      placement: 'PRODUCT_TOP',
      actionType: 'CATEGORY',
    },
  ];

  const inlineBanners: Banner[] = [
    {
      id: '2',
      title: 'عروض خاصة',
      imageUrl: 'https://via.placeholder.com/1080x250',
      placement: 'PRODUCT_INLINE',
      actionType: 'NONE',
    },
  ];

  const renderProductCard = ({ item }: { item: Product }) => (
    <TouchableOpacity style={[styles.productCard, viewMode === 'list' && styles.productCardList]}>
      <Image source={{ uri: item.imageUrl }} style={styles.productImage} />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>{item.name}</Text>
        <View style={styles.productBadge}>
          <Text style={styles.productBadgeText}>{item.category}</Text>
        </View>
        <Text style={styles.productVendor}>{item.vendorName}</Text>
        <Text style={styles.productMarket}>{item.marketName}</Text>
        <Text style={styles.productUnit}>{item.unit}</Text>
        <Text style={styles.productPrice}>ر.س {item.price.toFixed(2)}</Text>
        <TouchableOpacity style={styles.addToCartButton}>
          <Text style={styles.addToCartText}>+</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderInlineBanner = () => (
    <BoosterBannerSlot
      placement="PRODUCT_INLINE"
      banners={inlineBanners}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>المنتجات</Text>
        <TouchableOpacity
          style={styles.viewToggle}
          onPress={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
        >
          <Ionicons
            name={viewMode === 'grid' ? 'list' : 'grid'}
            size={24}
            color={theme.colors.primary}
          />
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color={theme.colors.textSecondary} style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="البحث عن منتج..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
      </View>

      <View style={styles.filters}>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>الفئة</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>السوق</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>البائع</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.filterButton}>
          <Text style={styles.filterButtonText}>السعر</Text>
        </TouchableOpacity>
      </View>

      <BoosterBannerSlot
        placement="PRODUCT_TOP"
        banners={topBanners}
      />

      <FlatList
        data={products}
        renderItem={renderProductCard}
        keyExtractor={(item) => item.id}
        numColumns={viewMode === 'grid' ? 2 : 1}
        contentContainerStyle={styles.productsList}
        ItemSeparatorComponent={renderInlineBanner}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: theme.spacing.lg,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
  },
  viewToggle: {
    padding: theme.spacing.sm,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.md,
    margin: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
  },
  searchIcon: {
    marginRight: theme.spacing.sm,
  },
  searchInput: {
    flex: 1,
    padding: theme.spacing.md,
    fontSize: theme.typography.fontSize.md,
    textAlign: 'right',
  },
  filters: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing.md,
  },
  filterButton: {
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  filterButtonText: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.text,
  },
  productsList: {
    padding: theme.spacing.md,
  },
  productCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    margin: theme.spacing.xs,
    flex: 1,
    maxWidth: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  productCardList: {
    flexDirection: 'row',
    maxWidth: '100%',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  productInfo: {
    padding: theme.spacing.sm,
    position: 'relative',
  },
  productName: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  productBadge: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xs,
    paddingVertical: 2,
    borderRadius: theme.borderRadius.sm,
    alignSelf: 'flex-start',
    marginBottom: theme.spacing.xs,
  },
  productBadgeText: {
    fontSize: theme.typography.fontSize.xs,
    color: 'white',
  },
  productVendor: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  productMarket: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  productUnit: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
  },
  productPrice: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.primary,
    marginTop: theme.spacing.xs,
  },
  addToCartButton: {
    position: 'absolute',
    top: theme.spacing.sm,
    left: theme.spacing.sm,
    backgroundColor: theme.colors.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addToCartText: {
    color: 'white',
    fontSize: 18,
    fontWeight: theme.typography.fontWeight.bold,
  },
});