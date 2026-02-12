import React, { useEffect, useMemo, useState } from 'react';
import { Image, Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { BannerCarousel } from '@components/BannerCarousel';
import { MarketCard } from '@components/MarketCard';
import { theme } from '@theme/theme';
import { Banner, Market, Popup } from '@app-types/models';
import { api } from '@api/client';
import { mockBanners, mockMarkets } from '@utils/mockData';

const features = [
  { icon: 'check-decagram-outline', label: 'جودة مضمونة' },
  { icon: 'truck-fast-outline', label: 'توصيل سريع' },
  { icon: 'leaf-circle-outline', label: 'طازج يوميًا' },
] as const;

export const HomeScreen = () => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [bottomBanners, setBottomBanners] = useState<Banner[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [popup, setPopup] = useState<Popup | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [bannerRes, bottomBannerRes, marketRes, popupRes] = await Promise.all([
          api.get<{ banners: Banner[] }>('/banners/active?placement=HOME_HERO'),
          api.get<{ banners: Banner[] }>('/banners/active?placement=HOME_BOTTOM'),
          api.get<{ markets: Market[] }>('/markets'),
          api.get<{ popups: Popup[] }>('/popups/active?pageKey=home&isLoggedIn=true'),
        ]);

        setBanners(bannerRes.banners || []);
        setBottomBanners(bottomBannerRes.banners || []);
        setMarkets((marketRes.markets || []).slice(0, 4));

        if (popupRes.popups?.length) {
          setPopup(popupRes.popups[0]);
          setPopupVisible(true);
        }
      } catch (_error) {
        setBanners(mockBanners);
        setBottomBanners([]);
        setMarkets(mockMarkets);
      }
    };

    load();
  }, []);

  const marketCards = useMemo(() => (markets.length ? markets : mockMarkets), [markets]);
  const popupImage = api.resolveAssetUrl(popup?.imageUrl);
  const bottomBanner = bottomBanners[0];
  const bottomImage = api.resolveAssetUrl(bottomBanner?.imageUrl);

  return (
    <ScreenContainer>
      <AppHeader title="سعودي ميركادو" subtitle="SaudiMercado" />

      <BannerCarousel banners={banners.length ? banners : mockBanners} />

      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>اطلب خضارك وفواكهك مباشرة من السوق</Text>
        <Text style={styles.heroHint}>أفضل جودة يومية من أسواقنا المعتمدة في الرياض</Text>
      </View>

      <View style={styles.featureRow}>
        {features.map((feature) => (
          <View key={feature.label} style={styles.featureBox}>
            <MaterialCommunityIcons name={feature.icon} size={22} color={theme.colors.primary} />
            <Text style={styles.featureText}>{feature.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>الأسواق المتاحة</Text>
      {marketCards.map((market) => (
        <MarketCard key={market.id} market={market} />
      ))}

      {bottomBanner ? (
        <View style={styles.bottomBanner}>
          {bottomImage ? <Image source={{ uri: bottomImage }} style={styles.bottomImage} /> : null}
          <Text style={styles.bottomTitle}>{bottomBanner.title}</Text>
          <Text style={styles.bottomDesc}>{bottomBanner.description || 'عرض ترويجي خاص من لوحة الإدارة'}</Text>
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
    backgroundColor: 'rgba(255,255,255,0.95)',
    borderRadius: 18,
    padding: theme.spacing.lg,
    gap: 8,
  },
  heroTitle: {
    textAlign: 'right',
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  heroHint: {
    textAlign: 'right',
    color: theme.colors.textMuted,
  },
  featureRow: {
    flexDirection: 'row-reverse',
    gap: 10,
  },
  featureBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.96)',
    borderRadius: theme.radius.md,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
    gap: 4,
  },
  featureText: {
    color: '#0f766e',
    fontWeight: '700',
    fontSize: 11,
  },
  sectionTitle: {
    color: '#0f2f3d',
    fontWeight: '900',
    fontSize: 20,
    textAlign: 'right',
  },
  bottomBanner: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#67e8f9',
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(34,211,238,0.18)',
  },
  bottomImage: {
    width: '100%',
    height: 120,
    borderRadius: 12,
    marginBottom: 8,
    backgroundColor: '#ecfeff',
  },
  bottomTitle: {
    color: '#0e7490',
    textAlign: 'right',
    fontWeight: '800',
  },
  bottomDesc: {
    color: theme.colors.text,
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
    backgroundColor: '#cffafe',
  },
  modalMessage: {
    textAlign: 'right',
    color: theme.colors.textMuted,
  },
  dismissBtn: {
    alignItems: 'center',
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#ecfeff',
  },
  dismissText: {
    color: '#0f766e',
    fontWeight: '700',
  },
});
