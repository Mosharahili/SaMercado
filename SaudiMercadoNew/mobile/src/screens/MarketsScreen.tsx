import React from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { theme } from '@theme/theme';

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

export const MarketsScreen = () => {
  // Mock data
  const markets: Market[] = [
    {
      id: '1',
      name: 'سوق الرياض المركزي',
      region: 'الرياض',
      description: 'أفضل الأسواق في الرياض مع مجموعة واسعة من الخضار والفواكه الطازجة',
      imageUrl: 'https://via.placeholder.com/300x200',
      vendorCount: 25,
      operatingHours: '6:00 - 18:00',
      priceRange: 'منخفض - متوسط',
    },
    {
      id: '2',
      name: 'سوق جدة التجاري',
      region: 'جدة',
      description: 'سوق متخصص في المنتجات العضوية والطازجة',
      imageUrl: 'https://via.placeholder.com/300x200',
      vendorCount: 18,
      operatingHours: '7:00 - 19:00',
      priceRange: 'متوسط - مرتفع',
    },
  ];

  const renderMarketCard = ({ item }: { item: Market }) => (
    <TouchableOpacity style={styles.marketCard}>
      <Image source={{ uri: item.imageUrl }} style={styles.marketImage} />
      <View style={styles.marketInfo}>
        <Text style={styles.marketName}>{item.name}</Text>
        <Text style={styles.marketRegion}>{item.region}</Text>
        <Text style={styles.marketDescription}>{item.description}</Text>
        <View style={styles.marketStats}>
          <Text style={styles.marketStat}>{item.vendorCount} بائع</Text>
          <Text style={styles.marketStat}>{item.operatingHours}</Text>
          <Text style={styles.marketStat}>{item.priceRange}</Text>
        </View>
        <TouchableOpacity style={styles.browseButton}>
          <Text style={styles.browseButtonText}>تصفح السوق</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>الأسواق</Text>
      <FlatList
        data={markets}
        renderItem={renderMarketCard}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  title: {
    fontSize: theme.typography.fontSize.xl,
    fontWeight: theme.typography.fontWeight.bold,
    color: theme.colors.text,
    textAlign: 'center',
    padding: theme.spacing.lg,
  },
  list: {
    padding: theme.spacing.md,
  },
  marketCard: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.borderRadius.lg,
    marginBottom: theme.spacing.md,
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
    marginBottom: theme.spacing.sm,
  },
  marketDescription: {
    fontSize: theme.typography.fontSize.sm,
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.md,
  },
  marketStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.md,
  },
  marketStat: {
    fontSize: theme.typography.fontSize.xs,
    color: theme.colors.textSecondary,
  },
  browseButton: {
    backgroundColor: theme.colors.primary,
    padding: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    alignItems: 'center',
  },
  browseButtonText: {
    color: 'white',
    fontSize: theme.typography.fontSize.sm,
    fontWeight: theme.typography.fontWeight.semibold,
  },
});