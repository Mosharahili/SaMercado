import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { MarketCard } from '@components/MarketCard';
import { Market } from '@app-types/models';
import { api } from '@api/client';
import { mockMarkets } from '@utils/mockData';

export const MarketsScreen = () => {
  const [markets, setMarkets] = useState<Market[]>(mockMarkets);

  const fetchMarkets = async () => {
    try {
      const response = await api.get<{ markets: Market[] }>('/markets');
      if (response.markets?.length) {
        setMarkets(response.markets);
      } else {
        setMarkets([]);
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
      <AppHeader title="الأسواق" subtitle="الأسواق التي نعمل معها" />
      <Text style={styles.hint}>نعرض لك أسواقنا المعتمدة لمتابعة مصدر المنتجات والجودة.</Text>

      {markets.map((market) => (
        <MarketCard key={market.id} market={market} />
      ))}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  hint: {
    textAlign: 'right',
    color: '#155e75',
    marginBottom: 4,
  },
});
