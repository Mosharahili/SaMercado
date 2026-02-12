import React, { useEffect, useState } from 'react';
import { StyleSheet, Text } from 'react-native';
import { ScreenContainer } from '@components/ScreenContainer';
import { AppHeader } from '@components/AppHeader';
import { MarketCard } from '@components/MarketCard';
import { Market } from '@app-types/models';
import { api } from '@api/client';

export const MarketsScreen = () => {
  const [markets, setMarkets] = useState<Market[]>([]);

  const fetchMarkets = async () => {
    try {
      const response = await api.get<{ markets: Market[] }>('/markets');
      setMarkets(response.markets || []);
    } catch (_error) {
      setMarkets([]);
    }
  };

  useEffect(() => {
    fetchMarkets();
  }, []);

  return (
    <ScreenContainer>
      <AppHeader title="الأسواق" subtitle="الأسواق التي نعمل معها" />
      <Text style={styles.hint}>نعرض لك أسواقنا المعتمدة لمتابعة مصدر المنتجات والجودة.</Text>

      {!markets.length ? <Text style={styles.emptyText}>لا توجد أسواق متاحة حالياً.</Text> : null}
      {markets.map((market) => (
        <MarketCard key={market.id} market={market} />
      ))}
    </ScreenContainer>
  );
};

const styles = StyleSheet.create({
  hint: {
    textAlign: 'right',
    color: '#14532d',
    marginBottom: 4,
  },
  emptyText: {
    textAlign: 'right',
    color: '#4b6a5a',
  },
});
