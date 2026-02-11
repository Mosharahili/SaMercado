import React from 'react';
import { ImageBackground, ScrollView, StyleSheet, Text, View } from 'react-native';
import { Banner } from '@app-types/models';
import { api } from '@api/client';
import { theme } from '@theme/theme';

const fallbackImages = [
  'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1518843875459-f738682238a6?auto=format&fit=crop&w=1080&q=80',
  'https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=1080&q=80',
];

export const BannerCarousel = ({ banners }: { banners: Banner[] }) => {
  const source = banners.length
    ? banners.map((banner) => ({
        id: banner.id,
        title: banner.title,
        description: banner.description,
        imageUrl: api.resolveAssetUrl(banner.imageUrl),
      }))
    : fallbackImages.map((imageUrl, index) => ({ id: `fallback-${index}`, title: 'عرض اليوم', description: 'أجود المنتجات بأسعار خاصة', imageUrl }));

  return (
    <ScrollView horizontal pagingEnabled showsHorizontalScrollIndicator={false} style={styles.wrap}>
      {source.map((banner) => (
        <ImageBackground key={banner.id} source={{ uri: banner.imageUrl }} style={styles.slide} imageStyle={styles.image}>
          <View style={styles.overlay}>
            <Text style={styles.title}>{banner.title}</Text>
            {!!banner.description && <Text style={styles.desc}>{banner.description}</Text>}
          </View>
        </ImageBackground>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  wrap: {
    borderRadius: theme.radius.lg,
    overflow: 'hidden',
    maxHeight: 190,
  },
  slide: {
    width: 320,
    height: 180,
    marginLeft: theme.spacing.sm,
    justifyContent: 'flex-end',
  },
  image: {
    borderRadius: theme.radius.lg,
  },
  overlay: {
    backgroundColor: 'rgba(5, 46, 22, 0.56)',
    borderBottomLeftRadius: theme.radius.lg,
    borderBottomRightRadius: theme.radius.lg,
    padding: theme.spacing.md,
  },
  title: {
    color: 'white',
    fontSize: 17,
    fontWeight: '800',
    textAlign: 'right',
  },
  desc: {
    color: '#dcfce7',
    textAlign: 'right',
    marginTop: 4,
    fontSize: 12,
  },
});
