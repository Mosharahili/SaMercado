import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  Image,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useNavigation } from '@react-navigation/native';
import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { BoosterBannerSlot } from '@components/BoosterBannerSlot';
import { PopupModal } from '@components/PopupModal';
import { theme } from '@theme/theme';
import { CustomerTabParamList } from '@navigation/tabs/CustomerTabs';

type HomeScreenNavigationProp = BottomTabNavigationProp<CustomerTabParamList, 'Home'>;

interface Market {
  id: string;
  name: string;
  region: string;
  description: string;
  imageUrl: string;
  vendorCount: number;
  operatingHours: string;
  priceRange: string;
}

interface Banner {
  id: string;
  title: string;
  description?: string;
  imageUrl: string;
  ctaText?: string;
  placement: 'HOME_HERO' | 'HOME_MID' | 'PRODUCT_TOP' | 'PRODUCT_INLINE';
  actionType: 'PRODUCT' | 'MARKET' | 'CATEGORY' | 'EXTERNAL_LINK' | 'NONE';
  actionTargetId?: string;
  externalUrl?: string;
}

interface Popup {
  id: string;
  title: string;
  message?: string;
  imageUrl?: string;
  primaryCtaText?: string;
  secondaryCtaText?: string;
}

export const HomeScreen = () => {
  const navigation = useNavigation<HomeScreenNavigationProp>();
  const [popup, setPopup] = useState<Popup | null>(null);
  const [showPopup, setShowPopup] = useState(false);

  // Mock data
  const heroBanners: Banner[] = [
    {
      id: '1',
      title: 'عروض خاصة على الخضار الطازجة',
      description: 'خصم 20% على جميع الخضار',
      imageUrl: 'https://via.placeholder.com/1080x480',
      ctaText: 'تسوق الآن',
      placement: 'HOME_HERO',
      actionType: 'CATEGORY',
      actionTargetId: 'vegetables',
    },
  ];

  const midBanners: Banner[] = [
    {
      id: '2',
      title: 'فواكه موسمية',
      imageUrl: 'https://via.placeholder.com/1080x300',
      ctaText: 'اكتشف',
      placement: 'HOME_MID',
      actionType: 'CATEGORY',
      actionTargetId: 'fruits',
    },
  ];

  const featuredMarkets: Market[] = [
    {
      id: '1',
      name: 'سوق الرياض المركزي',
      region: 'الرياض',
      description: 'أفضل الأسواق في الرياض',
      imageUrl: 'https://via.placeholder.com/300x200',
      vendorCount: 25,
      operatingHours: '6:00 - 18:00',
      priceRange: 'منخفض - متوسط',
    },
  ];

  const features = [
    { icon: '✅', title: 'جودة مضمونة', description: 'منتجات طازجة ومضمونة' },
    { icon: '🚚', title: 'توصيل سريع', description: 'توصيل في نفس اليوم' },
    { icon: '🌱', title: 'طازج يوميًا', description: 'حصاد يومي من المزارع' },
  ];

  useEffect(() => {
    // Show popup on mount
    const mockPopup: Popup = {
      id: '1',
      title: 'مرحباً بك في سعودي ميركادو',
      message: 'اكتشف أفضل الأسواق في الرياض',
      imageUrl: 'https://via.placeholder.com/800x800',
      primaryCtaText: 'تصفح الأسواق',
      secondaryCtaText: 'لاحقاً',
    };
    setPopup(mockPopup);
    setShowPopup(true);
  }, []);

  const handleBannerPress = (banner: Banner) => {
    // Handle banner action
    if (banner.actionType === 'MARKET') {
      navigation.navigate('Markets');
    } else if (banner.actionType === 'CATEGORY') {
      navigation.navigate('Products');
    }
  };

  const handleMarketPress = (market: Market) => {
    // Navigate to market details
  };

  const renderMarketCard = ({ item }: { item: Market }) => (
    <TouchableOpacity style={styles.marketCard} onPress={() => handleMarketPress(item)}>
      <Image source={{ uri: item.imageUrl }} style={styles.marketImage} />
      <View style={styles.marketInfo}>
        <Text style={styles.marketName}>{item.name}</Text>
        <Text style={styles.marketRegion}>{item.region}</Text>
        <Text style={styles.marketDescription}>{item.description}</Text>
        <Text style={styles.marketDetails}>
          {item.vendorCount} بائع • {item.operatingHours} • {item.priceRange}
        </Text>
        <TouchableOpacity style={styles.marketButton}>
          <Text style={styles.marketButtonText}>تصفح السوق</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  const renderFeature = ({ icon, title, description }: typeof features[0]) => (
    <View key={title} style={styles.feature}>
      <Text style={styles.featureIcon}>{icon}</Text>
      <Text style={styles.featureTitle}>{title}</Text>
      <Text style={styles.featureDescription}>{description}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <BoosterBannerSlot
        placement="HOME_HERO"
        banners={heroBanners}
        onBannerPress={handleBannerPress}
      />

      <View style={styles.hero}>
        <Text style={styles.heroTitle}>
          اطلب خضارك وفواكهك مباشرة من السوق
        </Text>
        <TouchableOpacity
          style={styles.ctaButton}
          onPress={() => navigation.navigate('Markets')}
        >
          <Text style={styles.ctaButtonText}>تصفح الأسواق</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.features}>
        {features.map(renderFeature)}
      </View>

      <BoosterBannerSlot
        placement="HOME_MID"
        banners={midBanners}
        onBannerPress={handleBannerPress}
      />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>الأسواق المميزة</Text>
        <FlatList
          data={featuredMarkets}
          renderItem={renderMarketCard}
          keyExtractor={(item) => item.id}
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.marketsList}
        />
      </View>

      <PopupModal
        popup={popup}
        visible={showPopup}
        onClose={() => setShowPopup(false)}
        onPrimaryAction={() => {
          setShowPopup(false);
          navigation.navigate('Markets');
        }}
      />
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  hero: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  heroTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.lg,
  },
  ctaButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
  },
  ctaButtonText: {
    color: 'white',
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.semibold,
  },
  features: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    padding: theme.spacing.lg,
  },
  feature: {
    alignItems: 'center',
    flex: 1,
  },
  featureIcon: {
    fontSize: 30,
    marginBottom: theme.spacing.sm,
  },
  featureTitle: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: theme.colors.text,
    textAlign: 'center',
    marginBottom: theme.spacing.xs,
  },
  featureDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  section: {
    padding: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.md,
  },
  marketsList: {
    paddingRight: theme.spacing.lg,
  },
  marketCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginRight: theme.spacing.md,
    width: 280,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  marketImage: {
    width: '100%',
    height: 150,
    borderTopLeftRadius: theme.borderRadius.lg,
    borderTopRightRadius: theme.borderRadius.lg,
  },
  marketInfo: {
    padding: theme.spacing.md,
  },
  marketName: {
    fontSize: theme.typography.fontSize.lg,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    marginBottom: theme.spacing.xs,
  },
  marketRegion: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.primary,
    marginBottom: theme.spacing.xs,
  },
  marketDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.sm,
  },
  marketDetails: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  marketButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  marketButtonText: {
    color: 'white',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});