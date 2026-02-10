import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '@theme/theme';

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

interface BoosterBannerSlotProps {
  placement: Banner['placement'];
  banners: Banner[];
  onBannerPress?: (banner: Banner) => void;
}

export const BoosterBannerSlot: React.FC<BoosterBannerSlotProps> = ({
  placement,
  banners,
  onBannerPress,
}) => {
  const filteredBanners = banners.filter(b => b.placement === placement);

  if (filteredBanners.length === 0) return null;

  // For simplicity, show the first banner
  const banner = filteredBanners[0];

  const handlePress = () => {
    onBannerPress?.(banner);
  };

  return (
    <TouchableOpacity style={styles.container} onPress={handlePress}>
      <LinearGradient colors={theme.gradients.primary} style={styles.gradient}>
        <Image source={{ uri: banner.imageUrl }} style={styles.image} />
        <View style={styles.overlay}>
          <Text style={styles.title}>{banner.title}</Text>
          {banner.description && (
            <Text style={styles.description}>{banner.description}</Text>
          )}
          {banner.ctaText && (
            <View style={styles.ctaContainer}>
              <Text style={styles.ctaText}>{banner.ctaText}</Text>
            </View>
          )}
        </View>
      </LinearGradient>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: theme.spacing.md,
    borderRadius: theme.borderRadius.lg,
    overflow: 'hidden',
  },
  gradient: {
    position: 'relative',
  },
  image: {
    width: '100%',
    height: placement === 'HOME_HERO' ? 200 : placement === 'PRODUCT_INLINE' ? 150 : 180,
    resizeMode: 'cover',
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    padding: theme.spacing.md,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: 'white',
    textAlign: 'center',
    marginBottom: theme.spacing.sm,
  },
  description: {
    fontSize: theme.typography.fontSize.md,
    color: 'white',
    textAlign: 'center',
    marginBottom: theme.spacing.md,
  },
  ctaContainer: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
  },
  ctaText: {
    fontSize: theme.typography.fontSize.md,
    fontWeight: theme.typography.fontWeight.semibold,
    color: 'white',
  },
});