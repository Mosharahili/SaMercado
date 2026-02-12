import React, { useEffect, useMemo, useState } from 'react';
import { Image, Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { BannerCarousel } from '@components/BannerCarousel';
import { theme } from '@theme/theme';
import { Banner, Market, Popup, Product } from '@app-types/models';
import { api } from '@api/client';
import { mockProducts } from '@utils/mockData';
import { formatSAR } from '@utils/format';

const riyadhMarkets = [
  {
    id: 'riyadh-1',
    name: 'اسواق عتيقة المركزية للخضار والفواكة',
    info: 'سوق مركزي يومي بجودة عالية وأسعار منافسة',
  },
  {
    id: 'riyadh-2',
    name: 'سوق غرب الرياض للخضار والفاكهة',
    info: 'منتجات طازجة مباشرة من موردين معتمدين',
  },
  {
    id: 'riyadh-3',
    name: 'سوق العزيزية الرياض للخضار والفاكهة',
    info: 'تشكيلة متنوعة تناسب الطلب اليومي للعائلات',
  },
  {
    id: 'riyadh-4',
    name: 'سوق شمال الرياض للخضار والفاكهة',
    info: 'خيارات موسمية ممتازة وخدمة موثوقة',
  },
];

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
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bottomBanners, setBottomBanners] = useState<Banner[]>([]);
  const [apiMarkets, setApiMarkets] = useState<Market[]>([]);
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

        const allProducts = productRes.products?.length ? productRes.products : mockProducts;
        setBanners(bannerRes.banners || []);
        setBottomBanners(bottomBannerRes.banners || []);
        setApiMarkets(marketRes.markets || []);
        setFeaturedProducts(pickRandomProducts(allProducts, 5));

        if (popupRes.popups?.length) {
          setPopup(popupRes.popups[0]);
          setPopupVisible(true);
        }
      } catch {
        setBanners([]);
        setBottomBanners([]);
        setApiMarkets([]);
        setFeaturedProducts(pickRandomProducts(mockProducts, 5));
      }
    };

    load();
  }, []);

  const marketImages = useMemo(
    () => apiMarkets.map((market) => api.resolveAssetUrl(market.imageUrl)).filter(Boolean),
    [apiMarkets]
  );

  const displayMarkets = useMemo(
    () =>
      riyadhMarkets.map((market, index) => ({
        ...market,
        imageUrl: marketImages.length ? marketImages[index % marketImages.length] : '',
      })),
    [marketImages]
  );

  const popupImage = api.resolveAssetUrl(popup?.imageUrl);
  const bottomBanner = bottomBanners[0];
  const bottomImage = api.resolveAssetUrl(bottomBanner?.imageUrl);
  const heroImage = api.resolveAssetUrl(featuredProducts[0]?.images?.[0]?.imageUrl);

  return (
    <ScreenContainer>
      <AppHeader title="سعودي ميركادو" subtitle="SaudiMercado" />

      <LinearGradient colors={theme.gradients.hero} style={styles.heroCard}>
        <View style={styles.heroTextWrap}>
          <Text style={styles.heroBrand}>Saudi Mercado</Text>
          <Text style={styles.heroTitle}>اطلب خضارك وفواكهك مباشرة من السوق</Text>
          <Text style={styles.heroHint}>
            منصة سعودية تربطك بأسواق الخضار والفواكه في الرياض، بتجربة سريعة ومنظمة وجودة يومية.
          </Text>
        </View>
        <Image source={heroImage ? { uri: heroImage } : require('../../../assets/icon.png')} style={styles.heroImage} />
      </LinearGradient>

      <View style={styles.featureRow}>
        {featureItems.map((feature) => (
          <View key={feature.label} style={styles.featureBox}>
            <MaterialCommunityIcons name={feature.icon} size={20} color="#1b5e20" />
            <Text style={styles.featureText}>{feature.label}</Text>
          </View>
        ))}
      </View>

      {banners.length ? <BannerCarousel banners={banners} /> : null}

      <Text style={styles.sectionTitle}>ALriyadh store</Text>
      <View style={styles.marketGrid}>
        {displayMarkets.map((market) => (
          <View key={market.id} style={styles.marketCard}>
            <Image source={market.imageUrl ? { uri: market.imageUrl } : require('../../../assets/icon.png')} style={styles.marketImage} />
            <Text style={styles.marketName}>{market.name}</Text>
            <Text style={styles.marketInfo}>{market.info}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.bestTitle}>افضل الخضار والفواكه</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.productRow}>
        {featuredProducts.map((product) => {
          const image = api.resolveAssetUrl(product.images?.[0]?.imageUrl);
          return (
            <View key={product.id} style={styles.productCard}>
              <Image source={image ? { uri: image } : require('../../../assets/icon.png')} style={styles.productImage} />
              <Text numberOfLines={2} style={styles.productName}>
                {product.name}
              </Text>
              <Text style={styles.productPrice}>{formatSAR(Number(product.price))}</Text>
            </View>
          );
        })}
      </ScrollView>

      {bottomBanner ? (
        <View style={styles.bottomBanner}>
          {bottomImage ? <Image source={{ uri: bottomImage }} style={styles.bottomImage} /> : null}
          <Text style={styles.bottomTitle}>{bottomBanner.title}</Text>
          <Text style={styles.bottomDesc}>{bottomBanner.description || 'عروض يومية على أفضل المنتجات'}</Text>
        </View>
      ) : null}

      <Modal visible={popupVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{popup?.title || 'إعلان'}</Text>
            {popupImage ? <Image source={{ uri: popupImage }} style={styles.modalImage} /> : null}
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
  heroCard: {
    borderRadius: 20,
    padding: 14,
    flexDirection: 'row-reverse',
    alignItems: 'center',
    gap: 12,
  },
  heroTextWrap: {
    flex: 1,
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
  heroImage: {
    width: 108,
    height: 108,
    borderRadius: 18,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.4)',
    backgroundColor: 'rgba(255,255,255,0.08)',
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
    height: 128,
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
    width: 138,
    backgroundColor: 'rgba(255,255,255,0.97)',
    borderRadius: 14,
    padding: 8,
    borderWidth: 1,
    borderColor: '#dcfce7',
    gap: 6,
  },
  productImage: {
    width: '100%',
    height: 88,
    borderRadius: 10,
    backgroundColor: '#ecfdf3',
  },
  productName: {
    textAlign: 'right',
    color: '#123524',
    fontWeight: '800',
    minHeight: 35,
    fontSize: 12,
  },
  productPrice: {
    textAlign: 'right',
    color: '#2f9e44',
    fontWeight: '900',
    fontSize: 13,
  },
  bottomBanner: {
    borderWidth: 1,
    borderColor: '#bbf7d0',
    borderRadius: 16,
    padding: 14,
    backgroundColor: 'rgba(34,197,94,0.1)',
  },
  bottomImage: {
    width: '100%',
    height: 118,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#ecfdf3',
  },
  bottomTitle: {
    color: '#166534',
    textAlign: 'right',
    fontWeight: '900',
  },
  bottomDesc: {
    color: '#4b6a5a',
    textAlign: 'right',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 18,
    gap: 10,
  },
  modalTitle: {
    textAlign: 'right',
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.text,
  },
  modalImage: {
    width: '100%',
    height: 170,
    borderRadius: 12,
    backgroundColor: '#dcfce7',
  },
  modalMessage: {
    textAlign: 'right',
    color: theme.colors.textMuted,
  },
  dismissBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#ecfdf3',
  },
  dismissText: {
    color: '#166534',
    fontWeight: '700',
  },
});
