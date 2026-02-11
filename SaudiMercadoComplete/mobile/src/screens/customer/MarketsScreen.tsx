import React, { useEffect, useState } from 'react';
import { RefreshControl, StyleSheet, Text } from 'react-native';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { MarketCard } from '@components/MarketCard';
import { Market } from '@app-types/models';
import { api } from '@api/client';
import { mockMarkets } from '@utils/mockData';

export const MarketsScreen = () => {
  const [markets, setMarkets] = useState<Market[]>(mockMarkets);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMarkets = async () => {
    try {
      const response = await api.get<{ markets: Market[] }>('/markets');
      if (response.markets?.length) {
        setMarkets(response.markets);
      }
    } catch (_error) {
      setMarkets(mockMarkets);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  return (
    <ScreenContainer>
      <AppHeader title="الأسواق" subtitle="تصفح أسواق الجملة في الرياض" />
      <Text style={styles.hint}>اختر السوق المناسب وابدأ التسوق مباشرة من الموردين</Text>

      {markets.map((market) => (
        <MarketCard key={market.id} market={market} />
      ))}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  hint: {
    textAlign: 'right',
    color: '#dcfce7',
    marginBottom: 4,
  },
});
