import React, { useEffect, useMemo, useState } from 'react';
import { Image, ImageBackground, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { BannerCarousel } from '@components/BannerCarousel';
import { theme } from '@theme/theme';
import { Banner, Market, Popup, Product } from '@app-types/models';
import { api } from '@api/client';
import { formatSAR } from '@utils/format';
import { useCart } from '@hooks/useCart';

const featureItems = [
  { icon: 'leaf-circle-outline', label: 'طازج يوميًا' },
  { icon: 'truck-fast-outline', label: 'توصيل سريع' },
  { icon: 'check-decagram-outline', label: 'جودة مضمونة' },
] as const;

const pickRandomProducts = (products: Product[], count: number) => {
  const cloned = [...products];
  for (let i = cloned.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [cloned[i], cloned[j]] = [cloned[j], cloned[i]];
  }
  return cloned.slice(0, Math.min(count, cloned.length));
};

export const HomeScreen = () => {
  const { addToCart } = useCart();
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bottomBanners, setBottomBanners] = useState<Banner[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [popup, setPopup] = useState<Popup | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [bannerRes, bottomBannerRes, marketRes, productRes, popupRes] = await Promise.all([
          api.get<{ banners: Banner[] }>('/banners/active?placement=HOME_HERO'),
          api.get<{ banners: Banner[] }>('/banners/active?placement=HOME_BOTTOM'),
          api.get<{ markets: Market[] }>('/markets'),
          api.get<{ products: Product[] }>('/products'),
          api.get<{ popups: Popup[] }>('/popups/active?pageKey=home&isLoggedIn=true'),
        ]);

        const allProducts = productRes.products || [];
        setBanners(bannerRes.banners || []);
        setBottomBanners(bottomBannerRes.banners || []);
        setMarkets(marketRes.markets || []);
        setFeaturedProducts(pickRandomProducts(allProducts, 5));

        if (popupRes.popups?.length) {
          setPopup(popupRes.popups[0]);
          setPopupVisible(true);
        }
      } catch {
        setBanners([]);
        setBottomBanners([]);
        setMarkets([]);
        setFeaturedProducts([]);
      }
    };

    load();
  }, []);

  const popupImage = api.resolveAssetUrl(popup?.imageUrl);
  const bottomBanner = bottomBanners[0];
  const bottomImage = api.resolveAssetUrl(bottomBanner?.imageUrl);

  const displayMarkets = useMemo(() => markets, [markets]);

  return (
    <ScreenContainer>
      <AppHeader title="سعودي ميركادو" subtitle="SaudiMercado" />

      <ImageBackground
        source={require('../../../assets/home-hero-preview.png')}
        style={styles.heroBackground}
        imageStyle={styles.heroBackgroundImage}
      >
        <LinearGradient colors={['rgba(20,83,45,0.72)', 'rgba(22,101,52,0.60)']} style={styles.heroCard}>
          <Text style={styles.heroBrand}>Saudi Mercado</Text>
          <Text style={styles.heroTitle}>اطلب خضارك وفواكهك مباشرة من السوق</Text>
          <Text style={styles.heroHint}>منصة سعودية تربطك بأسواق الخضار والفواكه في الرياض، بتجربة سريعة ومنظمة وجودة يومية.</Text>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.featureRow}>
        {featureItems.map((feature) => (
          <View key={feature.label} style={styles.featureBox}>
            <MaterialCommunityIcons name={feature.icon} size={20} color="#1b5e20" />
            <Text style={styles.featureText}>{feature.label}</Text>
          </View>
        ))}
      </View>

      {banners.length ? <BannerCarousel banners={banners} /> : null}

      <Text style={styles.sectionTitle}>اسواق الرياض</Text>
      <Text style={styles.sectionHint}>الأسواق المعتمدة التي نعمل معها داخل مدينة الرياض.</Text>
      <View style={styles.marketGrid}>
        {displayMarkets.map((market) => {
          const image = api.resolveAssetUrl(market.imageUrl);
          return (
            <View key={market.id} style={styles.marketCard}>
              {image ? (
                <Image source={{ uri: image }} style={styles.marketImage} resizeMode="cover" />
              ) : (
                <Image source={require('../../../assets/icon.png')} style={styles.marketImage} resizeMode="cover" />
              )}
              <Text style={styles.marketName}>{market.name}</Text>
              <Text style={styles.marketInfo}>{market.description || 'سوق موثوق بمنتجات يومية طازجة.'}</Text>
            </View>
          );
        })}
      </View>

      <Text style={styles.bestTitle}>افضل الخضار والفواكه</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productRow}>
        {featuredProducts.map((product) => {
          const image = api.resolveAssetUrl(product.images?.[0]?.imageUrl);
          return (
            <View key={product.id} style={styles.productCard}>
              <Image
                source={image ? { uri: image } : require('../../../assets/icon.png')}
                style={styles.productImage}
                resizeMode="cover"
              />
              <Text numberOfLines={2} style={styles.productName}>
                {product.name}
              </Text>
              <Text style={styles.productPrice}>{formatSAR(Number(product.price))}</Text>
              <Pressable style={styles.addBtn} onPress={() => addToCart(product)}>
                <MaterialCommunityIcons name="cart-plus" size={16} color="#ffffff" />
                <Text style={styles.addBtnText}>أضف للسلة</Text>
              </Pressable>
            </View>
          );
        })}
      </ScrollView>

      {bottomBanner ? (
        <View style={styles.bottomBanner}>
          {bottomImage ? <Image source={{ uri: bottomImage }} style={styles.bottomImage} resizeMode="cover" /> : null}
          <Text style={styles.bottomTitle}>{bottomBanner.title}</Text>
          <Text style={styles.bottomDesc}>{bottomBanner.description || 'عروض يومية على أفضل المنتجات'}</Text>
        </View>
      ) : null}

      <Modal visible={popupVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{popup?.title || 'إعلان'}</Text>
            {popupImage ? <Image source={{ uri: popupImage }} style={styles.modalImage} resizeMode="cover" /> : null}
            <Text style={styles.modalMessage}>{popup?.message || 'تابع أحدث العروض الحصرية اليوم'}</Text>
            <Pressable onPress={() => setPopupVisible(false)} style={styles.dismissBtn}>
              <Text style={styles.dismissText}>{popup?.secondaryCtaText || 'إغلاق'}</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  heroBackground: {
    borderRadius: 20,
    overflow: 'hidden',
  },
  heroBackgroundImage: {
    borderRadius: 20,
  },
  heroCard: {
    borderRadius: 20,
    padding: 14,
    minHeight: 182,
    justifyContent: 'flex-end',
    gap: 5,
  },
  heroBrand: {
    textAlign: 'right',
    color: '#dcfce7',
    fontWeight: '700',
    fontSize: 12,
  },
  heroTitle: {
    textAlign: 'right',
    color: '#ffffff',
    fontWeight: '900',
    fontSize: 20,
  },
  heroHint: {
    textAlign: 'right',
    color: '#e8fbe8',
    lineHeight: 20,
  },
  featureRow: {
    flexDirection: 'row-reverse',
    gap: 8,
  },
  featureBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.94)',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderWidth: 1,
    borderColor: '#dcfce7',
  },
  featureText: {
    color: '#1b5e20',
    fontWeight: '800',
    fontSize: 11,
  },
  sectionTitle: {
    color: '#14532d',
    fontWeight: '900',
    fontSize: 20,
    textAlign: 'right',
  },
  sectionHint: {
    textAlign: 'right',
    color: '#4b6a5a',
    marginTop: -4,
  },
  marketGrid: {
    gap: 10,
  },
  marketCard: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: '#dcfce7',
    gap: 8,
    ...theme.shadow.card,
  },
  marketImage: {
    width: '100%',
    height: 132,
    borderRadius: 12,
    backgroundColor: '#ecfdf3',
  },
  marketName: {
    textAlign: 'right',
    color: '#14532d',
    fontWeight: '900',
    fontSize: 15,
  },
  marketInfo: {
    textAlign: 'right',
    color: '#4b6a5a',
    fontSize: 13,
  },
  bestTitle: {
    textAlign: 'right',
    color: '#166534',
    fontWeight: '900',
    fontSize: 19,
  },
  productRow: {
    flexDirection: 'row-reverse',
    gap: 10,
    paddingBottom: 2,
  },
  productCard: {
    width: 158,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: '#dcfce7',
    gap: 6,
  },
  productImage: {
    width: '100%',
    height: 95,
    borderRadius: 10,
    backgroundColor: '#ecfdf3',
  },
  productName: {
    color: '#14532d',
    fontWeight: '800',
    textAlign: 'right',
    minHeight: 36,
  },
  productPrice: {
    color: '#0f766e',
    fontWeight: '900',
    textAlign: 'right',
  },
  addBtn: {
    borderRadius: 10,
    backgroundColor: '#2f9e44',
    paddingVertical: 8,
    paddingHorizontal: 8,
    flexDirection: 'row-reverse',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 6,
  },
  addBtnText: {
    color: '#ffffff',
    fontWeight: '800',
    fontSize: 12,
  },
  bottomBanner: {
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#dcfce7',
    gap: 8,
  },
  bottomImage: {
    width: '100%',
    height: 130,
    borderRadius: 12,
    backgroundColor: '#ecfdf3',
  },
  bottomTitle: {
    textAlign: 'right',
    color: '#14532d',
    fontWeight: '900',
  },
  bottomDesc: {
    textAlign: 'right',
    color: '#4b6a5a',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    padding: 18,
  },
  modalCard: {
    borderRadius: 16,
    backgroundColor: '#ffffff',
    padding: 14,
    gap: 8,
  },
  modalTitle: {
    textAlign: 'right',
    color: '#14532d',
    fontWeight: '900',
    fontSize: 16,
  },
  modalImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    backgroundColor: '#ecfdf3',
  },
  modalMessage: {
    textAlign: 'right',
    color: '#4b6a5a',
  },
  dismissBtn: {
    alignSelf: 'flex-end',
    borderRadius: 10,
    backgroundColor: '#dcfce7',
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  dismissText: {
    color: '#166534',
    fontWeight: '800',
  },
});
