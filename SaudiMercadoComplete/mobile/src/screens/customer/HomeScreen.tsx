import React, { useEffect, useMemo, useState } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { AppButton } from '@components/AppButton';
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

export const HomeScreen = ({ navigation }: any) => {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [markets, setMarkets] = useState<Market[]>([]);
  const [popup, setPopup] = useState<Popup | null>(null);
  const [popupVisible, setPopupVisible] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const [bannerRes, marketRes, popupRes] = await Promise.all([
          api.get<{ banners: Banner[] }>('/banners/active?placement=HOME_HERO'),
          api.get<{ markets: Market[] }>('/markets'),
          api.get<{ popups: Popup[] }>('/popups/active?pageKey=home&isLoggedIn=true'),
        ]);

        setBanners(bannerRes.banners || []);
        setMarkets((marketRes.markets || []).slice(0, 4));

        if (popupRes.popups?.length) {
          setPopup(popupRes.popups[0]);
          setPopupVisible(true);
        }
      } catch (_error) {
        setBanners(mockBanners);
        setMarkets(mockMarkets);
      }
    };

    load();
  }, []);

  const marketCards = useMemo(() => (markets.length ? markets : mockMarkets), [markets]);

  return (
    <ScreenContainer>
      <AppHeader title="سعودي ميركادو" subtitle="SaudiMercado" />

      <BannerCarousel banners={banners.length ? banners : mockBanners} />

      <View style={styles.heroCard}>
        <Text style={styles.heroTitle}>اطلب خضارك وفواكهك مباشرة من السوق</Text>
        <AppButton label="تصفح الأسواق" onPress={() => navigation?.navigate('Markets')} />
      </View>

      <View style={styles.featureRow}>
        {features.map((feature) => (
          <View key={feature.label} style={styles.featureBox}>
            <MaterialCommunityIcons name={feature.icon} size={22} color={theme.colors.primary} />
            <Text style={styles.featureText}>{feature.label}</Text>
          </View>
        ))}
      </View>

      <Text style={styles.sectionTitle}>أسواق مميزة</Text>
      {marketCards.map((market) => (
        <MarketCard key={market.id} market={market} onBrowse={() => navigation?.navigate('Markets')} />
      ))}

      <View style={styles.bottomBanner}>
        <Text style={styles.bottomTitle}>عرض نهاية الأسبوع</Text>
        <Text style={styles.bottomDesc}>استخدم كود SAUDI10 واحصل على خصم إضافي</Text>
      </View>

      <Modal visible={popupVisible} animationType="fade" transparent>
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>{popup?.title || 'إعلان'}</Text>
            <Text style={styles.modalMessage}>{popup?.message || 'تابع أحدث العروض الحصرية اليوم'}</Text>
            <View style={styles.modalActions}>
              <AppButton
                label={popup?.primaryCtaText || 'تصفح المنتج'}
                onPress={() => setPopupVisible(false)}
              />
              <Pressable onPress={() => setPopupVisible(false)} style={styles.dismissBtn}>
                <Text style={styles.dismissText}>{popup?.secondaryCtaText || 'لاحقًا'}</Text>
              </Pressable>
            </View>
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
    gap: 12,
  },
  heroTitle: {
    textAlign: 'right',
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  featureRow: {
    flexDirection: 'row',
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
    color: '#14532d',
    fontWeight: '700',
    fontSize: 11,
  },
  sectionTitle: {
    color: 'white',
    fontWeight: '900',
    fontSize: 20,
    textAlign: 'right',
  },
  bottomBanner: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#86efac',
    borderRadius: 16,
    padding: 16,
    backgroundColor: 'rgba(20,83,45,0.65)',
  },
  bottomTitle: {
    color: '#bbf7d0',
    textAlign: 'right',
    fontWeight: '800',
  },
  bottomDesc: {
    color: 'white',
    textAlign: 'right',
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 18,
    gap: 8,
  },
  modalTitle: {
    textAlign: 'right',
    fontSize: 20,
    fontWeight: '900',
    color: theme.colors.text,
  },
  modalMessage: {
    textAlign: 'right',
    color: theme.colors.textMuted,
  },
  modalActions: {
    gap: 10,
    marginTop: 10,
  },
  dismissBtn: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  dismissText: {
    color: '#14532d',
    fontWeight: '700',
  },
});
